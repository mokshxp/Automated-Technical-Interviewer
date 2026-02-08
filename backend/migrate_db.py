import sqlite3
import os

db_path = os.path.join(os.getcwd(), 'interview.db')

def migrate():
    print(f"Connecting to {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Checking for 'status' column in 'candidates' table...")
        cursor.execute("PRAGMA table_info(candidates)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'status' not in columns:
            print("Adding 'status' column to 'candidates' table...")
            cursor.execute("ALTER TABLE candidates ADD COLUMN status VARCHAR DEFAULT 'processing' NOT NULL")
            conn.commit()
            print("Migration successful.")
        else:
            print("'status' column already exists.")
            
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
