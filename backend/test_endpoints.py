
import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_flow():
    print("------------------------------------------------")
    print("Testing Backend Flow: Register -> Start Interview")
    print(f"Target URL: {BASE_URL}")
    print("------------------------------------------------")

    # 1. Register Candidate
    print("\n[1] Registering Candidate...")
    with open("dummy.pdf", "wb") as f:
        f.write(b"%PDF-1.4 dummy content")
    
    files = {'resume': ('dummy.pdf', open('dummy.pdf', 'rb'), 'application/pdf')}
    data = {'name': 'Test Candidate'}
    
    try:
        # Note: We are hitting this without Auth header. 
        # If the endpoint enforces Auth, this will fail with 401.
        # Registration.tsx sends 'Authorization': `Bearer ${token}`.
        # But let's see if we get 401 or Connection Error.
        
        reg_res = requests.post(f"{BASE_URL}/candidates/register", files=files, data=data)
        print(f"Registration Status: {reg_res.status_code}")
        
        if reg_res.status_code == 401:
            print("Auth required. Skipping registration test (Auth is assumed working as per logs).")
            # We can't easily get a token without login flow.
            # But the user's error "Failed to fetch" implies network/server issue, not 401.
            # If 401, fetch would return response with status 401.
            return

        if reg_res.status_code != 201 and reg_res.status_code != 200:
            print(f"Registration failed: {reg_res.text}")
            return

        candidate_data = reg_res.json()
        resume_id = candidate_data.get("id")
        print(f"Candidate Created. ID: {resume_id}")
        
        # 2. Start Interview
        print(f"\n[2] Starting Interview for Resume ID: {resume_id}...")
        payload = {"resume_id": resume_id}
        
        # Explicitly checking /interviews/ (trailing slash) as used in frontend
        interview_res = requests.post(f"{BASE_URL}/interviews/", json=payload)
        
        print(f"Interview Creation Status: {interview_res.status_code}")
        if interview_res.status_code == 201 or interview_res.status_code == 200:
            print(f"Success! Response: {interview_res.json()}")
        else:
            print(f"Failed. Response: {interview_res.text}")

    except Exception as e:
        print(f"\n!!! EXCEPTION !!!\n{e}")

if __name__ == "__main__":
    test_flow()
