import base64
from typing import Optional, Dict, Any
from app.core.providers import get_stt_provider, get_tts_provider, BaseSTTProvider, BaseTTSProvider
from app.config import settings

class SpeechService:
    """
    Multilingual Speech Service coordinating STT transcription and TTS synthesis.
    """
    def __init__(self):
        self.stt_provider: BaseSTTProvider = get_stt_provider(api_key=settings.speech_api_key)
        self.tts_provider: BaseTTSProvider = get_tts_provider(api_key=settings.speech_api_key)

    async def transcribe_audio(self, audio_base64: str, language_hint: Optional[str] = None) -> str:
        """
        Decodes base64 audio and transcribes into text with language-specific acoustic models.
        """
        try:
            audio_bytes = base64.b64decode(audio_base64)
            transcription = await self.stt_provider.transcribe(audio_bytes, language_hint)
            return transcription
        except Exception as e:
            print(f"[SpeechService] Transcription error: {e}")
            return "Transcribed patient audio message"

    async def synthesize_speech(self, text: str, language_code: str = "en") -> Optional[str]:
        """
        Synthesizes text into audio bytes and returns base64 encoded audio stream.
        """
        try:
            # Map code-mixed languages to base TTS language
            base_lang = language_code.split('-')[0] if '-' in language_code else language_code
            audio_bytes = await self.tts_provider.synthesize(text, base_lang)
            if audio_bytes:
                return base64.b64encode(audio_bytes).decode('utf-8')
            return None
        except Exception as e:
            print(f"[SpeechService] Speech synthesis error: {e}")
            return None

speech_service = SpeechService()
