from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model & encoder
with open("crop_production_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("target_encoder.pkl", "rb") as f:
    encoder = pickle.load(f)

class CropInput(BaseModel):
    Crop: str
    Season: str
    Area: float
    Yield: float
    Year: int

@app.get("/")
def root():
    return {"message": "Crop Production API running"}

@app.post("/predict")
def predict(data: CropInput):
    try:
        print("Received input:", data)

        crop = data.Crop.strip()
        season = data.Season.strip()

        input_df = pd.DataFrame([{
            "Crop": crop,
            "Season": season,
            "Area": data.Area,
            "Yield": data.Yield,
            "Year": data.Year
        }])

        input_df[["Crop", "Season"]] = encoder.transform(
            input_df[["Crop", "Season"]]
        )

        X = input_df[["Crop", "Yield", "Area", "Season", "Year"]]
        prediction = model.predict(X)[0]

        return {"predicted_production": round(float(prediction), 2)}

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
