import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def create_valid_pdf(filename):
    with open(filename, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 54\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Python and React and SQL) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000280 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n384\n%%EOF\n")

create_valid_pdf("test_resume_p3.pdf")

try:
    # 1. Register
    print("1. Registering Candidate...")
    files = {'resume': open('test_resume_p3.pdf', 'rb')}
    data = {'name': 'Phase3 Tester', 'email': f'phas3_{time.time()}@test.com'}
    res = requests.post(f"{BASE_URL}/candidates/register", files=files, data=data)
    res.raise_for_status()
    candidate_data = res.json()
    candidate_id = candidate_data['id']
    print(f"   Registered ID: {candidate_id}")

    # 2. Fetch Questions
    print("2. Fetching Questions...")
    res = requests.get(f"{BASE_URL}/candidates/{candidate_id}/questions")
    res.raise_for_status()
    questions = res.json()
    print(f"   Fetched {len(questions)} questions")
    
    # 3. Submit Quiz
    print("3. Submitting Quiz...")
    answers = {}
    for q in questions:
        # Just pick the correct answer locally for logic check, or random
        answers[q['id']] = q['correct_answer']
        
    res = requests.post(f"{BASE_URL}/candidates/{candidate_id}/quiz_submit", json={"answers": answers})
    if res.status_code != 200:
        print(f"   Submission failed: {res.text}")
        exit(1)
    
    session_data = res.json()
    session_id = session_data['session_id']
    score = session_data['score']
    print(f"   Quiz Submitted. Session ID: {session_id}, Score: {score}")

    # 4. Chat Interaction
    print("4. Sending Chat Message...")
    chat_msg = {"message": "I love Python loops."}
    res = requests.post(f"{BASE_URL}/interview/{session_id}/chat", json=chat_msg)
    res.raise_for_status()
    chat_resp = res.json()
    print(f"   AI Response: {chat_resp['response']}")
    print(f"   History Length: {len(chat_resp['history'])}")

    print("\nSUCCESS: Phase 3 Verification Complete.")

except Exception as e:
    print(f"\nFAILURE: {e}")
    if 'res' in locals():
        print(res.text)

finally:
    files['resume'].close()
