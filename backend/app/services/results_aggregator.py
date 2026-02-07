from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import InterviewSession, Question

async def calculate_final_results(session_id: int, db: AsyncSession):
    # Fetch Session
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalars().first()
    
    if not session:
        return None
        
    data = session.round_data or {}
    
    # 1. OA MCQ Score
    # Fetch total questions for this candidate
    q_result = await db.execute(select(Question).where(Question.candidate_id == session.candidate_id))
    questions = q_result.scalars().all()
    
    oa_mcq_data = data.get('oa_mcq', {})
    answers = oa_mcq_data.get('answers', {})
    
    mcq_score = 0
    total_mcq = len(questions)
    for q in questions:
        if str(q.id) in answers and int(answers[str(q.id)]) == q.correct_answer:
            mcq_score += 1
            
    # 2. OA Coding Score
    oa_coding_data = data.get('oa_coding', {})
    coding_passed = oa_coding_data.get('passed', False)
    coding_score = 100 if coding_passed else 0
    
    # 3. Chat Scores (Mocked for now - ideally LLM evaluates transcript)
    # In a real system, we would run an evaluation prompt here.
    tech_1_score = 85 # Placeholder
    tech_2_score = 90 # Placeholder
    
    # 4. Detailed Question Analysis (Answersheet)
    questions_analysis = []
    for q in questions:
        user_ans_idx = answers.get(str(q.id))
        user_answer_text = "Not Answered"
        is_correct = False
        
        options = q.options if isinstance(q.options, list) else []
        
        if user_ans_idx is not None:
            idx = int(user_ans_idx)
            if 0 <= idx < len(options):
                user_answer_text = options[idx]
            
            if idx == q.correct_answer:
                is_correct = True
                
        correct_text = options[q.correct_answer] if 0 <= q.correct_answer < len(options) else "Unknown"
        
        questions_analysis.append({
            "question": q.text,
            "user_answer": user_answer_text,
            "correct_answer": correct_text,
            "is_correct": is_correct,
            "difficulty": q.difficulty,
            "tags": q.tags
        })

    return {
        "session_id": session.id,
        "candidate_id": session.candidate_id,
        "scores": {
            "oa_mcq": {"score": mcq_score, "total": total_mcq},
            "oa_coding": coding_score,
            "tech_1": tech_1_score,
            "tech_2": tech_2_score,
            # "behavioral": 0 # Removed
        },
        "questions_analysis": questions_analysis,
        "overall_status": "Strong Hire" if (coding_passed and mcq_score > total_mcq * 0.7) else "Reject",
        "feedback": "Candidate showed strong problem solving skills."
    }
