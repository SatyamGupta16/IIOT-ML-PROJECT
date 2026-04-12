from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import numpy as np

router = APIRouter()

# Load model
with open("models/diabetes_model.pkl", "rb") as f:
    data = pickle.load(f)
    model = data['model']
    scaler = data['scaler']

class DiabetesInput(BaseModel):
    age: float
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float

@router.post("/predict/diabetes")
def predict_diabetes(input: DiabetesInput):
    features = [[
        input.age,
        input.bmi,
        input.HbA1c_level,
        input.blood_glucose_level
    ]]
    scaled = scaler.transform(features)
    prediction = model.predict(scaled)[0]
    probability = model.predict_proba(scaled)[0][1]

    return {
        "prediction": int(prediction),
        "result": "Diabetes Positive" if prediction == 1 else "Diabetes Negative",
        "confidence": round(float(probability) * 100, 2)
    }