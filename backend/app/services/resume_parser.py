
import pypdf
import docx
import os
import io
import re
from typing import Dict, Any

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        reader = pypdf.PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
        return ""
    return text

def extract_text_from_docx(file_path: str) -> str:
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX {file_path}: {e}")
        return ""
    return text

def parse_resume(file_path: str) -> str:
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    else:
        return ""

from .llm_service import generate_json

def generate_analytics(text: str) -> Dict[str, Any]:
    """Generates deep analytics from resume text using LLM."""
    if not text:
        return _get_default_analytics()
    
    prompt = f"""
    You are an expert Technical Interviewer and Resume Analyzer. 
    Analyze the following resume text and provide a structured JSON assessment.
    
    Resume Text:
    {text[:4000]}  # Truncate to avoid token limits if necessary

    Output MUST be a valid JSON object with this EXACT structure:
    {{
        "experience_level": "Junior" | "Mid" | "Senior",
        "readiness_score": <integer 0-100>,
        "primary_languages": [
            {{ "name": "LanguageName", "confidence": <integer 0-100> }}
        ],
        "core_domains": [
             {{ "name": "DomainName (e.g. Backend, Frontend, DevOps)", "coverage": <integer 0-100> }}
        ],
        "strengths": ["string", "string", "string"],
        "improvement_areas": ["string", "string", "string"],
        "recommended_focus": ["string", "string", "string"]
    }}

    Rules:
    - readiness_score should be critical but fair based on depth of skills.
    - Limit lists to top 3-5 items.
    - primary_languages should focus on programming languages.
    - core_domains should be high-level engineering domains.
    """
    
    try:
        data = generate_json(prompt)
        
        # Validate/Sanitize critical fields to prevent frontend crash
        if not isinstance(data, dict):
            return _get_default_analytics()
            
        return {
            "experience_level": data.get("experience_level", "Junior"),
            "readiness_score": data.get("readiness_score", 50),
            "primary_languages": data.get("primary_languages", []),
            "core_domains": data.get("core_domains", []),
            "strengths": data.get("strengths", []),
            "improvement_areas": data.get("improvement_areas", []),
            "recommended_focus": data.get("recommended_focus", [])
        }
    except Exception as e:
        print(f"Analytics Generation Failed: {e}")
        return _get_default_analytics()

def _get_default_analytics():
    return {
        "experience_level": "Junior",
        "readiness_score": 0,
        "primary_languages": [],
        "core_domains": [],
        "strengths": ["Resume parsing failed"],
        "improvement_areas": ["Upload a standard PDF"],
        "recommended_focus": ["Clear formatting"]
    }
