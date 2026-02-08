import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
# Force port 5432
DATABASE_URL = DATABASE_URL.replace(":6543", ":5432")
print(f"Testing DATABASE_URL: {DATABASE_URL}")

async def test_connection():
    try:
        engine = create_async_engine(
            DATABASE_URL, 
            echo=True,
            connect_args={"ssl": "require"} # No need for cache disable in session mode
        )
            
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Connection Successful! Result: {result.scalar()}")
            
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
