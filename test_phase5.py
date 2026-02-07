import requests
import time

BASE_URL = "http://127.0.0.1:8000"

try:
    print("--- Phase 5: Code Execution Test ---")
    
    # 1. Register candidate/session (reuse logic or quick register)
    # We need a session ID to execute code.
    print("1. Creating Session (Register + Submit)...")
    # Register/Login
    name = f"Coder_{int(time.time())}"
    files = {'resume': ('dummy.pdf', b'content', 'application/pdf')}
    res = requests.post(f"{BASE_URL}/candidates/register", 
                        data={'name': name, 'email': f"{name}@test.com"},
                        files=files)
    res.raise_for_status()
    candidate_id = res.json()['id']
    
    # Submit Quiz (Empty answers is fine for mock scoring, just need existing session)
    res = requests.post(f"{BASE_URL}/candidates/{candidate_id}/quiz_submit", json={"answers": {}})
    session_id = res.json()['session_id']
    print(f"   Session ID: {session_id}")
    
    # 2. Execute Code
    print("2. Executing Python Code...")
    code = "print('Hello from Piston!')"
    res = requests.post(f"{BASE_URL}/interview/{session_id}/run_code", json={"language": "python", "code": code})
    if res.status_code != 200:
        print(f"Error: {res.text}")
        exit(1)
        
    result = res.json()
    print(f"   Response: {result}")
    
    if "Piston" in result.get("output", ""):
        print("SUCCESS: Code executed successfully.")
    else:
        print("WARNING: Unexpected output.")

except Exception as e:
    print(f"\nFAILURE: {e}")
