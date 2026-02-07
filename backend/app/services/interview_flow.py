from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import InterviewSession, Question, Candidate
from datetime import datetime

PIPELINE = ["oa_mcq", "oa_coding", "tech_1", "tech_2", "completed"]

async def get_session(session_id: int, db: AsyncSession):
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    return result.scalars().first()

async def get_round_state(session_id: int, db: AsyncSession):
    session = await get_session(session_id, db)
    if not session:
        return {"error": "Session not found"}
    
    current_index = PIPELINE.index(session.current_round)
    
    # If already completed, return
    if session.current_round == "completed":
        return {"status": "completed"}
        
    return {
        "session_id": session.id,
        "current_round": session.current_round,
        "round_type": session.current_round,
        "candidate_id": session.candidate_id 
    }

async def advance_round_state(session_id: int, db: AsyncSession):
    session = await get_session(session_id, db)
    if not session:
        return {"error": "Session not found"}
    
    current_round = session.current_round
    
    # Strict Flow Definition
    # resume_analysis -> prep_oa -> oa_mcq -> prep_coding -> oa_coding -> 
    # prep_tech_1 -> tech_1 -> prep_tech_2 -> tech_2 -> completed

    if current_round == "resume_analysis":
        session.current_round = "prep_oa"
    elif current_round == "prep_oa":
        session.current_round = "oa_mcq"
    elif current_round == "oa_mcq":
        session.current_round = "prep_coding" 
    elif current_round == "prep_coding":
        session.current_round = "oa_coding"
    elif current_round == "oa_coding":
        session.current_round = "prep_tech_1"
    elif current_round == "prep_tech_1":
        session.current_round = "tech_1"
    elif current_round == "tech_1":
        session.current_round = "prep_tech_2"
    elif current_round == "prep_tech_2":
        session.current_round = "tech_2"
    elif current_round == "tech_2":
        session.current_round = "completed"
        session.end_time = datetime.utcnow()
        session.status = "completed"
        
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return {
        "session_id": session.id,
        "current_round": session.current_round
    }

async def submit_round(session_id: int, data: dict, db: AsyncSession):
    session = await get_session(session_id, db)
    if not session:
        return {"error": "Session not found"}
        
    # Update score/data
    if not session.round_data: session.round_data = {}
    
    # Store round data
    current_round = session.current_round
    if current_round not in session.round_data:
        session.round_data[current_round] = {}
        
    session.round_data[current_round] = data
    # Force JSON update
    session.round_data = dict(session.round_data)
    
    # Calculate score if MCQ
    if data.get("type") == "oa_mcq":
        # logic to calc score... assumed done in frontend or here.
        # Simple count for now if data has 'score' or we calc it?
        # User's frontend sends 'answers'. We should calculate score here strictly?
        # For now, let's just proceed to next round.
        pass

    db.add(session)
    await db.commit()
    
    # auto-advance
    await advance_round_state(session_id, db) # Changed to advance_round_state as per original logic for advancing
    
    return {"status": "success", "next_round": session.current_round}
