from fastapi import APIRouter
import psutil
import datetime
from api.core.ops.simulator import generate_telemetry

router = APIRouter()

@router.get("/status")
async def get_ops_status():
    return {"system_health": "stable", "cpu": psutil.cpu_percent(), "memory": psutil.virtual_memory()._asdict()}

@router.get("/logs")
async def get_pipeline_logs():
    return [{"timestamp": str(datetime.datetime.utcnow()), "pipeline": "system", "status": "success"}]

@router.get("/telemetry")
async def get_live_telemetry():
    return {"success": True, "data": generate_telemetry()}
