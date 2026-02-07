import asyncio
import sys
import os

# Set DB URL for local execution
os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:password@localhost:5432/interview_db"

sys.path.append(os.getcwd())
from app.database import AsyncSessionLocal
from app.models import User, Candidate
from app.utils import get_password_hash
import time

async def debug_insert():
    async with AsyncSessionLocal() as db:
        email = f"debug_{int(time.time())}@test.com"
        print(f"Trying to insert user {email}")
        
        try:
            hashed_pw = get_password_hash("password")
            new_user = User(email=email, hashed_password=hashed_pw, full_name="Debug User")
            db.add(new_user)
            
            new_candidate = Candidate(
                name="Debug User",
                email=email,
                resume_url="pending",
                user=new_user
            )
            db.add(new_candidate)
            
            await db.commit()
            print("SUCCESS: Inserted")
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_insert())
