import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional

# Import our helper modules
from parser import extract_text_from_pdf
from analyzer import analyze_resume

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Resume Analyzer API", version="1.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """
    Simple health check endpoint to verify backend status and API key configuration.
    """
    api_key_set = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "gemini_api_key_configured": api_key_set
    }

@app.post("/api/analyze")
async def analyze_endpoint(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    """
    Endpoint to receive a resume (PDF or TXT) and optional job description,
    extract text, analyze it via Gemini API, and return structured analysis.
    """
    # Check if the API key is configured
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="Gemini API Key is not configured on the server. Please add it to your .env file."
        )

    # Validate file extension
    filename = resume.filename or ""
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    
    if extension not in ["pdf", "txt", "png", "jpg", "jpeg"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload PDF (.pdf), Text (.txt), or Images (.png, .jpg, .jpeg)."
        )

    try:
        file_bytes = await resume.read()
        
        # Analyze based on file format (Images go directly to Gemini, text is parsed locally)
        if extension in ["png", "jpg", "jpeg"]:
            mime_type = "image/png" if extension == "png" else "image/jpeg"
            analysis = analyze_resume(
                resume_image_bytes=file_bytes,
                resume_image_mime=mime_type,
                job_description=job_description
            )
        else:
            if extension == "pdf":
                resume_text = extract_text_from_pdf(file_bytes)
            else:  # txt
                try:
                    resume_text = file_bytes.decode("utf-8")
                except UnicodeDecodeError:
                    resume_text = file_bytes.decode("latin-1")
                    
            if not resume_text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded resume file contains no readable text."
                )
                
            analysis = analyze_resume(resume_text=resume_text, job_description=job_description)
            
        return analysis
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("main:app", host=host, port=port, reload=True)
