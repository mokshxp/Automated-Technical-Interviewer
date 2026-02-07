import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_auth():
    print("--- Testing Authentication ---")
    
    # Unique user
    email = f"user_{time.time()}@test.com"
    password = "password123"
    
    # 1. Signup
    print(f"1. Signing up {email}...")
    res = requests.post(f"{BASE_URL}/auth/signup", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    
    if res.status_code != 201:
        print(f"FAILED Signup: {res.text}")
        return
    
    user_id = res.json()["id"]
    print(f"   Created User ID: {user_id}")
    
    # 2. Login
    print("2. Logging in...")
    res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    
    if res.status_code != 200:
        print(f"FAILED Login: {res.text}")
        return
        
    token = res.json()["access_token"]
    print("   Got Access Token")
    
    # 3. Get Me
    print("3. Fetching /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if res.status_code != 200:
        print(f"FAILED Get Me: {res.text}")
        return
        
    print(f"   Current User: {res.json()['email']}")
    print("SUCCESS: Auth Flow Verified")

if __name__ == "__main__":
    test_auth()
