import os
import re

import anyio
import google.generativeai as genai
import requests
import yt_dlp
from fastapi import APIRouter, HTTPException

from api.routers.utils import validate_url_ssrf

router = APIRouter()

# Initialize Gemini if API key is present
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

def sync_get_video_info(url: str):
    ydl_opts = {'quiet': True, 'no_warnings': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            "id": info.get('id'),
            "title": info.get('title'),
            "thumbnail": info.get('thumbnail'),
            "duration": info.get('duration'),
            "uploader": info.get('uploader'),
            "description": info.get('description'),
            "formats": [
                {
                    "format_id": f.get('format_id'),
                    "ext": f.get('ext'),
                    "resolution": f.get('resolution'),
                    "filesize": f.get('filesize')
                } for f in info.get('formats', []) if f.get('filesize')
            ]
        }

@router.get("/info")
async def get_video_info(url: str):
    try:
        validate_url_ssrf(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        return await anyio.to_thread.run_sync(sync_get_video_info, url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def sync_summarize_video(url: str):
    # 1. Get transcript or description
    ydl_opts = {'quiet': True, 'skip_download': True, 'write_auto_sub': True, 'extract_flat': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        text_to_summarize = info.get('description', '')

    # 2. Call Gemini
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"Summarize the following YouTube video based on its metadata and description. URL: {url}\n\nContent:\n{text_to_summarize[:5000]}"
    response = model.generate_content(prompt)
    return response.text

@router.get("/summarize")
async def summarize_video(url: str):
    try:
        validate_url_ssrf(url)
    except ValueError as e:
        return {"success": False, "message": str(e)}

    if not GEMINI_KEY:
        return {"success": False, "message": "Gemini API key not configured"}

    try:
        summary_text = await anyio.to_thread.run_sync(sync_summarize_video, url)
        return {"success": True, "summary": summary_text}
    except Exception as e:
        return {"success": False, "message": str(e)}

def sync_download_media(url: str, format_id: str | None = None):
    ydl_opts = {'format': format_id if format_id else 'best'}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return {"url": info.get('url'), "filename": f"{info.get('title')}.{info.get('ext')}"}

@router.get("/download")
async def download_media(url: str, format_id: str | None = None):
    try:
        validate_url_ssrf(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        return await anyio.to_thread.run_sync(sync_download_media, url, format_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def sync_get_sponsors(video_id: str):
    res = requests.get(f"https://sponsor.ajay.app/api/skipSegments?videoID={video_id}", timeout=5)
    if res.status_code == 200:
        return {"success": True, "segments": res.json()}
    return {"success": False, "message": "No segments found"}

@router.get("/sponsor-segments")
async def get_sponsors(video_id: str):
    if not re.match(r'^[a-zA-Z0-9_-]{11}$', video_id):
        raise HTTPException(status_code=400, detail="Invalid video ID format")
    try:
        return await anyio.to_thread.run_sync(sync_get_sponsors, video_id)
    except Exception:
        return {"success": False, "message": "API error"}
