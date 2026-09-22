# pyrefly: ignore [missing-import]
import uvicorn
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    LanguageDetectRequest,
    LanguageDetectResponse,
    PrescriptionOcrResponse,
    ConsultationSummaryRequest,
    ConsultationSummaryResponse
)
from app.core.orchestrator import orchestrator
from app.services.language_detector import language_detector
from app.services.ocr_engine import ocr_engine
from app.services.consultation_summarizer import consultation_summarizer

app = FastAPI(
    title="MediFlow AI Hub",
    description="Multimodal & Multilingual Healthcare Agentic Orchestration Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "MediFlow AI Agent Engine",
        "llm_provider": settings.llm_provider,
        "environment": settings.environment,
        "interactive_docs": "http://127.0.0.1:8000/docs",
        "frontend_ui": "http://127.0.0.1:5173"
    }

@app.post("/api/v1/orchestrator/chat", response_model=ChatResponse)
async def orchestrate_chat(req: ChatRequest):
    try:
        response = await orchestrator.handle_chat_turn(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(e)}")

@app.post("/api/v1/language/detect", response_model=LanguageDetectResponse)
async def detect_language(req: LanguageDetectRequest):
    res = language_detector.detect(req.text)
    return LanguageDetectResponse(
        detected_language=res["detected_language"],
        confidence=res["confidence"],
        is_code_mixed=res["is_code_mixed"],
        transliterated_to_english=res.get("transliterated_to_english")
    )

@app.post("/api/v1/ocr/extract-prescription", response_model=PrescriptionOcrResponse)
async def extract_prescription(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        res = await ocr_engine.extract_prescription_from_image(contents, file.filename or "prescription.png")
        return PrescriptionOcrResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@app.post("/api/v1/consultation/summarize", response_model=ConsultationSummaryResponse)
async def summarize_consultation(req: ConsultationSummaryRequest):
    try:
        res = await consultation_summarizer.summarize_consultation(req)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Consultation summarization failed: {str(e)}")

if __name__ == "__main__":
    import sys
    import urllib.request
    import json

    host = settings.host or "127.0.0.1"
    port = int(settings.port or 8000)

    # 1. Pre-check if MediFlow AI service is already running on this port
    try:
        req = urllib.request.Request(f"http://{host}:{port}/health")
        with urllib.request.urlopen(req, timeout=1.2) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data.get("service") == "MediFlow AI Agent Engine":
                    print(f"=======================================================")
                    print(f"[MediFlow AI] Microservice is already active on http://{host}:{port}")
                    print(f"Status: {data.get('status')}, Provider: {data.get('llm_provider')}")
                    print(f"=======================================================")
                    sys.exit(0)
    except Exception:
        pass

    # 2. Start Uvicorn server if port is available
    print(f"=======================================================")
    print(f"[MediFlow AI] Starting AI Microservice on http://{host}:{port}")
    print(f"=======================================================")
    try:
        uvicorn.run("main:app", host=host, port=port, reload=False)
    except OSError as e:
        if getattr(e, 'errno', None) == 10048 or "10048" in str(e):
            print(f"\n[MediFlow AI] Port {port} is already active with an existing instance.")
            print(f"Service remains operational on http://{host}:{port}")
            sys.exit(0)
        else:
            print(f"ERROR: Could not bind server to {host}:{port}: {e}", file=sys.stderr)
            sys.exit(1)
    except Exception as ex:
        print(f"ERROR: Unexpected startup exception on {host}:{port}: {ex}", file=sys.stderr)
        sys.exit(1)
