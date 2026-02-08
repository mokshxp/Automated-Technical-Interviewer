import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")

async def test_connection():
    try:
        if "postgresql" in DATABASE_URL:
            print("Configuring for PostgreSQL with SSL/PgBouncer...")
            engine = create_async_engine(
                DATABASE_URL, 
                echo=True,
                connect_args={
                    "ssl": "require",
                    "statement_cache_size": 0,
                }
            )
        else:
            engine = create_async_engine(DATABASE_URL)
            
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Connection Successful! Result: {result.scalar()}")
            
    except Exception as e:
        print(f"Connection Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
