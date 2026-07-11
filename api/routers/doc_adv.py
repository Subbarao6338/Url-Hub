from fastapi import APIRouter, HTTPException
from deep_translator import GoogleTranslator
from pydantic import BaseModel

router = APIRouter()

class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: str = 'auto'

@router.post("/translate")
async def translate_text(request: TranslationRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        translated = GoogleTranslator(source=request.source_lang, target=request.target_lang).translate(request.text)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
