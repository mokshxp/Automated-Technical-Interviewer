import google.generativeai as genai
import os
import sys
import traceback
from dotenv import load_dotenv

load_dotenv()

# log_file = open("debug_llm_output.txt", "w")
# sys.stdout = log_file
# sys.stderr = log_file

print("--- DIAGNOSTICS START ---")

try:
    print(f"Library Version: {genai.__version__}")
except AttributeError:
    print("Library Version: Unknown (no __version__)")

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key Present: {bool(api_key)}")
if api_key:
    # Print first few chars to verify it's loaded correctly
    print(f"API Key Prefix: {api_key[:4]}...")

    try:
        genai.configure(api_key=api_key)
        print("Configuration successful.")
        
        try:
            print("Listing available models...")
            for m in genai.list_models():
                if 'gemini' in m.name:
                    print(f"MODEL: {m.name}")
        except Exception as e:
            print(f"Error listing models: {e}")

        # model = genai.GenerativeModel('models/gemini-pro')
        # print("Model initialized.")
        
        # response = model.generate_content("Hello")
        # print(f"Generation Success: {response.text}")
    except Exception:
        print("EXCEPTION OCCURRED:")
        traceback.print_exc()

print("--- DIAGNOSTICS END ---")
# log_file.close()
