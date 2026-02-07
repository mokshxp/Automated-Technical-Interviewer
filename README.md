# 🤖 Automated Technical Interviewer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)
![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-8E44AD)

> **An AI-powered platform for conducting automated, adaptive technical interviews based on candidate resumes.**

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)

---

## 🔍 Overview

The **Automated Technical Interviewer** is designed to simulate a real technical screening round.

Unlike traditional quiz-based platforms, this system:
- Reads and understands resumes
- Generates context-aware questions
- Adapts follow-ups based on candidate responses
- Evaluates problem-solving and reasoning, not memorization

The platform uses **Google Gemini 1.5 Pro** to act as an intelligent interviewer across multiple interview rounds.

---

## ✨ Key Features

| Feature | Description |
|------|-------------|
| **Resume Analysis** | Parses PDF/DOCX resumes to extract skills, projects, and experience. |
| **Adaptive AI Interviewer** | Dynamically generates follow-up questions using Gemini 1.5 Pro. |
| **Interactive Coding Environment** | Browser-based code editor with server-side execution sandbox. |
| **Voice Interaction** | Text-to-Speech (TTS) and Speech-to-Text (STT) support. |
| **Multi-Round Assessment** | MCQs, DSA coding rounds, and system design discussions. |
| **Automated Evaluation** | AI-generated feedback and scoring (planned). |

---

## 🏗 System Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend (React + Vite)"]
        UI[Web UI]
        Editor[Code Editor]
        Audio[Voice Input / Output]
    end

    subgraph Backend["Backend (FastAPI)"]
        API[API Router]
        Auth[JWT Auth]
        Flow[Interview State Machine]
        Sandbox[Code Sandbox]
        LLM[LLM Service]
    end

    subgraph External["External Services"]
        Gemini[Gemini 1.5 Pro API]
        DB[(Database)]
    end

    UI --> API
    Audio --> API
    API --> Auth
    API --> Flow
    Flow --> LLM
    Flow --> Sandbox
    Flow --> DB
    LLM --> Gemini
🛠 Tech Stack
Backend

FastAPI (Async Python)

Google Gemini 1.5 Pro

SQLAlchemy (Async ORM)

SQLite (Dev) / PostgreSQL (Prod)

JWT Authentication

gTTS (Text-to-Speech)

Frontend

React (Vite)

TypeScript

Tailwind CSS

Monaco Code Editor

Axios

🚀 Getting Started
Prerequisites

Python 3.10+

Node.js 16+

npm

Google Gemini API key

Backend Setup
git clone https://github.com/mokshxp/Automated-Technical-Interviewer.git
cd Automated-Technical-Interviewer/backend

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt
pip install aiosqlite


Create .env file:

GEMINI_API_KEY=your_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./interview.db


Run server:

uvicorn app.main:app --reload


API docs available at: http://localhost:8000/docs

Frontend Setup
cd ../frontend
npm install
npm run dev


Application runs at: http://localhost:5173

📘 Usage Guide

Register as a candidate

Upload resume (PDF/DOCX)

Complete MCQ assessment

Solve DSA coding problems

Participate in system design discussion

Review AI-generated feedback (planned)

🔌 API Documentation
Endpoint	Method	Description
/auth/login	POST	Authenticate user
/candidates/upload_resume	POST	Upload and parse resume
/interview/{id}/state	GET	Get interview state
/interview/{id}/chat	POST	Text-based interaction
/interview/{id}/speak	POST	Voice interaction
/interview/{id}/run_code	POST	Execute code in sandbox
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

🗺 Roadmap

 WebSocket support for real-time streaming

 Multi-language code execution (Java, C++)

 Automated interview feedback reports

 Recruiter/admin dashboard

 Proctoring and identity verification

Built with ❤️ by Moksh Gupta






