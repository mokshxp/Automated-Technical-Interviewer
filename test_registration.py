import requests
import os

# Create a dummy resume file
with open("test_resume.pdf", "wb") as f:
    f.write(b"%PDF-1.4 dummy content")

url = "http://localhost:8000/candidates/register"
files = {'resume': open('test_resume.pdf', 'rb')}
data = {'name': 'Test User', 'email': 'testuser@example.com'}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['resume'].close()
    if os.path.exists("test_resume.pdf"):
        os.remove("test_resume.pdf")
