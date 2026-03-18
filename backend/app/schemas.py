from pydantic import BaseModel
from typing import List, Optional


class TopPrediction(BaseModel):
    rank: int
    class_name: str
    crop: str
    condition: str
    confidence: float


class DiseaseInfo(BaseModel):
    description: str
    severity: str
    cause: str
    treatment: str
    prevention: str


class PredictionResponse(BaseModel):
    success: bool
    class_name: str
    crop: str
    condition: str
    confidence: float
    is_healthy: bool
    top_3: List[TopPrediction]
    model_name: str = "EfficientNetB3"
    disease_info: Optional[DiseaseInfo] = None
    gradcam_image: Optional[str] = None