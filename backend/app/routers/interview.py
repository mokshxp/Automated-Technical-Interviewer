from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql.expression import func
from pydantic import BaseModel
from ..database import get_db
from ..models import InterviewSession, Question, CodingProblem
from ..services.llm_service import generate_text
from ..services.code_executor import execute_code, execute_with_test_cases
from ..services.interview_flow import get_round_state, advance_round_state, submit_round
from gtts import gTTS
import os
import uuid
import shutil
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/interview", tags=["interview"])

class ChatRequest(BaseModel):
    message: str

class CodeRequest(BaseModel):
    language: str
    code: str

class RoundSubmission(BaseModel):
    data: dict

@router.get("/{session_id}/state")
async def get_interview_state(session_id: int, db: AsyncSession = Depends(get_db)):
    try:
        state = await get_round_state(session_id, db)
        if "error" in state:
            raise HTTPException(status_code=404, detail=state["error"])
        return state
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        try:
            with open("backend_error.log", "w") as f:
                f.write(error_msg)
        except:
            pass
        print(f"CRITICAL ERROR in get_interview_state: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/{session_id}/advance")
async def advance_interview_round(session_id: int, db: AsyncSession = Depends(get_db)):
    state = await advance_round_state(session_id, db)
    if "error" in state:
        raise HTTPException(status_code=404, detail=state["error"])
    return state

@router.post("/{session_id}/submit_round")
async def submit_current_round(session_id: int, submission: RoundSubmission, db: AsyncSession = Depends(get_db)):
    result = await submit_round(session_id, submission.data, db)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/{session_id}/questions")
async def get_session_questions(session_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.session_id == session_id))
    questions = result.scalars().all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this session")
    return questions

@router.post("/{session_id}/chat")
async def chat_endpoint(session_id: int, request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Verify session exists
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Chat Logic based on Round
    current_history = session.round_data.get(session.current_round, {}).get("transcript", [])
    current_history.append({"role": "user", "content": request.message})
    
    # Construct System Prompt based on round
    base_prompt = (
        "You are an expert technical interviewer for a top-tier tech company. "
        "Your goal is to assess the candidate's skills thoroughly but fairly. "
        "Keep your responses concise (1-3 sentences) and conversational. "
        "Do not provide the full answer immediately; guide the candidate if they are stuck. "
        "Ask one clear question at a time."
    )
    
    if session.current_round == "tech_1":
        system_prompt = (
            f"{base_prompt} This is the Technical Round I (Data Structures & Algorithms). "
            "Start by asking them to explain their approach to a coding problem (assume context is provided or ask them to solve a standard medium-level DSA problem like 'Merge Intervals' or 'LCA of BST'). "
            "Focus on time/space complexity and edge cases."
        )
    elif session.current_round == "tech_2":
        system_prompt = (
            f"{base_prompt} This is the Technical Round II (System Design & Projects). "
            "Ask them to design a system (e.g., 'Design a URL Shortener' or 'Design Instagram Feed'). "
            "Focus on scalability, database choices, caching, and load balancing. "
            "Alternatively, dig deep into a project from their resume."
        )
    else:
        system_prompt = base_prompt

    full_prompt = f"{system_prompt}\n\nChat History:\n"
    for msg in current_history[-10:]:
        role = "Candidate" if msg['role'] == "user" else "Interviewer"
        full_prompt += f"{role}: {msg['content']}\n"
    full_prompt += "Interviewer:"
    
    ai_response_text = generate_text(full_prompt)
    current_history.append({"role": "ai", "content": ai_response_text})
    
    # Save back to session (Optimization: In production, better to use separate table or append optim)
    if not session.round_data: session.round_data = {}
    if session.current_round not in session.round_data:
        session.round_data[session.current_round] = {}
        
    session.round_data[session.current_round]["transcript"] = current_history
    # Make sure to re-assign to trigger SQL Alchemy change detection for JSON
    session.round_data = dict(session.round_data)
    
    db.add(session)
    await db.commit()
    
    return {"response": ai_response_text}

@router.post("/{session_id}/run_code")
async def run_code_endpoint(session_id: int, request: CodeRequest, db: AsyncSession = Depends(get_db)):
    # Verify session exists
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    execution_result = execute_code(request.language, request.code)
    
    return execution_result

    return execution_result

@router.get("/{session_id}/coding/problem")
async def get_coding_problem(session_id: int, db: AsyncSession = Depends(get_db)):
    # Verify session
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Get a random coding problem (or implement logic to pick specific one)
    # For MVP, picking random medium
    result = await db.execute(select(CodingProblem).order_by(func.random()).limit(1))
    problem = result.scalars().first()
    
    if not problem:
        raise HTTPException(status_code=404, detail="No coding problems found in database")
        
    # Filter out hidden test cases
    public_tests = [tc for tc in problem.test_cases if not tc.get('hidden', False)]
    
    return {
        "problem_id": problem.id,
        "title": problem.title,
        "description": problem.description,
        "starter_code": problem.starter_code,
        "public_test_cases": public_tests
    }

@router.post("/{session_id}/coding/run")
async def run_coding_test(session_id: int, request: CodeRequest, problem_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch problem
    result = await db.execute(select(CodingProblem).where(CodingProblem.id == problem_id))
    problem = result.scalars().first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    # Run against public test cases only
    public_tests = [tc for tc in problem.test_cases if not tc.get('hidden', False)]
    
    execution_result = execute_with_test_cases(request.language, request.code, public_tests)
    return execution_result

@router.post("/{session_id}/coding/submit")
async def submit_coding_round(session_id: int, request: CodeRequest, problem_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch problem
    result = await db.execute(select(CodingProblem).where(CodingProblem.id == problem_id))
    problem = result.scalars().first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    # Run against ALL test cases
    execution_result = execute_with_test_cases(request.language, request.code, problem.test_cases)
    
    output = execution_result.get("output", "")
    passed = "ALL_TESTS_PASSED" in output
    
    # Submit round logic
    submission_data = {
        "type": "oa_coding",
        "code": request.code,
        "last_output": output,
        "passed": passed,
        "problem_id": problem.id
    }
    
    # If passed, we proceed. If failed, we currently allow them to submit anyway? 
    # Usually we block or give score. Let's assume we score it.
    
    result = await submit_round(session_id, submission_data, db)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return {
        "execution_result": execution_result,
        "round_result": result,
        "passed": passed
    }

@router.get("/{session_id}")
async def get_session(session_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

from ..services.results_aggregator import calculate_final_results

@router.get("/{session_id}/results")
async def get_results(session_id: int, db: AsyncSession = Depends(get_db)):
    # Calculate on fly (or fetch if stored)
    results = await calculate_final_results(session_id, db)
    if not results:
        raise HTTPException(status_code=404, detail="Results not found")
    return results

@router.post("/{session_id}/speak")
async def speak_endpoint(session_id: int, audio: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # 1. Save User Audio
    upload_dir = "uploads/audio"
    os.makedirs(upload_dir, exist_ok=True)
    
    # We use webm as it is standard for browser recording
    user_filename = f"{session_id}_{uuid.uuid4()}_user.webm" 
    user_filepath = os.path.join(upload_dir, user_filename)
    
    with open(user_filepath, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    # 2. Process with Gemini (Multimodal)
    try:
        print(f"DEBUG: Starting Gemini processing for {user_filename}")
        # Upload to Gemini File API
        # Note: In a real app, you might want to reuse the file or delete it later
        user_audio_file = genai.upload_file(user_filepath)
        print(f"DEBUG: File uploaded to Gemini: {user_audio_file}")
        
        # Get Chat History (Context)
        result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
        session = result.scalars().first()
        history_context = ""
        if session and session.round_data:
             transcript = session.round_data.get(session.current_round, {}).get("transcript", [])
             history_context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in transcript[-5:]])

        prompt = (
            "You are an expert technical interviewer. "
            "You are conducting a spoken interview. "
            "Listen to the candidate's audio input. "
            "Respond naturally as an interviewer. "
            "If they answered a question, acknowledge it and ask a follow-up or move to the next topic. "
            "Keep your response concise (1-3 sentences) suitable for spoken conversation. "
            f"\n\nContext:\n{history_context}"
        )
        
        print("DEBUG: Generating content with Gemini...")
        model = genai.GenerativeModel("gemini-1.5-flash") # Check model name!
        # gemini-1.5-flash is often safer/faster. gemini-pro-latest might be deprecated or require 1.5.
        # Let's try "gemini-1.5-flash" if this fails, or "gemini-pro".
        result = model.generate_content([prompt, user_audio_file])
        
        ai_text = result.text
        print(f"DEBUG: AI Response: {ai_text}")
        
        # 3. Text to Speech
        tts_filename = f"{session_id}_{uuid.uuid4()}_ai.mp3"
        tts_filepath = os.path.join(upload_dir, tts_filename)
        
        print(f"DEBUG: Generating TTS to {tts_filepath}")
        tts = gTTS(text=ai_text, lang='en')
        tts.save(tts_filepath)
        print("DEBUG: TTS saved successfully")
        
        # Save transcript
        if session:
             if not session.round_data: session.round_data = {}
             if session.current_round not in session.round_data:
                 session.round_data[session.current_round] = {}
             
             # Need to init transcript if not exists
             if "transcript" not in session.round_data[session.current_round]:
                 session.round_data[session.current_round]["transcript"] = []
                 
             current_hist = session.round_data[session.current_round]["transcript"]
             current_hist.append({"role": "user_audio", "content": "(Audio Input)"})
             current_hist.append({"role": "ai", "content": ai_text})
             
             # Force update
             session.round_data[session.current_round]["transcript"] = current_hist
             session.round_data = dict(session.round_data)
             db.add(session)
             await db.commit()
        
        return {
            "text": ai_text,
            "audio_url": f"http://localhost:8000/uploads/audio/{tts_filename}"
        }
        
    except Exception as e:
        print(f"CRITICAL ERROR in /speak: {e}")
        import traceback
        traceback.print_exc()
        # Fallback if Gemini fails (e.g. file upload error)
        raise HTTPException(status_code=500, detail=str(e))
