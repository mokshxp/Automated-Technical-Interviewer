from typing import List, Dict
from .llm_service import generate_json

def generate_mcqs(text: str) -> List[Dict]:
    """
    Generate MCQs using LLM based on resume text.
    Fallback to mock if LLM fails.
    """
    MAX_RETRIES = 5
    valid_questions = []
    seen_questions = set()
    import random
    
    for attempt in range(MAX_RETRIES):
        if len(valid_questions) >= 10:
            break
            
        needed = 10 - len(valid_questions)
        seed = random.randint(1, 100000)
        
        prompt = f"""
        Generate {needed} UNIQUE technical multiple-choice questions (MCQs). Random Seed: {seed}
        
        RULES:
        - Output ONLY valid JSON Array.
        - No repeated questions.
        - Topics: Data Structures (DSA), Operating Systems (OS), Database (DBMS), OOP.
        - 4 options only.
        
        Resume Context:
        {text[:1000]}
        
        Output Structure:
        [
          {{
            "text": "Question text...",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 0,
            "difficulty": "medium",
            "tags": ["dsa"]
          }}
        ]
        """
        
        new_questions = generate_json(prompt)
        
        if not isinstance(new_questions, list):
            continue
            
        for q in new_questions:
            if (
                "text" not in q or
                "options" not in q or
                len(q["options"]) != 4
            ):
                continue
                
            q_text = q["text"].strip().lower()
            if q_text in seen_questions:
                continue
                
            seen_questions.add(q_text)
            valid_questions.append(q)
            
            if len(valid_questions) >= 10:
                break
                
    if len(valid_questions) < 10:
        raise RuntimeError("Failed to generate 10 unique MCQs")
        
    return valid_questions[:10]
