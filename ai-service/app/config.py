import os
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "127.0.0.1")
    environment: str = os.getenv("ENVIRONMENT", "development")
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    llm_model_name: str = os.getenv("LLM_MODEL_NAME", "gemini-1.5-pro")
    vision_api_key: str = os.getenv("VISION_API_KEY", "")
    speech_api_key: str = os.getenv("SPEECH_API_KEY", "")
    backend_api_url: str = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
