import os
import shutil
import time

import anyio
from fastapi import APIRouter, File, HTTPException, UploadFile

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
async def ingest_codebase(files: list[UploadFile] = File(...)):
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    all_chunks = []
    try:
        for file in files:
            safe_filename = os.path.basename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, f"{int(time.time())}_{safe_filename}")
            with open(file_path, "wb") as b:
                shutil.copyfileobj(file.file, b)

            try:
                _, ext = os.path.splitext(safe_filename)
                chunks_data = await anyio.to_thread.run_sync(sync_process_file, file_path, ext, safe_filename)
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
