from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
import shutil
import os
from ..services.resume_parser import parse_resume
from ..services.question_generator import generate_mcqs
from ..models import Candidate, Question, InterviewSession, User
from ..database import get_db
from pydantic import BaseModel
from typing import List
from .auth import get_current_user

router = APIRouter(prefix="/candidates", tags=["candidates"])
# Login fix verified

class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str
    resume_url: str
    created_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CandidateResponse])
async def get_my_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    return result.scalars().all()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_candidate(
    resume: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        # Check if file is PDF
        if resume.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Save Resume File
        upload_dir = "uploads/resumes"
        os.makedirs(upload_dir, exist_ok=True)
        file_location = f"{upload_dir}/{resume.filename}"
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
            
        # Parse Resume
        try:
            resume_text = parse_resume(file_location)
        except Exception as e:
            print(f"Error parsing resume: {e}")
            resume_text = ""
        
        # Generate Questions
        generated_questions_data = generate_mcqs(resume_text)
        
        # Check if candidate exists (Upsert Logic)
        result = await db.execute(select(Candidate).where(Candidate.email == current_user.email))
        existing = result.scalars().first()
        
        if existing:
            # Update existing
            existing.resume_url = file_location
            existing.resume_text = resume_text
            existing.name = current_user.full_name # Update name if changed
            
            # Delete old questions to avoid duplicates/stale data
            from sqlalchemy import delete
            await db.execute(delete(Question).where(Question.candidate_id == existing.id))
            
            # Delete old session to allow fresh start
            await db.execute(delete(InterviewSession).where(InterviewSession.candidate_id == existing.id))

            # Note: We are appending questions. In production, might want to replace.
            new_candidate = existing
        else:
            # Create new
            new_candidate = Candidate(
                name=current_user.full_name,
                email=current_user.email,
                resume_url=file_location,
                resume_text=resume_text,
                user_id=current_user.id
            )
            db.add(new_candidate)
            await db.flush() # Flush to get new_candidate.id if it's a new candidate

        # 2. Create new Interview Session for this attempt
        # We need to commit the candidate first if it's new, to get an ID for the session
        await db.commit() # Commit candidate creation/update
        await db.refresh(new_candidate) # Refresh to ensure ID is available

        new_session = InterviewSession(
            candidate_id=new_candidate.id,
            status="active",
            current_round="resume_analysis"
        )
        db.add(new_session)
        await db.commit() # Commit session creation
        await db.refresh(new_session)

        # 3. Generate Questions (Strictly 10, Unique)
        # generated_questions_data is already generated at line 61
        
        # 4. Save Questions linked to Session
        for q_data in generated_questions_data:
            q = Question(
                candidate_id=new_candidate.id,
                session_id=new_session.id, # Link to session
                text=q_data["text"],
                options=q_data["options"],
                correct_answer=q_data["correct_answer"],
                difficulty=q_data.get("difficulty", "medium"),
                tags=q_data.get("tags", [])
            )
            db.add(q)
            
        await db.commit()
        await db.refresh(new_candidate)

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
        print(f"CRITICAL ERROR: {error_msg}")
        
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

    return {
        "id": new_candidate.id, 
        "message": "Candidate profile updated successfully", 
        "resume_url": new_candidate.resume_url,
        "questions_count": len(generated_questions_data),
        "session_id": new_session.id
    }

@router.get("/{candidate_id}/questions")
async def get_candidate_questions(candidate_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.candidate_id == candidate_id))
    questions = result.scalars().all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this candidate")
    return questions

class QuizSubmission(BaseModel):
    answers: dict[int, int] # question_id: selected_option_index

@router.post("/{candidate_id}/quiz_submit")
async def submit_quiz(candidate_id: int, submission: QuizSubmission, db: AsyncSession = Depends(get_db)):
    # Fetch questions
    result = await db.execute(select(Question).where(Question.candidate_id == candidate_id))
    questions = result.scalars().all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="Questions not found")
        
    score = 0
    for q in questions:
        if q.id in submission.answers and submission.answers[q.id] == q.correct_answer:
            score += 1
            
    # Create Interview Session
    # Check if exists first
    result = await db.execute(select(InterviewSession).where(InterviewSession.candidate_id == candidate_id))
    existing_session = result.scalars().first()
    
    if existing_session:
        return {"session_id": existing_session.id, "score": score, "message": "Session already exists"}

    new_session = InterviewSession(
        candidate_id=candidate_id,
        status="active",
        score=score,
        current_round="resume_analysis" # Start with Resume Analysis
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return {"session_id": new_session.id, "score": score}
