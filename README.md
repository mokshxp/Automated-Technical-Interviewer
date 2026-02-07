# Automated Technical Interviewer

An AI-powered platform for conducting automated technical interviews, featuring resume analysis, coding assessments, and spoken technical rounds. The system leverages Google's Gemini 1.5 Pro model to simulate a real interviewer, providing adaptive questions and instant feedback.

## 🚀 Features

-   **Resume Analysis**:  Parses uploaded resumes to tailor interview questions to the candidate's background.
-   **Online Assessment (OA)**:
    -   **MCQ Round**: Automated multiple-choice questions on core CS concepts (OS, DBMS, CN).
    -   **Coding Round**: Integrated code editor with real-time execution against test cases.
-   **Technical Rounds**:
    -   **Data Structures & Algorithms (DSA)**: Interactive problem solving with AI guidance.
    -   **System Design**: Architecture discussions and whiteboard-style questions.
-   **Spoken Interview**:  Real-time voice interaction using:
    -   **Speech-to-Text**: Transcribes candidate responses.
    -   **LLM (Gemini)**: Generates context-aware follow-up questions.
    -   **Text-to-Speech**:  Vocalizes the AI interviewer's response.
-   **Behavioral Round**:  STAR method-based behavioral assessment.
-   **Automated Evaluation**:  Comprehensive scoring and feedback report at the end of the session.

## 🏗️ Architecture

### Tech Stack

#### Backend
-   **Framework**: FastAPI (Python 3.10+)
-   **Database**: SQLite (via `aiosqlite`) for local dev / PostgreSQL (asyncpg) for production.
-   **AI Engine**: Google Gemini 1.5 Pro / Gemini Pro via `google-generativeai`.
-   **Speech Processing**: `gTTS` (Google Text-to-Speech).
-   **Task Queue**: Redis (optional, for background result processing).

#### Frontend
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **HTTP Client**: Fetch API

### Directory Structure

```
.
├── backend/
│   ├── app/
│   │   ├── routers/        # API Endpoints
│   │   │   ├── auth.py       # User authentication
│   │   │   ├── interview.py  # Core interview logic (chat, execution)
│   │   │   └── candidates.py # Resume uploads & profile management
│   │   ├── services/       # Business Logic
│   │   │   ├── llm_service.py    # Gemini integration
│   │   │   ├── code_executor.py  # Sandbox for running candidate code
│   │   │   └── interview_flow.py # State machine for interview rounds
│   │   ├── models.py       # SQLAlchemy Database Models
│   │   └── main.py         # App entry point
│   ├── requirements.txt
│   └── .env                # Config (API Keys, DB URL)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── interview/  # Round-specific components (Chat, Coding, MCQ)
│   │   ├── pages/          # Main application pages
│   │   └── context/        # React Context for auth user state
│   └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
-   Python 3.10+
-   Node.js 16+
-   Google Cloud API Key (Gemini)

### Backend Setup

1.  **Navigate to backend**:
    ```bash
    cd backend
    ```
2.  **Create virtual environment**:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    pip install aiosqlite
    ```
4.  **Configure Environment**:
    Create a `.env` file in `backend/`:
    ```env
    GEMINI_API_KEY=your_actual_api_key
    DATABASE_URL=sqlite+aiosqlite:///./interview.db
    # REDIS_URL=redis://localhost:6379/0  (Uncomment if using Redis)
    ```
5.  **Start Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    -   API: `http://localhost:8000`
    -   Docs: `http://localhost:8000/docs`

### Frontend Setup

1.  **Navigate to frontend**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start App**:
    ```bash
    npm run dev
    ```
    -   App: `http://localhost:5173`

## 🔌 API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new candidate |
| `POST` | `/auth/login` | Login and get JWT token |
| `POST` | `/candidates/upload_resume` | Upload PDF/Docx resume |
| `GET` | `/interview/{session_id}/state` | Get current round status |
| `POST` | `/interview/{session_id}/chat` | Send message to AI Interviewer |
| `POST` | `/interview/{session_id}/run_code` | Execute code in sandbox |
| `POST` | `/interview/{session_id}/speak` | Send audio blob -> Get AI audio response |

## ❓ Troubleshooting

**1. `socket.gaierror` when starting backend:**
-   Ensure your `.env` file is loaded correctly.
-   Check `database.py` imports `load_dotenv` before using `os.getenv`.

**2. Gemini 404 "Model not found":**
-   The model name might be deprecated or incorrect for your region.
-   Try `gemini-pro` or `models/gemini-pro-latest` in `backend/app/services/llm_service.py` (or router).
-   Run `python backend/list_models.py` (if created) to see available models.

**3. Database connection refused (PostgreSQL):**
-   If you are not using Docker, switch `DATABASE_URL` in `.env` to SQLite:
    `sqlite+aiosqlite:///./interview.db`
