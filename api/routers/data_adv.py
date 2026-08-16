import io

import anyio
import numpy as np
import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()


def sync_detect_anomalies(file_content: bytes):
    df = pd.read_csv(io.BytesIO(file_content))
    numeric_df = df.select_dtypes(include=[np.number]).fillna(0)
    if numeric_df.empty:
        return {"success": False, "error": "No numeric columns"}
    mean = numeric_df.mean()
    std = numeric_df.std()
    anomalies = ((numeric_df - mean).abs() > 3 * std).any(axis=1)
    return {"success": True, "anomaly_count": int(anomalies.sum()), "anomalies": df[anomalies].head(10).to_dict(orient="records")}


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/anomaly-detect")
async def detect_anomalies(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10 MB")
        return await anyio.to_thread.run_sync(sync_detect_anomalies, content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def sync_check_quality(file_content: bytes):
    df = pd.read_csv(io.BytesIO(file_content))
    return {"success": True, "report": [{"column": str(c), "missing": int(df[c].isnull().sum()), "unique": int(df[c].nunique())} for c in df.columns]}


@router.post("/data-quality")
async def check_quality(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10 MB")
        return await anyio.to_thread.run_sync(sync_check_quality, content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
