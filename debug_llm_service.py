import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.llm_service import generate_text

def test_service():
    print("Testing generate_text from llm_service...")
    try:
        response = generate_text("Hello, are you working?")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Service Call Failed: {e}")

if __name__ == "__main__":
    test_service()
