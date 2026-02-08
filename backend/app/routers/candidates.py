from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from fastapi import UploadFile
from fastapi import File
from fastapi import Form
from fastapi import BackgroundTasks
# Verify status import
# print(f"DEBUG: status type: {type(status)}")
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
import shutil
import os
from ..services.resume_parser import parse_resume, generate_analytics
from ..models import Candidate, InterviewSession, Question, User
from ..database import get_db
from ..routers.auth import get_current_user
from ..services.question_generator import generate_mcqs
from pydantic import BaseModel

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.get("/", status_code=status.HTTP_200_OK)
async def get_candidates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Candidate)
        .where(Candidate.user_id == current_user.id)
        .order_by(Candidate.created_at.desc())
    )
    candidates = result.scalars().all()
    return candidates

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_candidate(
    name: str = Form(...),
    resume: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        # 1. Validation
        if resume.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # 2. Save File
        upload_dir = "uploads/resumes"
        os.makedirs(upload_dir, exist_ok=True)
        file_location = os.path.join(upload_dir, resume.filename)
        
        try:
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(resume.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
            
        # 3. Create New Resume Version (Always)
        new_candidate = Candidate(
            name=name,
            email=current_user.email,
            resume_url=file_location,
            resume_text="", 
            user_id=current_user.id,
            status="processing"
        )
        db.add(new_candidate)
        
        await db.commit()
        await db.refresh(new_candidate)

        # 4. Parsing & Analysis (Safe Wrap)
        try:
            # Parse
            resume_text = parse_resume(file_location)
            new_candidate.resume_text = resume_text
            
            # Analytics
            analytics_data = generate_analytics(resume_text)
            new_candidate.analytics = analytics_data
            new_candidate.status = "ready"
            
        except Exception as e:
            print(f"Deep analysis failed: {e}")
            new_candidate.status = "failed"
        
        await db.commit()
        await db.refresh(new_candidate)

        return {
             "id": new_candidate.id,
             "status": new_candidate.status,
             "message": "Resume uploaded and versioned successfully",
             "resume_url": new_candidate.resume_url,
             "analytics": new_candidate.analytics
        }

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        import traceback
        print(f"CRITICAL REGISTRATION FAILURE: {traceback.format_exc()}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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
