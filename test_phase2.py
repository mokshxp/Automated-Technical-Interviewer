import requests
import os

# Create a dummy resume text file for testing parsing (using .docx content structure or just text)
# Attempting with a simple text file disguised as .docx or .pdf for the parser might fail if it strictly checks valid zip/pdf structure.
# But our parser uses pypdf/docx which expect valid files.
# So we will rely on the `dummy_resume.docx` created earlier, assuming it's valid text.
# Wait, `write_to_file` created a plain text file named .docx. `python-docx` will fail to read it.
# I should generate a valid .txt file and update the backend to accept .txt for easier testing, OR use a library here to create a real .docx.
# Since I can't easily install python-docx here to create one, I'll modify the backend to accept .txt as well for testing purposes?
# No, let's keep strict requirements. I will try to upload the `dummy_resume.docx` I created but I suspect it's invalid.
# Actually, I'll update the script to create a minimal valid PDF manually or just test the endpoint with a real file if I had one.
# Alternate plan: Just test the endpoint with a valid check that EXPECTS a failure if the file is invalid, verifying the endpoint is reachable.
# BETTER: Use a real mocked file content for PDF.

def create_valid_pdf(filename):
    with open(filename, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 54\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Python and React and SQL) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000280 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n384\n%%EOF\n")

create_valid_pdf("test_resume.pdf")

url = "http://127.0.0.1:8000/candidates/register"
files = {'resume': open('test_resume.pdf', 'rb')}
data = {'name': 'Phase2 Test', 'email': 'phase2@example.com'}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        cid = response.json()['id']
        # Fetch questions
        resp2 = requests.get(f"http://127.0.0.1:8000/candidates/{cid}/questions")
        print(f"Questions Response: {resp2.json()}")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    files['resume'].close()
    if os.path.exists("test_resume.pdf"):
        os.remove("test_resume.pdf")
