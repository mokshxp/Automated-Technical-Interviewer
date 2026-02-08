from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql.expression import func
from pydantic import BaseModel
from ..database import get_db
from ..models import InterviewSession, Question, CodingProblem, Candidate
from ..services.llm_service import generate_text
from ..services.code_executor import execute_code, execute_with_test_cases
from ..services.interview_flow import get_round_state, advance_round_state, submit_round
from datetime import datetime
from gtts import gTTS
import os
import uuid
import shutil
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/interviews", tags=["interviews"])

class ChatRequest(BaseModel):
    message: str

class CodeRequest(BaseModel):
    language: str
    code: str

class RoundSubmission(BaseModel):
    data: dict

class CreateSessionRequest(BaseModel):
    resume_id: int

@router.post("/", status_code=201)
async def create_session(request: CreateSessionRequest, db: AsyncSession = Depends(get_db)):
    # Verify resume exists
    result = await db.execute(select(Candidate).where(Candidate.id == request.resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Create NEW Session (Stateless, always new)
    new_session = InterviewSession(
        candidate_id=resume.id,
        status="active",
        current_round="prep_oa",
        start_time=datetime.utcnow()
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)

    # Generate Unique Questions
    # 1. Fetch existing questions for this candidate
    existing_q_result = await db.execute(select(Question).where(Question.candidate_id == resume.id))
    existing_q_objs = existing_q_result.scalars().all()
    existing_questions_text = [q.text for q in existing_q_objs]

    # 2. Generate New Questions
    from ..services.question_generator import generate_mcqs
    new_questions_data = generate_mcqs(resume.resume_text, existing_questions_text)
    
    # 3. Save Questions
    for q_data in new_questions_data:
        q = Question(
            candidate_id=resume.id,
            session_id=new_session.id,
            text=q_data["text"],
            options=q_data["options"],
            correct_answer=q_data["correct_answer"],
            difficulty=q_data.get("difficulty", "medium"),
            tags=q_data.get("tags", [])
        )
        db.add(q)
    
    await db.commit()
    
    return {"session_id": new_session.id, "status": "initialized"}

@router.post("/{session_id}/complete")
async def complete_session(session_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch session
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Calculate Final Results Logic
    from ..services.results_aggregator import calculate_final_results
    final_results = await calculate_final_results(session_id, db)
    
    # Freeze Decision & Score
    decision = final_results.get("overall_status", "Pending")
    final_score = 0
    # Aggregate score from parts
    scores = final_results.get("scores", {})
    final_score = (scores.get("oa_mcq", {}).get("score", 0) + 
                   scores.get("oa_coding", 0) + 
                   scores.get("tech_1", 0) + 
                   scores.get("tech_2", 0)) / 4 # Rough average/sum
                   
    # Snapshot
    resume_result = await db.execute(select(Candidate).where(Candidate.id == session.candidate_id))
    resume = resume_result.scalars().first()
    
    snapshot_data = {
        "resume_analytics": resume.analytics if resume else {},
        "final_results": final_results
    }
    
    from ..models import AnalyticsSnapshot
    snapshot = AnalyticsSnapshot(
        resume_id=session.candidate_id,
        interview_session_id=session.id,
        data=snapshot_data
    )
    db.add(snapshot)
    
    # Update Session with Frozen Data
    session.status = "completed"
    session.end_time = datetime.utcnow()
    session.decision = decision
    session.score = int(final_score)
    session.breakdown = final_results # Freeze the detailed JSON
    
    await db.commit()
    
    return {"message": "Interview completed", "decision": decision}

@router.get("/{session_id}/state")
async def get_interview_state(session_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # Check if completed
        result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
        session = result.scalars().first()
        if session and session.status == "completed":
             return {"status": "completed", "current_round": "completed"}

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

# ... Chat & Code endpoints ...

@router.get("/{session_id}")
async def get_session(session_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/{session_id}/results")
async def get_results(session_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Try to get frozen results first
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status == "completed" and session.breakdown:
        return session.breakdown # Return immutable frozen data
        
    # 2. Else calculate on fly
    from ..services.results_aggregator import calculate_final_results
    results = await calculate_final_results(session_id, db)
    if not results:
        raise HTTPException(status_code=404, detail="Results not found")
    return results

@router.get("/resume/{resume_id}")
async def get_resume_sessions(resume_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.candidate_id == resume_id)
        .order_by(InterviewSession.start_time.desc())
    )
    sessions = result.scalars().all()
    return sessions

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
