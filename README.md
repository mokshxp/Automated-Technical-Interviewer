# Automated Technical Interviewer

An AI-powered platform that conducts **resume-aware, adaptive technical interviews** using large language models.

---

## Problem

Most technical interview platforms:

- Rely on static question banks  
- Ignore candidate background  
- Test memorization more than real problem-solving  

This results in interviews that feel artificial and low-signal.

---

## Solution

This project focuses on simulating a **real technical screening round**, not a quiz.

It emphasizes:

- Resume-driven interviews  
- Adaptive questioning  
- Live reasoning and explanation  
- End-to-end system evaluation  

---

## Key Features

- **Resume Analysis**  
  Parses PDF/DOCX resumes to extract skills, projects, and experience.

- **Adaptive AI Interviewer**  
  Uses Gemini 1.5 Pro to generate follow-up questions based on candidate responses.

- **Interactive Coding Environment**  
  Browser-based code editor with server-side code execution.

- **Voice Interaction**  
  Text-to-Speech (TTS) and Speech-to-Text (STT) for conversational interviews.

- **Multi-Round Assessment**  
  MCQs, DSA coding, and System Design discussions.

- **Automated Evaluation**  
  AI-generated feedback and scoring (planned).

---

## High-Level Architecture


---

## Tech Stack

### Backend
- FastAPI (async Python)
- Google Gemini 1.5 Pro
- SQLAlchemy (SQLite / PostgreSQL)
- JWT Authentication

### Frontend
- React + Vite
- TypeScript
- Monaco Code Editor
- Tailwind CSS

---

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

---

## Why this version works (important)

- Clean Markdown → GitHub renders it nicely  
- Short sections → readable in 30 seconds  
- No marketing fluff  
- Sounds like a **real engineering project**  
- Matches your current stage perfectly  

This is the kind of README **reviewers actually read**.

If you want next:
- add screenshots (without ruining the look)
- add a short “resume version”
- or review your backend folder like a real code reviewer

Just tell me.
