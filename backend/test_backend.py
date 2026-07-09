import os
import sys
from dotenv import load_dotenv

# Load env variables from .env if present
load_dotenv()

def test_api_key():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY is not set in your .env file or environment!")
        print("Please create a backend/.env file with: GEMINI_API_KEY=your_key_here")
        return False
        
    print(f"🔑 GEMINI_API_KEY found: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")
    
    try:
        from google import genai
        print("📦 Importing google-genai SDK... Success!")
    except ImportError:
        print("❌ ERROR: google-genai library is not installed.")
        print("Please install requirements: pip install -r requirements.txt")
        return False
        
    try:
        print("🤖 Connecting to Gemini 2.5 Flash to test the key...")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents="Say 'API connection successful!' and nothing else.",
        )
        print(f"✅ SUCCESS: Gemini API responded: '{response.text.strip()}'")
        return True
    except Exception as e:
        print(f"❌ ERROR: Gemini API call failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=========================================")
    print("🔍 AI Resume Analyzer - Backend Diagnostics")
    print("=========================================")
    success = test_api_key()
    print("=========================================")
    if success:
        print("🎉 Backend environment is ready!")
    else:
        print("⚠️ Some checks failed. Please resolve them before starting the backend server.")
