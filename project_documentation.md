# ResuMind AI — Technical Project Documentation

This document provides a comprehensive, file-by-file breakdown of **ResuMind AI**. Read this guide to understand exactly how the project is structured, what each block of code does, and why specific technologies were chosen.

---

## 🏗️ Architectural Overview (Decoupled Full-Stack)

ResuMind AI is built as a **decoupled full-stack application**:
* **Frontend**: Handles user interaction, drag-and-drop actions, UI state transitions, and responsive styling. It acts as the "Client".
* **Backend**: Handles data processing (parsing PDFs and communicating with the Gemini API). It acts as the "Server".

### Why this design was chosen:
1. **Security**: Keeping the API keys on the backend prevents them from being exposed to the client browser.
2. **Specialized Hosting**: The frontend is hosted on Netlify (which serves static assets instantly), while the backend is hosted on Render (which runs Python execution).
3. **Professional Standard**: Decoupling APIs from the user interface is the industry standard for modern software development (e.g., Netflix, Spotify, Gmail).

---

## 📂 File-by-File Breakdown

### 1. Root Level Configuration

#### [`.gitignore`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/.gitignore)
* **What it is**: A Git text configuration file.
* **Why it's used**: It tells Git which files to **never** upload to GitHub. We use it to ignore `venv/` (our virtual environment folder, which is too large) and `.env` (our secrets file containing the Gemini API key). This prevents credentials from leaking publicly.

---

### 2. Backend Component (`backend/`)

#### [`requirements.txt`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/backend/requirements.txt)
* **What it is**: A list of external Python libraries required by our project.
* **Why they are used**:
  * `fastapi`: The web framework to build our API endpoints.
  * `uvicorn`: The high-speed server that runs our FastAPI application.
  * `pypdf`: To read and extract text from uploaded PDF resumes in-memory.
  * `google-genai`: The official Google SDK to interface with Gemini.
  * `python-dotenv`: To load configuration keys from the `.env` file.
  * `pydantic`: For data validation and structured output formatting.
  * `python-multipart`: Enables FastAPI to parse incoming file uploads.

#### [`.env` & `.env.example`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/backend/.env)
* **What it is**: Environment files.
* **Why they are used**: `.env` is our private keys file where we define `GEMINI_API_KEY`. `.env.example` is a placeholder file pushed to GitHub to guide other developers on how to name their variables.

#### [`main.py`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/backend/main.py)
* **What it is**: The core entrypoint of our API server.
* **Key Mechanisms**:
  * **CORS Config**: Adds `CORSMiddleware` to allow requests from all origins (so our Netlify frontend can talk to our Render backend).
  * **`/api/health` Endpoint**: A simple ping path to check if the server is running and if the API key is active.
  * **`/api/analyze` Endpoint**: Receives the file and job description. It checks if the file is a PDF, Text file, or Image (PNG/JPG). If it's a PDF, it routes it to `parser.py` to extract text. If it is an image, it passes the raw bytes directly to `analyzer.py`.

#### [`parser.py`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/backend/parser.py)
* **What it is**: The PDF document text extractor.
* **Why it's used**: It takes raw PDF bytes, loads them using `io.BytesIO` (meaning the PDF is processed entirely in-memory and never written to the server's hard drive for privacy), loops through each page, extracts text with `pypdf`, and merges it into a single clean string.

#### [`analyzer.py`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/backend/analyzer.py)
* **What it is**: The AI orchestrator linking FastAPI to Gemini.
* **Key Mechanisms**:
  * **Pydantic Validation Models**: We define two schemas, `SkillGapItem` and `ResumeAnalysis`. These force the Gemini model to respond in a structured JSON schema containing specific keys (like `score`, `strengths`, `weaknesses`, `skill_gap`) instead of raw sentences.
  * **Multimodal Execution**: If the resume is an image, it wraps the bytes inside `types.Part.from_bytes` and forwards it to Gemini alongside instructions. Gemini reads the screenshot directly, eliminating the need for local OCR systems (like Tesseract).
  * **Configuration Parameters**: Sets `response_mime_type="application/json"` and `response_schema=ResumeAnalysis`. We use `gemini-2.5-flash` for high-speed, cost-efficient analysis.

#### [`test_backend.py`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/backend/test_backend.py)
* **What it is**: A diagnostic helper script.
* **Why it's used**: It checks if Python requirements are set up, loads `.env`, and tests the connection to Gemini. It's used by developers to make sure the environment is correct before launching the actual server.

---

### 3. Frontend Component (`frontend/`)

#### [`index.html`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/frontend/index.html)
* **What it is**: The visual blueprint of our website.
* **Key Features**:
  * **Drag & Drop Upload Zone**: Contains a file input styled as a glowing dashboard card.
  * **Result Panel Structure**: Includes placeholders, a custom radial SVG circular progress chart for the match score, and structured tables/lists for strengths, weaknesses, and skill gaps.
  * **Theme Picker & Emojis**: Top-right contains interactive selectors for theme accents and a mode button showing sun/moon emojis.
  * **Footer Info**: Dedicated "About Us", "Core Features", and "Contact Info" grid.

#### [`style.css`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/frontend/style.css)
* **What it is**: The layout and styling engine.
* **Key Features**:
  * **Glassmorphism**: Uses `background: rgba(17, 19, 31, 0.55)` and `backdrop-filter: blur(16px)` to create a sleek frosted-glass container aesthetic.
  * **Theme Overrides**: Overrides variables like `--primary` and `--secondary` when classes like `body.theme-emerald` or `body.light-theme` are applied.
  * **Laser Scanner Keyframes**: Defines the vertical scanline animation (`@keyframes scanLaser`) that moves up and down inside the loading overlay container.
  * **Mobile Responsiveness**: Uses `@media (max-width: 768px)` media queries to stack elements vertically, shrink paddings, and optimize button tap targets for smartphones.

#### [`app.js`](file:///Users/laxmiverma/Desktop/ai-resume-analyzer/frontend/app.js)
* **What it is**: The client logic engine.
* **Key Mechanisms**:
  * **Drag & Drop Listeners**: Tracks file drops over the zone, performs file extension checks (`.pdf`, `.txt`, `.png`, `.jpg`, `.jpeg`), and updates the UI preview icons.
  * **Dynamic Server Router**: Uses `window.location.hostname` to detect if the page is running locally. If it runs on `localhost`, it targets the local server (`http://127.0.0.1:8000`); otherwise, it automatically routes calls to the Render server (`https://ai-resume-analyser-yk2g.onrender.com`).
  * **Scanning Sequence Simulation**: When the form is submitted, it shows the loader card and loops through statuses periodically (e.g. "Extracting Content Layout", "Auditing Skill Sets") to keep the UI engaging while fetching data.
  * **Radial Score Animation**: Calculates the SVG circle properties:
    $$\text{Circumference} = 2 \times \pi \times \text{Radius} \approx 314$$
    It transitions the `strokeDashoffset` from `314` (empty) to the target offset based on the ATS score, while counting up the percentage number.
  * **Preferences Caching**: Checks `localStorage` on page launch to restore the client's preferred color accent and Day/Night setting.
