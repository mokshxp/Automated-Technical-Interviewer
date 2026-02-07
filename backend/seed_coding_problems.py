import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import CodingProblem
from sqlalchemy.future import select

async def seed_coding_problems():
    async with AsyncSessionLocal() as db:
        # Check if problems exist
        result = await db.execute(select(CodingProblem))
        existing = result.scalars().first()
        
        if existing:
            print("Coding problems already exist. Skipping seed.")
            return

        problems = [
            CodingProblem(
                title="Two Sum",
                description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                difficulty="easy",
                starter_code="def twoSum(nums, target):\n    # Write your code here\n    pass",
                test_cases=[
                    {"input": "([2,7,11,15], 9)", "output": "[0, 1]"},
                    {"input": "([3,2,4], 6)", "output": "[1, 2]"},
                    {"input": "([3,3], 6)", "output": "[0, 1]"}
                ]
            ),
            CodingProblem(
                title="Reverse String",
                description="Write a function that reverses a string. The input string is given as an array of characters s.",
                difficulty="easy",
                starter_code="def reverseString(s):\n    # Write your code here\n    pass",
                test_cases=[
                    {"input": "(['h','e','l','l','o'])", "output": "['o','l','l','e','h']"},
                    {"input": "(['H','a','n','n','a','h'])", "output": "['h','a','n','n','a','H']"}
                ]
            ),
             CodingProblem(
                title="FizzBuzz",
                description="Print numbers from 1 to n. Check for multiples of 3 and 5.",
                difficulty="easy",
                starter_code="def fizzBuzz(n):\n    # Write your code here\n    pass",
                test_cases=[
                    {"input": "(3)", "output": "['1','2','Fizz']"},
                    {"input": "(5)", "output": "['1','2','Fizz','4','Buzz']"}
                ]
            )
        ]
        
        db.add_all(problems)
        await db.commit()
        print("Seeded 3 coding problems.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(seed_coding_problems())
