import requests
import time
import os

BASE_URL = "http://127.0.0.1:8000"

def create_valid_pdf(filename):
    with open(filename, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 54\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Python and React and SQL) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000280 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n384\n%%EOF\n")

create_valid_pdf("test_resume_p4.pdf")

try:
    print("--- Phase 4: AI Integration Test ---")
    
    # 1. Register
    print("1. Registering Candidate...")
    files = {'resume': open('test_resume_p4.pdf', 'rb')}
    data = {'name': 'Phase4 Tester', 'email': f'phase4_{time.time()}@test.com'}
    res = requests.post(f"{BASE_URL}/candidates/register", files=files, data=data)
    res.raise_for_status()
    candidate_id = res.json()['id']
    questions_count = res.json()['questions_count']
    print(f"   Registered. Generated {questions_count} questions.")
    
    # 2. Fetch & Submit
    print("2. Submitting Quiz...")
    res = requests.get(f"{BASE_URL}/candidates/{candidate_id}/questions")
    questions = res.json()
    answers = {q['id']: q['correct_answer'] for q in questions}
    
    res = requests.post(f"{BASE_URL}/candidates/{candidate_id}/quiz_submit", json={"answers": answers})
    session_id = res.json()['session_id']
    print(f"   Session ID: {session_id}")

    # 3. Chat Test (LLM Check)
    print("3. Sending Chat Message (checking for LLM response)...")
    chat_msg = {"message": "I really enjoy optimization problems in Python."}
    res = requests.post(f"{BASE_URL}/interview/{session_id}/chat", json=chat_msg)
    res.raise_for_status()
    chat_resp = res.json()
    response = chat_resp['response']
    
    print("\n" + "="*50)
    print(f"AI RESPONSE: {response}")
    print("="*50 + "\n")
    
    if "LLM Service Unavailable" in response:
        print("NOTE: Using Fallback. API Key missing as expected.")
    elif "mock response" in response:
        print("NOTE: Using Mock Logic.")
    else:
        print("SUCCESS: Received distinct response (likely LLM).")

except Exception as e:
    print(f"\nFAILURE: {e}")
    if 'res' in locals():
        print(res.text)

finally:
    files['resume'].close()
    if os.path.exists("test_resume_p4.pdf"):
        try: os.remove("test_resume_p4.pdf")
        except: pass
