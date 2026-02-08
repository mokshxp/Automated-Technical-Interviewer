import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv("backend/.env")

from backend.app.models import InterviewSession, Candidate, User
from backend.app.database import Base

DATABASE_URL = os.getenv("DATABASE_URL")
if "6543" in DATABASE_URL:
     DATABASE_URL = DATABASE_URL.replace(":6543", ":5432")

engine = create_async_engine(DATABASE_URL, connect_args={"ssl": "require"})
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def check_session():
    async with AsyncSessionLocal() as db:
        print("Checking for Session 1...")
        from sqlalchemy import select
        result = await db.execute(select(InterviewSession).where(InterviewSession.id == 1))
        session = result.scalars().first()
        
        if session:
            print("Session 1 exists.")
            # Ensure it has a candidate
            if not session.candidate_id:
                print("Session 1 has no candidate. Fixing...")
                # Create dummy candidate check first
                cand_res = await db.execute(select(Candidate).limit(1))
                cand = cand_res.scalars().first()
                if not cand:
                     cand = Candidate(name="Test Candidate", email="test@example.com", resume_url="http://example.com", resume_text="Test resume")
                     db.add(cand)
                     await db.flush()
                session.candidate_id = cand.id
                db.add(session)
                await db.commit()
        else:
            print("Session 1 missing. Creating dummy session...")
            # Need candidate first
            cand_res = await db.execute(select(Candidate).limit(1))
            cand = cand_res.scalars().first()
            if not cand:
                 cand = Candidate(name="Test Candidate", email="test@example.com", resume_url="http://example.com", resume_text="Test resume")
                 db.add(cand)
                 await db.flush()
            
            session = InterviewSession(id=1, candidate_id=cand.id, status="pending", current_round="oa_coding")
            db.add(session)
            await db.commit()
            print("Created Session 1.")

if __name__ == "__main__":
    import sys
    sys.path.append(os.getcwd())
    asyncio.run(check_session())
