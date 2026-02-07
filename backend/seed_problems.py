
import asyncio
import sys
import os

# Set DB URL to localhost for local script execution
# Assuming default credentials from docker-compose
os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:password@localhost:5432/interview_db"

sys.path.append(os.getcwd())
from app.database import AsyncSessionLocal, engine, Base
from app.models import CodingProblem

async def seed_problems():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("Seeding coding problems...")
        
        problems = [
            CodingProblem(
                title="Palindrome Check",
                description="Write a function `is_palindrome(s)` that returns `True` if the string `s` is a palindrome, and `False` otherwise.",
                starter_code="def is_palindrome(s):\n    # Your code here\n    pass",
                difficulty="easy",
                test_cases=[
                    {"input": ["racecar"], "output": True, "hidden": False, "func_name": "is_palindrome"},
                    {"input": ["hello"], "output": False, "hidden": False, "func_name": "is_palindrome"},
                    {"input": ["madam"], "output": True, "hidden": True, "func_name": "is_palindrome"},
                    {"input": ["12321"], "output": True, "hidden": True, "func_name": "is_palindrome"},
                    {"input": ["not a palindrome"], "output": False, "hidden": True, "func_name": "is_palindrome"},
                ]
            ),
            CodingProblem(
                title="Two Sum",
                description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Function name: `two_sum(nums, target)`",
                starter_code="def two_sum(nums, target):\n    # Your code here\n    pass",
                difficulty="easy",
                test_cases=[
                    {"input": [[2, 7, 11, 15], 9], "output": [0, 1], "hidden": False, "func_name": "two_sum"},
                    {"input": [[3, 2, 4], 6], "output": [1, 2], "hidden": False, "func_name": "two_sum"},
                    {"input": [[3, 3], 6], "output": [0, 1], "hidden": True, "func_name": "two_sum"},
                ]
            )
        ]
        
        for p in problems:
            db.add(p)
            
        await db.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_problems())
