# ResuMind AI - Resume Analyzer & ATS Optimizer

Welcome to **ResuMind AI**, an intelligent, premium, full-stack resume analysis application. The project is designed with a sleek, glassmorphic dark-themed frontend and a robust Python backend powered by **FastAPI** and the **Gemini 2.5 Flash API**. 

This project is tailored specifically to look highly professional, compile accurate analysis reports, and provide an interactive **Presentation Mode** containing visual speaking cues to make showcasing the project a breeze for beginners!

---

## Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── main.py            # FastAPI Application Server (CORS, REST API endpoints)
│   ├── parser.py          # PDF document text extractor using `pypdf`
│   ├── analyzer.py        # Gemini API integration using the `google-genai` SDK
│   ├── requirements.txt   # Python backend dependencies
│   ├── test_backend.py    # Environment diagnostic and API key test script
│   └── .env.example       # Example environment configuration
├── frontend/
│   ├── index.html         # Main dashboard layout (semantic HTML5, Presentation drawer)
│   ├── style.css          # Premium glassmorphic stylesheet (neon glows, animations)
│   └── app.js             # Client-side routing, API connection, dynamic SVG charts
└── README.md              # Project documentation & presentation guide (this file)
```

---

## Technical Features

1. **FastAPI Web Framework**: Provides a fast, self-documenting REST API.
2. **google-genai Python SDK**: Implements state-of-the-art multi-modal parsing and analysis using the latest **Gemini 2.5 Flash** model.
3. **Structured Response Formatting**: Uses Python Pydantic models to strictly enforce JSON output shapes from the AI, preventing syntax parsing failures on the client side.
4. **Interactive SVG Dashboard**: Renders a custom-animated radial match percentage gauge.
5. **Built-in Presentation Guide**: An overlay sidebar designed to guide you step-by-step through slide points and code workflows during your project presentation.

---

## Installation & Setup Guide

### Prerequisite
- Python 3.10+ installed on your computer.
- A Gemini API key from Google AI Studio. Get one here: [Google AI Studio](https://aistudio.google.com/).

### Step 1: Set Up the Backend
1. Open your terminal and navigate to the project directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (`venv`) to keep dependencies isolated:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   * **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
   * **Windows**:
     ```bash
     venv\Scripts\activate
     ```

4. Install the backend requirements:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up your Gemini API Key:
   - Duplicate `.env.example` and rename it to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` in your text editor and add your API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```

### Step 2: Diagnostic Check
Before launching the server, run the diagnostic script to verify your key and packages are configured correctly:
```bash
python test_backend.py
```
If you see `🎉 Backend environment is ready!`, you're good to go!

### Step 3: Run the Backend
Launch the FastAPI development server with reload enabled:
```bash
uvicorn main:app --reload
```
The backend API documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Step 4: Run the Frontend
Since the frontend uses basic fetch APIs, you can run a simple, lightweight local server.
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start a Python HTTP server:
   ```bash
   python3 -m http.server 3000
   ```
3. Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

## 🎓 Presentation Mode Cheat Sheet

When presenting this project, follow this structured talk track:

1. **Introduction**: 
   * *"This is ResuMind AI, a full-stack AI-powered resume intelligence application. It compares a candidate's resume against job descriptions to optimize their application for Applicant Tracking Systems (ATS)."*
2. **Frontend UI**:
   * Highlight the glassmorphic dark-themed layout, responsive styling, and dynamic SVG dashboard. Demonstrate dragging and dropping a resume.
3. **Backend & Text Extraction**:
   * *"When a resume is uploaded, the FastAPI backend parses it. We use the `pypdf` library to process PDF binary bytes directly in memory, converting them into clean string data."*
4. **AI & Structured JSON**:
   * *"We send the resume text and job description to the Gemini 2.5 Flash model using Google's official `google-genai` SDK."*
   * *"To prevent format mismatches, we enforce structured outputs by providing a Pydantic schema. Gemini always returns valid JSON containing a score, key strengths, weaknesses, and a skill gap analysis matching our model."*
5. **Demonstration**:
   * Click **Presentation Mode** on the top right to open the interactive panel and show off the integrated live health indicators!
