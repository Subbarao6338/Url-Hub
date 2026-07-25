from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional
import os, time, shutil, random
import anyio
from api.core.notion.parsers import process_uploaded_document

router = APIRouter()
UPLOAD_FOLDER = "/tmp/agent_cache"

def sync_process_file(file_path: str, ext: str, file_name: str):
    chunks = process_uploaded_document(file_path, ext)
    result = []
    for i, chunk in enumerate(chunks):
        result.append({
            "pageContent": chunk,
            "metadata": {"filename": file_name, "chunkIndex": i}
        })
    return result

@router.post("/ingest")
async def ingest_codebase(files: List[UploadFile] = File(...)):
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    all_chunks = []
    try:
        for file in files:
            file_path = os.path.join(UPLOAD_FOLDER, f"{int(time.time())}_{file.filename}")
            with open(file_path, "wb") as b:
                shutil.copyfileobj(file.file, b)

            try:
                _, ext = os.path.splitext(file.filename)
                chunks_data = await anyio.to_thread.run_sync(sync_process_file, file_path, ext, file.filename)
                all_chunks.extend(chunks_data)
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)

        return {"success": True, "chunks": all_chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_agent_status():
    return {"status": "idle", "message": "Agent is ready"}
