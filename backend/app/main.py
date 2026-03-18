import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.model import load_model_once, predict_image
from app.schemas import PredictionResponse

load_dotenv()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
PORT            = int(os.getenv("PORT", "8000"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from download_model import download_model
        download_model()
    except Exception as e:
        print(f"[startup] Model download warning: {e}")
    load_model_once()
    yield


app = FastAPI(
    title="LeafScan AI — Plant Disease Detection API",
    description="Upload a leaf image and get an instant plant disease diagnosis.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "LeafScan AI API is running",
        "docs":    "/docs",
        "predict": "POST /predict",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    allowed_types = {"image/jpeg", "image/png", "image/jpg"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a JPG or PNG image.",
        )

    image_bytes = await file.read()

    try:
        result = predict_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result