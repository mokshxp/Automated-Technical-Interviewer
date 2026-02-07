import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    with open("models.txt", "w") as f:
        f.write("Listing available models...\n")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
                print(m.name)
except Exception as e:
    with open("models.txt", "w") as f:
        f.write(f"Error listing models: {e}\n")
    print(f"Error listing models: {e}")
