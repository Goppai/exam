from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import traceback

from app.extract import extract_exam
from app.explain import explain_question

load_dotenv()

app = FastAPI(title="Exam AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"code": 1, "msg": str(exc), "data": None}
    )

@app.post("/api/extract")
async def extract_api(file: UploadFile = File(...), subject: str = "auto", debug: bool = False):
    data = await extract_exam(file, subject, debug)
    return {"code": 0, "msg": "ok", "data": data}

@app.post("/api/explain")
async def explain_api(payload: dict):
    data = explain_question(payload)
    return {"code": 0, "msg": "ok", "data": data}
