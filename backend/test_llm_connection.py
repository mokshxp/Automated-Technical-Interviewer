import google.generativeai as genai
from app.services.llm_service import generate_text, generate_json
import traceback
import sys

with open("llm_test_result.txt", "w") as f:
    try:
        f.write(f"Google Generative AI Version: {genai.__version__}\n")
        
        f.write("\nList of available models:\n")
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    f.write(f"- {m.name}\n")
        except Exception as e:
            f.write(f"Failed to list models: {e}\n")
            f.write(traceback.format_exc() + "\n")

        f.write("\nTesting Text Generation...\n")
        try:
            text = generate_text("Hello, answer with 'Pong'")
            f.write(f"Text Response: {text}\n")
        except Exception as e:
            f.write(f"Text Generation Failed: {e}\n")
            f.write(traceback.format_exc() + "\n")

        f.write("\nTesting JSON Generation...\n")
        try:
            json_data = generate_json("Generate a JSON object: {'key': 'value'}")
            f.write(f"JSON Response: {json_data}\n")
        except Exception as e:
            f.write(f"JSON Generation Failed: {e}\n")
            f.write(traceback.format_exc() + "\n")
            
    except Exception as e:
        f.write(f"Critical Script Failure: {e}\n")
        f.write(traceback.format_exc() + "\n")
