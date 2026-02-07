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
                
    if len(valid_questions) > 0:
        return valid_questions

    print("WARNING: LLM failed to generate questions. Returning MOCK questions.")
    return [
        {
            "text": "Which data structure uses LIFO (Last In First Out) principle?",
            "options": ["Queue", "Stack", "Tree", "Graph"],
            "correct_answer": 1,
            "difficulty": "easy",
            "tags": ["dsa"]
        },
        {
            "text": "What is the time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            "correct_answer": 1,
            "difficulty": "medium",
            "tags": ["dsa"]
        },
        {
            "text": "Which keyword is used to define a class in Python?",
            "options": ["function", "def", "class", "struct"],
            "correct_answer": 2,
            "difficulty": "easy",
            "tags": ["python"]
        },
        {
            "text": "What does SQL stand for?",
            "options": ["Structured Question Language", "Simple Query Language", "Structured Query Language", "System Query Logic"],
            "correct_answer": 2,
            "difficulty": "easy",
            "tags": ["dbms"]
        },
        {
            "text": "Which of these is NOT a pillar of OOP?",
            "options": ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"],
            "correct_answer": 2,
            "difficulty": "medium",
            "tags": ["oop"]
        }
    ]
