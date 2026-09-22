# MediFlow AI — System Architecture Specification

## 1. High-Level Architecture Overview

MediFlow AI uses a **distributed, agentic multi-tier architecture** designed to decouple client interaction, business orchestration, and clinical AI reasoning.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                       React + TypeScript UI                     |   |
|   |  - Audio Capture / STT stream      - Camera & OCR Upload       |   |
|   |  - Text-to-Speech playback         - Patient & Staff Views      |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     | (REST API + WebSocket)
                                     v
+-------------------------------------------------------------------------+
|                             BACKEND LAYER                               |
|                         (Node.js + Express)                             |
|                                                                         |
|   +-------------------+  +--------------------+  +------------------+   |
|   |  Auth & RBAC      |  |  Socket.IO Server  |  |  Audit Log Engine|   |
|   +-------------------+  +--------------------+  +------------------+   |
|   |  Controllers:                                                   |   |
|   |  - Patient, Doctor, Appointment, Accommodation, Prescriptions   |   |
|   |  - Medication Schedules, Diet, Therapy, Billing, Follow-Up      |   |
|   +-----------------------------------------------------------------+   |
|                                    | (Prisma ORM)                       |
|                                    v                                    |
|                      +--------------------------+                       |
|                      |  PostgreSQL Database     |                       |
|                      +--------------------------+                       |
+------------------------------------+------------------------------------+
                                     | (Internal REST / Async Queue)
                                     v
+-------------------------------------------------------------------------+
|                            AI SERVICE LAYER                             |
|                           (Python + FastAPI)                            |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                    Central LLM Orchestrator                     |   |
|   |     (Context Memory, Intent Routing & Tool Invocation)          |   |
|   +--------------------------------+--------------------------------+   |
|                                    |                                    |
|         +--------------------------+--------------------------+         |
|         |                          |                          |         |
|         v                          v                          v         |
|  +--------------+          +---------------+          +---------------+ |
|  | Multilingual |          |  OCR / Vision |          | Specialized   | |
|  | & Voice Hub  |          |  Pipeline     |          | Tool Agents   | |
|  | (Telugu,     |          | (Handwritten  |          | (Triage, Meds,| |
|  |  Hindi, En,  |          |  Prescription |          |  Beds, Diet,  | |
|  |  Code-mix)   |          |  Extraction)  |          |  Billing)     | |
|  +--------------+          +---------------+          +---------------+ |
+-------------------------------------------------------------------------+
```

---

## 2. Component Responsibilities

### 2.1 Frontend (Presentation & Multimodal IO)
- **Voice Interface**: Captures audio streams using the Web Audio / MediaRecorder API; transmits speech to backend/AI for STT; renders real-time audio visualizer waveforms; handles TTS playback with pausing, replay, and cancellation.
- **Vision Interface**: Captures prescription and report images via live camera or file uploader with canvas preview, crop, and thumbnail generation.
- **Dynamic Language Detection**: Live indicator displaying detected language (e.g., Telugu, Hindi, English, Hinglish) and allowing smooth manual override if desired.
- **Portals**:
  - *Patient Portal*: Displays today's care checklist, active medication countdowns, diet plans, room details, appointment queue tokens, and post-discharge recovery timeline.
  - *Staff Portal*: Real-time triage escalation alerts, OCR verification workbench, bed availability grid, and appointment scheduling.

### 2.2 Backend (Core API & Data Store)
- **Node.js + Express**: Manages transactional data integrity, authentication (JWT with role claims: `PATIENT`, `DOCTOR`, `NURSE`, `ADMIN`), and rate limiting.
- **Prisma ORM & PostgreSQL**: Models the entire hospital lifecycle graph with strong referential integrity, indexes, and audit logs.
- **Real-Time Gateway (Socket.IO)**: Broadcasts token queue changes, emergency triage alerts, and medication dose reminders to connected clients.
- **AI Service Proxy**: Forwards multimodal queries to the AI microservice, handles timeout fallbacks, and executes verified tool database writes.

### 2.3 AI Service Hub (Agentic Multi-Agent System)
- **Central LLM Orchestrator**: Manages conversation history, classifies patient intent, and routes calls to specialized domain agents.
- **Specialized Tool Agents**:
  1. *Intake Agent*: Gathers chief complaint, symptoms duration, and history in a conversational manner.
  2. *Triage Agent*: Maps symptoms to urgency ratings (`EMERGENCY`, `URGENT`, `ROUTINE`) and suggests clinical departments without providing diagnoses.
  3. *Appointment Agent*: Checks doctor schedules and handles booking/rescheduling.
  4. *Accommodation Agent*: Queries room and bed allocations.
  5. *Prescription OCR Agent*: Extracts medicine entities (name, dosage, frequency, route, duration, food timing) with confidence scores.
  6. *Medication Agent*: Converts verified prescriptions into chronological reminder schedules.
  7. *Diet Agent*: Provides authorized dietary meal tables and forbidden food alerts.
  8. *Recovery & Therapy Agent*: Manages physical therapy sessions and recovery milestones.
  9. *Billing Agent*: Computes itemized charges from hospital price masters.
  10. *Follow-Up Agent*: Conducts daily natural language check-ins post-discharge.
  11. *Escalation Agent*: Triggers instant staff notifications when concerning red-flag symptoms are reported.

---

## 3. Multilingual & Code-Mixing Strategy

The AI Service employs a multi-step language processing pipeline:
1. **Input Ingestion**: Text or audio is received.
2. **Language Identification**: Detected using statistical N-gram heuristics and LLM zero-shot classification across ISO codes (`en`, `te`, `hi`, `te-IN`, `hi-IN`).
3. **Code-Mixing Handling**: Recognizes transliterated Hindi/Telugu in Latin script (e.g., *"Naku morning nundi fever undi"* or *"Mujhe 2 din se chest pain ho raha hai"*).
4. **Contextual Translation & Processing**: Translates internally to clinical structured English for tool invocation, then translates agent responses back into the patient's exact target language.
5. **Speech Generation**: Calls language-specific neural TTS voices for authentic regional accents.

---

## 4. Safety, Clinical Guardrails & Human-in-the-Loop

```
[Raw Prescription Photo] ──> [OCR Engine] ──> [Structured Medicine JSON]
                                                      │
                                                      v
                                        [Confidence Assessment]
                                         │                   │
                            High (>95%)  │                   │ Low / Ambiguous (<95%)
                                         v                   v
                        [Patient Verification UI]   [Staff Mandatory Verification UI]
                                         │                   │
                                         └─────────┬─────────┘
                                                   │
                                                   v
                                        [Clinical Staff Sign-off]
                                                   │
                                                   v
                                        [Medication Schedule Created]
```

- **No Medical Hallucination**: Agents are prohibited from guessing medicines, symptoms, or prices.
- **Mandatory OCR Review**: Extractions must be reviewed and confirmed before medication reminders are registered in the database.
- **Immediate Emergency Escalation**: When red-flag words (e.g., severe chest pain, shortness of breath, sudden numbness) are detected, triage status is immediately locked to `EMERGENCY` with clinical staff alerts dispatched via WebSockets.
