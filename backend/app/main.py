from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.extract import extract_exam
from app.explain import explain_question

load_dotenv()

app = FastAPI(title="Exam AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 开发阶段先放开
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/extract")
async def extract_api(file: UploadFile = File(...), subject: str = "auto"):
    return await extract_exam(file, subject)


@app.post("/api/explain")
async def explain_api(payload: dict):
    return explain_question(payload)
