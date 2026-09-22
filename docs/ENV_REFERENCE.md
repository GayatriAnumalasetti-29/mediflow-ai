# MediFlow AI — Environment Configuration Reference

This document summarizes the actual environment configuration used across MediFlow AI.

---

## 1. Backend Gateway (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mediflow_db?schema=public"

# Authentication & AI Connection
JWT_SECRET="mediflow_ai_development_secret_key_2026"
JWT_EXPIRES_IN="7d"
AI_SERVICE_URL="http://localhost:8000"
CLIENT_URL="http://localhost:5173"
```

---

## 2. AI Service (`ai-service/.env`)

```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# AI & LLM Integration
LLM_PROVIDER=gemini
LLM_API_KEY=
LLM_MODEL_NAME=gemini-1.5-pro

# Vision OCR & Speech Integration
VISION_API_KEY=
SPEECH_API_KEY=

# Backend Gateway Connection
BACKEND_API_URL=http://localhost:5000/api
```

---

## 3. Frontend Web Application (`frontend/.env`)

```env
# Backend REST Gateway URL (All API requests route through backend)
VITE_API_URL="http://localhost:5000/api"
```
