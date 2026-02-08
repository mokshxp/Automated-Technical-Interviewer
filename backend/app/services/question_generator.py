from typing import List, Dict
from .llm_service import generate_json

def generate_mcqs(text: str, existing_questions: List[str] = []) -> List[Dict]:
    """
    Generate MCQs using LLM based on resume text.
    Fallback to mock if LLM fails.
    prevents repetition by checking against existing_questions.
    """
    MAX_RETRIES = 5
    valid_questions = []
    seen_questions = set(q.strip().lower() for q in existing_questions) # Normalize
    import random
    
    for attempt in range(MAX_RETRIES):
        # DEBUG: Force Mock Questions to test connection stability
        return [
            {
                "text": "DEBUG: Mock Question 1",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 0,
                "difficulty": "easy",
                "tags": ["debug"]
            },
            {
                "text": "DEBUG: Mock Question 2",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 1,
                "difficulty": "medium",
                "tags": ["debug"]
            },
                        {
                "text": "DEBUG: Mock Question 3",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 2,
                "difficulty": "hard",
                "tags": ["debug"]
            },
                        {
                "text": "DEBUG: Mock Question 4",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 3,
                "difficulty": "easy",
                "tags": ["debug"]
            },
                        {
                "text": "DEBUG: Mock Question 5",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 0,
                "difficulty": "medium",
                "tags": ["debug"]
                }
        ]
        
        if len(valid_questions) >= 5: # Generate batches of 5
            break
            
        needed = 5 - len(valid_questions)
        seed = random.randint(1, 100000)
        
        topics = ["Data Structures", "Algorithms", "System Design", "Databases", "Operating Systems", "Networking", "OOP", "Security", "Distributed Systems"]
        selected_topics = random.sample(topics, 3)
        
        prompt = f"""
        Generate {needed + 2} UNIQUE technical multiple-choice questions (MCQs). Random Seed: {seed}
        
        RULES:
        - Output ONLY valid JSON Array.
        - No repeated questions.
        - Focus on these topics (randomly selected): {", ".join(selected_topics)}.
        - vary difficulty: mix of easy, medium, hard.
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
            
            if len(valid_questions) >= 5:
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
