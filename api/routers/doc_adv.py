import anyio
from deep_translator import GoogleTranslator
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: str = "auto"


def sync_translate(text: str, source_lang: str, target_lang: str):
    return GoogleTranslator(source=source_lang, target=target_lang).translate(text)


@router.post("/translate")
async def translate_text(request: TranslationRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        translated = await anyio.to_thread.run_sync(sync_translate, request.text, request.source_lang, request.target_lang)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
