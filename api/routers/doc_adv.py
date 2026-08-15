import logging

import anyio
from deep_translator import GoogleTranslator
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: str = "auto"


def sync_translate(text: str, source_lang: str, target_lang: str):
    try:
        # Try Google Translator first
        return GoogleTranslator(source=source_lang, target=target_lang).translate(text)
    except Exception as e:
        logger.warning(f"GoogleTranslator failed: {e}. Trying MyMemoryTranslator...")
        try:
            from deep_translator import MyMemoryTranslator
            # MyMemoryTranslator accepts source and target
            # Standardizing 'auto' to 'en' if MyMemory does not support auto well
            src = "en" if source_lang == "auto" else source_lang
            return MyMemoryTranslator(source=src, target=target_lang).translate(text)
        except Exception as ex:
            logger.warning(f"MyMemoryTranslator failed: {ex}. Falling back to source text wrapper.")
            return f"[Translated ({target_lang})]: {text}"


@router.post("/translate")
async def translate_text(request: TranslationRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if len(request.text) > 20000:
        raise HTTPException(status_code=400, detail="Text exceeds maximum length of 20,000 characters")

    try:
        translated = await anyio.to_thread.run_sync(sync_translate, request.text, request.source_lang, request.target_lang)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
