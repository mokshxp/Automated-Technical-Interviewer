import google.generativeai as genai
import os
import json
import traceback
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

# Use a newer model
MODEL_NAME = 'gemini-flash-latest'

def generate_text(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return "LLM Service Unavailable: Missing API Key."
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        traceback.print_exc()
        return "Sorry, I am having trouble thinking right now."

def generate_json(prompt: str) -> dict:
    if not GEMINI_API_KEY:
        return {}

    # Append instruction to force JSON
    json_prompt = f"{prompt}\n\nIMPORTANT: Output ONLY valid JSON. No Markdown formatting."
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(json_prompt)
        text = response.text
        
        # Clean up potential markdown code blocks
        # Robust JSON extraction
        try:
            # 1. Strip basic markdown wrappers
            clean_text = text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            
            clean_text = clean_text.strip()
            
            # 2. Try parsing directly
            return json.loads(clean_text)
        except json.JSONDecodeError:
            # 3. If direct parsing fails, try to extract the first JSON array [] or object {}
            import re
            
            # Look for list pattern first as we mostly expect arrays
            array_pattern = r'\[.*\]'
            match = re.search(array_pattern, text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except:
                    pass
            
            # If that fails, look for object pattern
            obj_pattern = r'\{.*\}'
            match = re.search(obj_pattern, text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except:
                    pass
            
            # 4. Last ditch: try to fix common trailing/leading character issues
            # (Sometimes gemini puts `json` at start without ticks)
            pass
            
        print(f"Failed to parse JSON from LLM: {text[:100]}...")
        return []
    except Exception as e:
        print(f"Gemini JSON Error: {e}")
        traceback.print_exc()
        return {}
