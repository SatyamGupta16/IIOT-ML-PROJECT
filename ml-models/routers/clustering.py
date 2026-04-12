from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import numpy as np

router = APIRouter()

# Load model
with open("models/clustering_model.pkl", "rb") as f:
    data = pickle.load(f)
    model = data['model']
    scaler = data['scaler']
    label_encoder = data['label_encoder']

class ClusteringInput(BaseModel):
    age: float
    blood_pressure: float
    cholesterol: float
    max_heart_rate: float
    plasma_glucose: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float

@router.post("/predict/clustering")
def predict_clustering(input: ClusteringInput):
    features = [[
        input.age,
        input.blood_pressure,
        input.cholesterol,
        input.max_heart_rate,
        input.plasma_glucose,
        input.skin_thickness,
        input.insulin,
        input.bmi,
        input.diabetes_pedigree
    ]]
    scaled = scaler.transform(features)
    prediction = model.predict(scaled)[0]
    triage_level = label_encoder.inverse_transform([prediction])[0]

    return {
        "prediction": int(prediction),
        "result": f"Triage Level: {triage_level}",
        "triage": triage_level
    }