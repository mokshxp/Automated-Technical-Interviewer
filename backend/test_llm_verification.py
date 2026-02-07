from app.services.llm_service import generate_text
import os

print(f"Checking API Key length: {len(os.getenv('GEMINI_API_KEY') or '')}")
response = generate_text("Hello")
print(f"Response: {response}")
