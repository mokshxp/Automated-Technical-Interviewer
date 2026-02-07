# Automated Technical Interviewer

An AI-powered platform for conducting automated technical interviews, featuring resume analysis, coding assessments, and spoken technical rounds.

## Features

-   **Resume Analysis**: Upload a resume to tailor the interview process.
-   **Online Assessment (OA)**:
    -   Multiple Choice Questions (MCQ) on core CS concepts.
    -   Coding Challenges with an integrated code editor and test cases.
-   **Technical Rounds**:
    -   **Round 1**: Data Structures & Algorithms (DSA).
    -   **Round 2**: System Design & Projects.
    -   AI-driven chat interface for interactive problem-solving.
-   **Spoken Interview**: Real-time voice interaction using Gemini 1.5 Pro and Text-to-Speech.
-   **Behavioral Round**: STAR method-based behavioral questions.
-   **Automated Evaluation**: Instant feedback and scoring.

## Tech Stack

### Backend
-   **FastAPI**: High-performance Python web framework.
-   **SQLite (via aiosqlite)**: Lightweight asynchronous database for local development.
-   **Google Gemini 1.5 Pro**: LLM for generating questions, evaluating code, and conversation.
-   **WebSockets**: Real-time communication (planned/partial support).

### Frontend
-   **React (Vite)**: Modern, fast frontend framework.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **TypeScript**: Type-safe development.

## Setup Instructions

### Prerequisites
-   Python 3.10+
-   Node.js 16+
-   Google Cloud API Key with Gemini Access

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    pip install aiosqlite  # Ensure SQLite driver is installed
    ```
4.  Configure Environment Variables:
    -   Create a `.env` file in the `backend` directory.
    -   Add your API key and Database URL:
        ```
        GEMINI_API_KEY=your_api_key_here
        DATABASE_URL=sqlite+aiosqlite:///./interview.db
        REDIS_URL=redis://localhost:6379/0 (Optional for local dev)
        ```
5.  Start the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## Usage

1.  Open the frontend application.
2.  Register/Login as a candidate.
3.  Upload your resume to start the interview pipeline.
4.  Progress through the OA, Technical, and Behavioral rounds.
