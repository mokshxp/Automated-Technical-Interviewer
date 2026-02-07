🤖 Automated Technical Interviewer












An AI-powered platform that conducts adaptive, resume-aware technical interviews — simulating a real human interviewer.

📚 Table of Contents

Overview

Why This Project?

Key Features

System Architecture

Tech Stack

Getting Started

Usage Guide

API Documentation

Project Structure

Security Considerations

Roadmap

License

🔍 Overview

Automated Technical Interviewer is a next-generation interview automation platform designed to replace static, quiz-based screening systems.

Instead of fixed question banks, the platform uses Google Gemini 1.5 Pro to:

Analyze candidate resumes

Ask context-aware technical questions

Adapt follow-ups based on answers

Evaluate code in real time

Simulate realistic interviewer conversations (text + voice)

The goal is to provide fair, scalable, and human-like technical interviews at scale.

🧠 Why This Project?

Traditional platforms (HackerRank, Codility, MCQ portals):

Rely on static questions

Ignore candidate background

Test memorization more than thinking

This project focuses on:

Resume-driven interviews

Adaptive questioning

Live reasoning & explanation

End-to-end system evaluation

It is designed as a real technical screening round, not a quiz.

✨ Key Features
Feature	Description
📄 Resume Analysis	Parses PDF/DOCX resumes to extract skills, projects, and experience.
🧠 Adaptive AI Interviewer	Uses Gemini 1.5 Pro to generate dynamic follow-up questions based on candidate responses.
💻 Interactive Coding Environment	Browser-based editor with server-side code execution.
🗣️ Voice Interaction	Text-to-Speech (TTS) and Speech-to-Text (STT) for conversational interviews.
🛡️ Multi-Round Assessment	MCQs, DSA coding, and System Design discussions.
📊 Automated Evaluation	AI-generated feedback and scoring (planned).
🏗 System Architecture
graph TD
    subgraph Frontend ["Frontend (React + Vite)"]
        UI[Web App]
        Audio[Voice Recorder / Player]
        Editor[Monaco Code Editor]
    end

    subgraph Backend ["Backend (FastAPI)"]
        API[API Router]
        Auth[JWT Auth]
        Flow[Interview State Machine]
        Sandbox[Code Execution Sandbox]
        LLM[LLM Service Wrapper]
    end

    subgraph External ["External Services"]
        Gemini[Google Gemini 1.5 Pro API]
        DB[(SQLite / PostgreSQL)]
    end

    UI -->|HTTP/JSON| API
    UI -->|Audio Blob| API
    API --> Auth
    API --> Flow
    Flow --> LLM
    Flow --> Sandbox
    Flow --> DB
    LLM --> Gemini

🛠 Tech Stack
Backend

Framework: FastAPI (Async Python)

Database: SQLite (Dev) / PostgreSQL (Prod)

ORM: SQLAlchemy (Async)

AI Model: Google Gemini 1.5 Pro (Generative AI REST API)

Resume Parsing: PyMuPDF + custom extraction logic

Speech (TTS): gTTS

Auth: JWT

Frontend

Framework: React (Vite)

Language: TypeScript

Editor: Monaco Editor

Styling: Tailwind CSS

State Management: React Context API

HTTP Client: Axios

Speech (STT): Browser Web Speech API

🚀 Getting Started
Prerequisites

Python 3.10+

Node.js 16+

npm

Google Gemini API Key

Backend Setup
git clone https://github.com/yourusername/automated-technical-interviewer.git
cd automated-technical-interviewer/backend

python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
pip install aiosqlite


Create .env file:

GEMINI_API_KEY=your_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./interview.db


Run server:

uvicorn app.main:app --reload


API Docs: http://localhost:8000/docs

Frontend Setup
cd ../frontend
npm install
npm run dev


App runs at: http://localhost:5173

📘 Usage Guide

Register as a candidate

Upload resume (PDF/DOCX)

Complete MCQ round

Solve DSA coding challenges

Participate in System Design discussion

Receive AI-generated evaluation (planned)

🔌 API Documentation
Endpoint	Method	Description
/auth/login	POST	Authenticate & receive JWT
/candidates/upload_resume	POST	Upload & parse resume
/interview/{id}/state	GET	Get interview state
/interview/{id}/chat	POST	Text interaction
/interview/{id}/speak	POST	Voice interaction
/interview/{id}/run_code	POST	Execute code
📂 Project Structure
backend/
 ├── app/
 │   ├── routers/
 │   ├── services/
 │   ├── models.py
 │   └── main.py
 ├── requirements.txt
 └── .env

frontend/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   └── context/
 └── package.json

🔐 Security Considerations

Code execution is isolated per request

Time and memory limits enforced

No filesystem or network access during execution

JWT-based authentication

Input validation on all endpoints

Note: Sandbox is designed for interview use, not untrusted production workloads.

🗺 Roadmap

 WebSocket support for low-latency streaming

 Multi-language code execution (Java, C++)

 Interview feedback dashboard

 Recruiter admin panel

 Proctoring & identity verification

📄 License

This project is licensed under the MIT License.

Built with ❤️ by Moksh Gupta
