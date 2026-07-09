import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional

# Define the Pydantic models for structured output
class SkillGapItem(BaseModel):
    skill: str = Field(description="Name of the technical or soft skill")
    status: str = Field(description="Must be exactly one of: 'Matched' (found in resume), 'Missing' (in JD but not resume), or 'Partial' (partially represented)")
    detail: str = Field(description="Short sentence explaining why this rating was given")

class ResumeAnalysis(BaseModel):
    score: int = Field(description="Overall compatibility/match score from 0 to 100")
    summary: str = Field(description="A concise 2-3 sentence summary of the candidate's profile based on the resume")
    strengths: List[str] = Field(description="3-5 key professional strengths found in the resume")
    weaknesses: List[str] = Field(description="3-5 key weaknesses, missing achievements, or gaps in the resume")
    skill_gap: List[SkillGapItem] = Field(description="List of core skills evaluated against the job requirements (if JD is provided), or general core skills found in the resume")
    recommendations: List[str] = Field(description="3-5 actionable steps the candidate can take to improve their resume")
    keywords: List[str] = Field(description="10-15 recommended keywords, technologies, or buzzwords to add to improve ATS match")
    match_explanation: str = Field(description="A summary explaining the score and general compatibility with the target job")

def analyze_resume(
    resume_text: Optional[str] = None,
    resume_image_bytes: Optional[bytes] = None,
    resume_image_mime: Optional[str] = None,
    job_description: Optional[str] = None
) -> ResumeAnalysis:
    """
    Analyzes resume (text or image) using Gemini 2.5 Flash API with a structured JSON output.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please add it to your .env file.")

    # Initialize Gemini client
    client = genai.Client(api_key=api_key)

    # Construct instructions
    system_instruction = (
        "You are an expert ATS (Applicant Tracking System) optimizer and professional recruiter. "
        "Your task is to analyze the candidate's resume (provided as text or as an image) and compare it with the job description (if provided). "
        "Provide a detailed, objective, and constructive analysis. "
        "You must return the analysis strictly conforming to the specified JSON schema."
    )

    contents = []

    # Handle multimodal input: image vs text
    if resume_image_bytes:
        image_part = types.Part.from_bytes(
            data=resume_image_bytes,
            mime_type=resume_image_mime or "image/png"
        )
        contents.append(image_part)
        contents.append("Please analyze this resume image.")
    else:
        contents.append(f"RESUME TEXT:\n{resume_text}\n\n")

    # Add job description prompt
    if job_description:
        contents.append(f"TARGET JOB DESCRIPTION:\n{job_description}\n\n")
    else:
        contents.append("TARGET JOB DESCRIPTION: No specific job description provided. Analyze the resume generally for industry standard roles indicated by the resume contents.\n\n")

    contents.append(
        "Please perform the resume analysis, scoring compatibility from 0 to 100, "
        "listing key strengths and weaknesses, analyzing the skill gap, "
        "and suggesting improvements and keywords."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=ResumeAnalysis,
                temperature=0.2,
            )
        )
        return ResumeAnalysis.model_validate_json(response.text)
    except Exception as e:
        raise RuntimeError(f"Gemini API request failed: {str(e)}")
