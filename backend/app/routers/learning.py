from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Candidate
from ..services.llm_service import generate_text

router = APIRouter(prefix="/learning", tags=["learning"])

class LearningChatRequest(BaseModel):
    message: str
    candidate_id: int | None = None

@router.post("/chat")
async def learning_chat(request: LearningChatRequest, db: AsyncSession = Depends(get_db)):
    context = ""
    if request.candidate_id:
        result = await db.execute(select(Candidate).where(Candidate.id == request.candidate_id))
        candidate = result.scalars().first()
        if candidate:
            context = f"The user is a candidate named {candidate.name}. "
            if candidate.resume_text:
                context += f"Here is a summary of their resume/skills:\n{candidate.resume_text[:1000]}...\n"

    prompt = (
        "You are an expert technical interview coach and mentor. "
        "Your goal is to help the user learn concepts, prepare for interviews, and improve their skills. "
        "Be encouraging, clear, and concise. "
        f"{context}\n"
        f"User Question: {request.message}\n"
        "Coach Response:"
    )

    from fastapi.concurrency import run_in_threadpool
    response = await run_in_threadpool(generate_text, prompt)
    return {"response": response}
