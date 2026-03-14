@echo off
echo Initializing Next.js frontend...
call npx -y create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
echo Initializing Python backend...
mkdir backend
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install fastapi uvicorn langchain langchain-google-genai google-generativeai pypdf faiss-cpu python-multipart
echo Initialization complete!
