"""
EnLearn Backend - Pronunciation Practice API
Uses OpenAI Whisper for transcription and compares with original text
"""

import os
import tempfile
import re
from difflib import SequenceMatcher
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Lazy load whisper to avoid import errors during development
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        import whisper
        # Use "base" model for balance of speed and accuracy
        # Options: tiny, base, small, medium, large
        whisper_model = whisper.load_model("base")
    return whisper_model

app = FastAPI(
    title="EnLearn API",
    description="Pronunciation practice API with speech recognition",
    version="1.0.0"
)

# CORS for Expo web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WordScore(BaseModel):
    """Score for each word in the phrase"""
    word: str
    score: float  # 0-100
    color: str  # green, yellow, orange, red


class TranscriptionResult(BaseModel):
    """Result of pronunciation analysis"""
    original_text: str
    transcribed_text: str
    word_scores: List[WordScore]
    overall_score: float


def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    # Remove punctuation and convert to lowercase
    text = re.sub(r'[^\w\s]', '', text.lower())
    return ' '.join(text.split())


def get_color_from_score(score: float) -> str:
    """Map score to color"""
    if score >= 90:
        return "green"
    elif score >= 70:
        return "yellow"
    elif score >= 50:
        return "orange"
    else:
        return "red"


def calculate_word_similarity(original: str, transcribed: str) -> float:
    """Calculate similarity between two words using SequenceMatcher (pure Python)"""
    if not original or not transcribed:
        return 0.0
    
    # Normalize both words
    orig = original.lower().strip()
    trans = transcribed.lower().strip()
    
    if orig == trans:
        return 100.0
    
    # Calculate similarity ratio (0-1) using difflib
    ratio = SequenceMatcher(None, orig, trans).ratio()
    return ratio * 100


def align_and_score_words(original_text: str, transcribed_text: str) -> List[WordScore]:
    """
    Align original words with transcription and score each word.
    Uses dynamic programming for optimal alignment.
    """
    original_words = normalize_text(original_text).split()
    transcribed_words = normalize_text(transcribed_text).split()
    
    if not original_words:
        return []
    
    if not transcribed_words:
        # No transcription - all words are red
        return [
            WordScore(word=word, score=0.0, color="red")
            for word in original_text.split()
        ]
    
    # Use sequence matching for alignment
    word_scores = []
    original_display_words = original_text.split()
    
    # Create a mapping from normalized to display words
    for i, display_word in enumerate(original_display_words):
        normalized_orig = normalize_text(display_word)
        
        if not normalized_orig:
            # Punctuation-only word, give it full score
            word_scores.append(WordScore(word=display_word, score=100.0, color="green"))
            continue
        
        # Find best matching transcribed word
        best_score = 0.0
        for trans_word in transcribed_words:
            similarity = calculate_word_similarity(normalized_orig, trans_word)
            if similarity > best_score:
                best_score = similarity
        
        # Apply position penalty if word wasn't found in expected position
        if i < len(transcribed_words):
            position_similarity = calculate_word_similarity(normalized_orig, transcribed_words[i])
            # Blend position-based and best-match scores
            best_score = max(best_score * 0.8, position_similarity)
        
        color = get_color_from_score(best_score)
        word_scores.append(WordScore(word=display_word, score=best_score, color=color))
    
    return word_scores


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "EnLearn API is running"}


@app.get("/phrases")
async def get_phrases():
    """Get all practice phrases organized by difficulty"""
    return {
        "phrases": PHRASES,
        "total": len([p for level in PHRASES.values() for p in level])
    }


@app.post("/transcribe", response_model=TranscriptionResult)
async def transcribe_audio(
    audio: UploadFile = File(...),
    original_text: str = Form(...)
):
    """
    Transcribe audio and compare with original text.
    Returns word-by-word scores with colors.
    """
    # Save uploaded audio to temp file
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Transcribe with whisper
        model = get_whisper_model()
        result = model.transcribe(
            temp_path,
            language="en",
            fp16=False  # Use fp32 for CPU compatibility
        )
        
        transcribed_text = result["text"].strip()
        
        # Calculate word scores
        word_scores = align_and_score_words(original_text, transcribed_text)
        
        # Calculate overall score
        if word_scores:
            overall_score = sum(ws.score for ws in word_scores) / len(word_scores)
        else:
            overall_score = 0.0
        
        return TranscriptionResult(
            original_text=original_text,
            transcribed_text=transcribed_text,
            word_scores=word_scores,
            overall_score=overall_score
        )
        
    except Exception as e:
        print(f"❌ ERROR DETALLADO DE TRANSCRIPCIÓN: {str(e)}") # Log error to console
        import traceback
        traceback.print_exc() # Print full stack trace
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


# Practice phrases organized by difficulty
PHRASES = {
    "basic": [
        "Hello, how are you?",
        "My name is John.",
        "I like to eat apples.",
        "The weather is nice today.",
        "She has a blue car.",
        "We go to school every day.",
        "Can I have some water?",
        "This is my favorite book.",
        "I live in a small house.",
        "Thank you very much."
    ],
    "intermediate": [
        "I've been studying English for three years.",
        "Would you mind opening the window?",
        "She's been working at the hospital since 2020.",
        "If I had more time, I would travel more.",
        "The restaurant that we visited yesterday was excellent.",
        "Don't worry too much about your future."
    ],
    "advanced": [
        "Although the circumstances were challenging, she persevered through determination.",
        "The entrepreneur's innovative approach revolutionized the entire industry.",
        "Pronunciation requires consistent practice and careful attention to phonetic details."
    ]
}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
