import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load backend env
load_dotenv("backend/.env")

from backend.app.models import CodingProblem
from backend.app.database import Base

DATABASE_URL = os.getenv("DATABASE_URL")
if "6543" in DATABASE_URL:
     DATABASE_URL = DATABASE_URL.replace(":6543", ":5432")

engine = create_async_engine(DATABASE_URL, connect_args={"ssl": "require"})
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_problems():
    async with AsyncSessionLocal() as db:
        print("Checking for existing problems...")
        from sqlalchemy import select
        result = await db.execute(select(CodingProblem))
        existing = result.scalars().all()
        
        if existing:
            print(f"Found {len(existing)} problems. No need to seed.")
            return

        print("Seeding sample problems...")
        problems = [
            CodingProblem(
                title="Two Sum",
                description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
                difficulty="easy",
                starter_code="def twoSum(nums, target):\n    # Write your code here\n    pass",
                test_cases=[
                    {"input": {"nums": [2,7,11,15], "target": 9}, "output": [0, 1], "hidden": False},
                    {"input": {"nums": [3,2,4], "target": 6}, "output": [1, 2], "hidden": False},
                    {"input": {"nums": [3,3], "target": 6}, "output": [0, 1], "hidden": True}
                ]
            ),
             CodingProblem(
                title="Reverse String",
                description="Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
                difficulty="easy",
                starter_code="def reverseString(s):\n    # Write your code here\n    pass",
                test_cases=[
                    {"input": {"s": ["h","e","l","l","o"]}, "output": ["o","l","l","e","h"], "hidden": False},
                    {"input": {"s": ["H","a","n","n","a","h"]}, "output": ["h","a","n","n","a","H"], "hidden": False}
                ]
            )
        ]
        
        db.add_all(problems)
        await db.commit()
        print("Successfully seeded coding problems!")

if __name__ == "__main__":
    import sys
    sys.path.append(os.getcwd()) # Ensure root is in path
    asyncio.run(seed_problems())
