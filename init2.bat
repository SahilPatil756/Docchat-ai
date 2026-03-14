@echo off
echo Cleaning up old frontend...
rmdir /s /q frontend
echo Initializing Next.js frontend without installing dependencies...
call npx -y create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --skip-install < NUL
echo Installing Next.js dependencies manually...
cd frontend
call npm install --loglevel verbose
cd ..
echo Initializing Python backend...
if not exist backend mkdir backend
cd backend
if not exist venv python -m venv venv
call venv\Scripts\activate.bat
pip install fastapi uvicorn langchain langchain-google-genai google-generativeai pypdf faiss-cpu python-multipart
echo Initialization complete!
