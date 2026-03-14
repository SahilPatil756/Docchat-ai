import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env vars
load_dotenv()

from services.pdf_service import process_pdf
from services.llm_service import chat_with_doc, summarize_doc, generate_quiz

app = FastAPI(title="DocChat AI API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "DocChat AI Backend Running"}

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        chunks_count = process_pdf(file_path)
        return {"message": "PDF processed successfully", "chunks": chunks_count, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        result = chat_with_doc(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize():
    try:
        result = summarize_doc()
        return {"summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz")
async def quiz():
    try:
        result = generate_quiz()
        return {"quiz": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
