from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

router = APIRouter()

with open("models/heart_model.pkl", "rb") as f:
    data = pickle.load(f)
    model = data['model']
    scaler = data['scaler']
    feature_columns = data['feature_columns']

class HeartInput(BaseModel):
    General_Health: str
    Checkup: str
    Exercise: str
    Skin_Cancer: str
    Other_Cancer: str
    Depression: str
    Diabetes: str
    Arthritis: str
    Sex: str
    Age_Category: str
    Height_cm: float
    Weight_kg: float
    BMI: float
    Smoking_History: str
    Alcohol_Consumption: float
    Fruit_Consumption: float
    Green_Vegetables_Consumption: float
    FriedPotato_Consumption: float

@router.post("/predict/heart")
def predict_heart(input: HeartInput):
    input_dict = {
        'General_Health': input.General_Health,
        'Checkup': input.Checkup,
        'Exercise': input.Exercise,
        'Skin_Cancer': input.Skin_Cancer,
        'Other_Cancer': input.Other_Cancer,
        'Depression': input.Depression,
        'Diabetes': input.Diabetes,
        'Arthritis': input.Arthritis,
        'Sex': input.Sex,
        'Age_Category': input.Age_Category,
        'Height_(cm)': input.Height_cm,
        'Weight_(kg)': input.Weight_kg,
        'BMI': input.BMI,
        'Smoking_History': input.Smoking_History,
        'Alcohol_Consumption': input.Alcohol_Consumption,
        'Fruit_Consumption': input.Fruit_Consumption,
        'Green_Vegetables_Consumption': input.Green_Vegetables_Consumption,
        'FriedPotato_Consumption': input.FriedPotato_Consumption
    }

    input_df = pd.DataFrame([input_dict])
    input_encoded = pd.get_dummies(input_df)
    input_encoded = input_encoded.reindex(columns=feature_columns, fill_value=0)

    scaled = scaler.transform(input_encoded)
    prediction = model.predict(scaled)[0]

    # ✅ Fix: convert Yes/No to 1/0
    if str(prediction) == 'Yes':
        pred_int = 1
    elif str(prediction) == 'No':
        pred_int = 0
    else:
        pred_int = int(prediction)

    # Get confidence
    try:
        probability = model.predict_proba(scaled)[0][1]
        confidence = round(float(probability) * 100, 2)
    except:
        confidence = 0.0

    return {
        "prediction": pred_int,
        "result": "Heart Disease Positive" if pred_int == 1 else "Heart Disease Negative",
        "confidence": confidence
    }