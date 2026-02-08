import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_learning_chat():
    print("Testing /learning/chat endpoint...")
    
    url = f"{BASE_URL}/learning/chat"
    payload = {
        "message": "Explain the difference between a process and a thread.",
        "candidate_id": None 
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            print("SUCCESS: Endpoint responded 200 OK")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"FAILURE: Status Code {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"ERROR: Could not connect to backend. {e}")

if __name__ == "__main__":
    test_learning_chat()
