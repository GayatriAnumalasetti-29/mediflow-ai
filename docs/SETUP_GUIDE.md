# MediFlow AI — Complete System Setup & Execution Guide

This document provides step-by-step instructions for installing, configuring, and running all services of **MediFlow AI — Multimodal Hospital Patient Lifecycle Agent**.

---

## 🏗️ Architecture Overview

The MediFlow AI monorepo comprises three primary application layers and one shared contracts package:

1. **Frontend (`/frontend`)**: React 18, TypeScript, Vite, Vanilla CSS Design System, Web Speech STT/TTS, WebRTC Telehealth, and Camera OCR capture.
2. **Backend Gateway (`/backend`)**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL database connector, Socket.IO real-time hub, and HIPAA audit logger.
3. **AI Service (`/ai-service`)**: Python 3.10+, FastAPI, LangChain/Pydantic agent orchestrator, Vision OCR parsing, and multilingual NLP engine.
4. **Shared Contracts (`/shared`)**: Shared TypeScript domain models, enums, DTOs, and REST contracts.

---

## 📋 Prerequisites

Ensure the following tools are installed on your machine:

- **Node.js**: v18.0.0 or later (`node -v`)
- **npm**: v9.0.0 or later (`npm -v`)
- **Python**: v3.10 or later (`python --version`)
- **PostgreSQL**: v14 or later (or Docker PostgreSQL container)
- **Git**: (`git --version`)

---

## 🚀 1. Clone Repository & Install Monorepo Dependencies

```bash
# 1. Clone repository
git clone https://github.com/mediflow-ai/mediflow-ai.git
cd mediflow_AI

# 2. Install root and package dependencies
npm install

# 3. Build shared types package
npm run build:shared
```

---

## 🐍 2. AI Service Setup (Python + FastAPI)

```bash
# Navigate to AI Service directory
cd ai-service

# Create and activate Python virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
copy .env.example .env

# Start FastAPI AI Service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

*The AI Service API Swagger docs will be live at `http://localhost:8000/docs`.*

---

## 🗄️ 3. Backend Gateway Setup (Express + TypeScript + Prisma)

```bash
# Navigate to backend directory in a new terminal
cd backend

# Create environment configuration
copy .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma db push

# Start Backend Dev Server with Nodemon & Socket.IO
npm run dev
```

*The Backend Gateway REST APIs will be live at `http://localhost:5000`.*

---

## 💻 4. Frontend Web App Setup (React + Vite)

```bash
# Navigate to frontend directory in a new terminal
cd frontend

# Create environment configuration
copy .env.example .env

# Start Vite Development Server
npm run dev
```

*The MediFlow AI Web Portal will be available at `http://localhost:5173`.*

---

## 🧪 5. Running Full System Verification Tests

```bash
# Run backend 25-workflow test suite
curl -X POST http://localhost:5000/api/test/run-all

# Or open http://localhost:5173, switch to Staff Command, and view the "System 25-Test Matrix" tab!
```
