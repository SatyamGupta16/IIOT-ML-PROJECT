# 🏥 HealthCare AI — Full-Stack Healthcare Prediction & Diagnosis System

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-F7931E?style=flat-square&logo=scikit-learn)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

> An AI-powered healthcare web application for disease prediction and diagnosis using machine learning models. Built for doctors and patients with role-based access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [ML Models](#ml-models)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

---

## 🎯 Overview

HealthCare AI is a full-stack web application that connects doctors and patients through a secure platform. Doctors can run ML-powered predictions, manage patient records, and write digital prescriptions. Patients can view their prediction results, prescriptions, and health history.

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL + Row Level Security |
| ML Backend | FastAPI (Python) |
| ML Models | Scikit-learn (Logistic Regression) |
| Charts | Recharts |
| Model Storage | Pickle (.pkl files) |

---

## ✨ Features

### 👨‍⚕️ Doctor Features
- Secure login/signup with role-based access
- Dashboard with real-time analytics and charts
- Patient management (add, view, list patients)
- Run 4 different ML predictions for patients
- Write digital prescriptions and notes
- View prediction history and trends
- Weekly predictions bar chart
- Predictions by type donut chart

### 🧑 Patient Features
- Secure login/signup
- View all prediction results with confidence scores
- View doctor prescriptions and notes
- Track personal health history
- Navigate easily between sections

---

## 🧠 ML Models

| Model | Algorithm | Dataset | Output |
|---|---|---|---|
| General Disease Prediction | Logistic Regression | Training.csv (130+ symptoms) | Disease name (prognosis) |
| Diabetes Prediction | Logistic Regression | diabetes_prediction_dataset.csv | Positive / Negative |
| Heart Disease Prediction | Logistic Regression | CVD_cleaned.csv | Positive / Negative |
| Patient Clustering (Triage) | Logistic Regression | patient_priority.csv | Triage level (yellow/orange/red/green) |

---

## 📁 Project Structure

```
IIOT-ML-PROJECT/
│
├── healthcare-app/                    # Next.js Frontend
│   ├── app/
│   │   ├── page.js                    # Landing page
│   │   ├── login/page.js              # Login
│   │   ├── signup/page.js             # Signup
│   │   ├── doctor/
│   │   │   ├── dashboard/page.js      # Doctor dashboard + charts
│   │   │   ├── patients/page.js       # Patient list
│   │   │   ├── patients/add/page.js   # Add patient
│   │   │   └── prescriptions/page.js  # Write prescriptions
│   │   ├── patient/
│   │   │   └── dashboard/page.js      # Patient dashboard
│   │   └── predict/
│   │       ├── diabetes/page.js       # Diabetes form
│   │       ├── heart/page.js          # Heart disease form
│   │       ├── disease/page.js        # Symptom checkboxes
│   │       └── clustering/page.js     # Patient clustering form
│   ├── lib/
│   │   └── supabaseClient.js          # Supabase connection
│   └── .env.local                     # Environment variables
│
└── ml-models/                         # FastAPI ML Backend
    ├── main.py                        # FastAPI app entry point
    ├── routers/
    │   ├── diabetes.py                # /predict/diabetes
    │   ├── heart.py                   # /predict/heart
    │   ├── disease.py                 # /predict/disease
    │   └── clustering.py              # /predict/clustering
    └── models/
        ├── diabetes_model.pkl
        ├── heart_model.pkl
        ├── disease_model.pkl
        └── clustering_model.pkl
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Anaconda (recommended)
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/SatyamGupta16/IIOT-ML-PROJECT.git
cd IIOT-ML-PROJECT
```

### 2. Setup Frontend (Next.js)

```bash
cd healthcare-app
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the frontend:
```bash
npm run dev
```
Runs on → `http://localhost:3000`

---

### 3. Setup ML Backend (FastAPI)

```bash
cd ml-models
pip install fastapi uvicorn scikit-learn pandas numpy python-multipart
```

#### Generate .pkl model files (run once):

```bash
python save_diabetes_model.py
python save_heart_model.py
python save_disease_model.py
python save_clustering_model.py
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
Runs on → `http://localhost:8000`

API Docs → `http://localhost:8000/docs`

---

### 4. Setup Supabase Database

Run this SQL in Supabase SQL Editor:

```sql
-- Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  contact TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  disease_type TEXT NOT NULL CHECK (disease_type IN ('general', 'diabetes', 'heart', 'clustering')),
  input_data JSONB NOT NULL,
  result TEXT NOT NULL,
  confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  prescription_text TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔑 Environment Variables

### `healthcare-app/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/predict/disease` | Predict disease from symptoms |
| POST | `/predict/diabetes` | Predict diabetes risk |
| POST | `/predict/heart` | Predict heart disease risk |
| POST | `/predict/clustering` | Predict patient triage level |

### Example: `/predict/diabetes`

**Request:**
```json
{
  "age": 45,
  "bmi": 28.5,
  "HbA1c_level": 7.2,
  "blood_glucose_level": 180
}
```

**Response:**
```json
{
  "prediction": 1,
  "result": "Diabetes Positive",
  "confidence": 79.83
}
```

---

## 🗄️ Database Schema

```
profiles          patients           predictions         prescriptions
────────────      ──────────────     ───────────────     ──────────────────
id (PK)           id (PK)            id (PK)             id (PK)
full_name         profile_id (FK)    patient_id (FK)     patient_id (FK)
role              doctor_id (FK)     disease_type        doctor_id (FK)
email             full_name          input_data (JSONB)  prescription_text
created_at        age                result              notes
                  gender             confidence          created_at
                  contact            created_at
                  medical_history
                  created_at
```

---

## 🏃 Running the Full App

Open **two terminals:**

**Terminal 1 — FastAPI:**
```bash
cd IIOT-ML-PROJECT/ml-models
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Next.js:**
```bash
cd IIOT-ML-PROJECT/healthcare-app
npm run dev
```

Then open `http://localhost:3000` 🚀

---

## 👥 User Roles

### Doctor Account
- Sign up at `/signup` → select **Doctor**
- Access: Full dashboard, patient management, predictions, prescriptions

### Patient Account
- Sign up at `/signup` → select **Patient**
- Access: View predictions, prescriptions, health history

---

## 📊 System Architecture

```
Browser (Next.js)
      │
      ├── Supabase ──── Auth + Database (PostgreSQL)
      │                  └── profiles, patients, predictions, prescriptions
      │
      └── FastAPI ──── ML Models (.pkl)
                        ├── disease_model.pkl (130+ symptoms)
                        ├── diabetes_model.pkl
                        ├── heart_model.pkl
                        └── clustering_model.pkl
```

---

## 🛠️ Built With

- [Next.js](https://nextjs.org/) — React framework
- [Supabase](https://supabase.com/) — Backend as a Service
- [FastAPI](https://fastapi.tiangolo.com/) — Python API framework
- [Scikit-learn](https://scikit-learn.org/) — Machine learning
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Recharts](https://recharts.org/) — Charts and graphs

---

## 👨‍💻 Author

**Satyam Gupta**
- GitHub: [@SatyamGupta16](https://github.com/SatyamGupta16)

---

## 📄 License

This project is for educational purposes as part of the IIOT-ML-PROJECT.

---

*Built with ❤️ using Next.js · FastAPI · Supabase · Machine Learning*
