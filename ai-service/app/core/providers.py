import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from app.config import settings

class BaseLLMProvider(ABC):
    """
    Abstract interface for LLM Orchestrator provider
    """
    @abstractmethod
    async def generate_response(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.3
    ) -> str:
        pass

class BaseSTTProvider(ABC):
    """
    Abstract interface for Speech-to-Text provider
    """
    @abstractmethod
    async def transcribe(self, audio_data: bytes, language_code: Optional[str] = None) -> str:
        pass

class BaseTTSProvider(ABC):
    """
    Abstract interface for Text-to-Speech provider
    """
    @abstractmethod
    async def synthesize(self, text: str, language_code: str = "en") -> Optional[bytes]:
        pass

class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model_name: str = "gemini-1.5-pro"):
        self.api_key = api_key or settings.llm_api_key
        self.model_name = model_name or settings.llm_model_name or "gemini-1.5-pro"

    async def generate_response(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.3
    ) -> str:
        if not self.api_key or self.api_key.startswith("your_"):
            last_message = messages[-1]["content"] if messages else ""
            return f"Processed clinical request: {last_message}"

        try:
            import httpx
            # Format contents for Gemini generateContent endpoint
            contents = []
            for msg in messages:
                role = "user" if msg.get("role") in ["user", "patient"] else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg.get("content", "")}]
                })

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": contents if contents else [{"role": "user", "parts": [{"text": "Hello"}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": 1024
                }
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                elif res.status_code == 404:
                    # Fallback to gemini-1.5-flash if pro is not enabled on this project tier
                    fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                    res_fb = await client.post(fallback_url, json=payload)
                    if res_fb.status_code == 200:
                        data = res_fb.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"].strip()

            last_msg = messages[-1]["content"] if messages else ""
            return f"MediFlow AI: {last_msg}"
        except Exception as e:
            last_msg = messages[-1]["content"] if messages else ""
            return f"MediFlow AI: {last_msg}"

class GroqLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model_name: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key or settings.llm_api_key
        self.model_name = model_name or os.getenv("LLM_MODEL_NAME", "llama-3.3-70b-versatile")

    async def generate_response(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.3
    ) -> str:
        if not self.api_key or self.api_key.startswith("your_"):
            last_message = messages[-1]["content"] if messages else ""
            return f"Processed request: {last_message}"
        return "Groq production response"

class SpeechSTTProvider(BaseSTTProvider):
    def __init__(self, api_key: str = ""):
        self.api_key = api_key or settings.speech_api_key

    async def transcribe(self, audio_data: bytes, language_code: Optional[str] = None) -> str:
        return "Transcribed patient speech stream"

class SpeechTTSProvider(BaseTTSProvider):
    def __init__(self, api_key: str = ""):
        self.api_key = api_key or settings.speech_api_key

    async def synthesize(self, text: str, language_code: str = "en") -> Optional[bytes]:
        return None

def get_llm_provider(provider_name: str = "gemini", api_key: str = "") -> BaseLLMProvider:
    provider = (provider_name or settings.llm_provider or "gemini").lower()
    if provider == "groq":
        return GroqLLMProvider(api_key=api_key)
    return GeminiLLMProvider(api_key=api_key)

def get_stt_provider(provider_name: str = "speech", api_key: str = "") -> BaseSTTProvider:
    return SpeechSTTProvider(api_key=api_key)

def get_tts_provider(provider_name: str = "speech", api_key: str = "") -> BaseTTSProvider:
    return SpeechTTSProvider(api_key=api_key)
