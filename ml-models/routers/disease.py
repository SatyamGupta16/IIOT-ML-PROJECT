from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import numpy as np
from typing import Dict

router = APIRouter()

# Load model
with open("models/disease_model.pkl", "rb") as f:
    data = pickle.load(f)
    model = data['model']
    scaler = data['scaler']
    label_encoder = data['label_encoder']
    symptom_columns = data['symptom_columns']

class DiseaseInput(BaseModel):
    symptoms: Dict[str, int]  # e.g. {"itching": 1, "fever": 0, ...}

@router.post("/predict/disease")
def predict_disease(input: DiseaseInput):
    # Build input array in correct column order
    features = [input.symptoms.get(col, 0) for col in symptom_columns]
    features_array = np.array(features).reshape(1, -1)
    scaled = scaler.transform(features_array)
    prediction = model.predict(scaled)[0]
    disease_name = label_encoder.inverse_transform([prediction])[0]

    return {
        "prediction": int(prediction),
        "result": disease_name,
        "confidence": round(float(max(model.predict_proba(scaled)[0])) * 100, 2)
    }