import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.resume_parser import generate_analytics

def test_analytics():
    print("Testing generate_analytics...")
    
    # Sample Mock Resume Text
    sample_text = """
    John Doe
    Software Engineer
    
    Skills:
    - Python, Java, C++
    - React, SQL, Docker
    - Cloud technologies like AWS and Azure
    
    Experience:
    Senior Developer at Tech Corp.
    """
    
    analytics = generate_analytics(sample_text)
    print(f"Analytics Result: {analytics}")
    
    expected_skills = ['Python', 'Java', 'C++', 'React', 'SQL', 'Docker', 'AWS', 'Azure']
    detected = analytics.get('skills_detected', [])
    
    # Check intersection
    missing = [s for s in expected_skills if s not in detected]
    
    if not missing:
        print("SUCCESS: All expected skills detected.")
    else:
        print(f"FAILURE: Missing skills: {missing}")
        
if __name__ == "__main__":
    test_analytics()
