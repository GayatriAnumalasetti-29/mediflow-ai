# MediFlow AI — Hybrid On-Device & Cloud AI Architecture

This document describes the technical specifications, algorithms, runtime locations, data contracts, privacy protections, and fallback mechanisms for the **Hybrid On-Device & Cloud AI Architecture** in MediFlow AI.

---

## 1. System Architecture Overview

MediFlow AI uses a two-tier hybrid architecture:
1. **Tier 1 (Client / On-Device Runtime)**: Performs zero-latency, privacy-preserving preprocessing, local script classification, emergency triage filtering, and Canvas 2D image optimization entirely inside the patient's local browser sandbox.
2. **Tier 2 (Cloud / Server Runtime)**: Executes deep clinical reasoning, multi-turn dialogue management, medical knowledge retrieval, 25-hospital database tool orchestration, and high-accuracy Vision OCR.

```
+-----------------------------------------------------------------------------+
|                          PATIENT DEVICE / BROWSER                           |
|                                                                             |
|  [User Input: Text / Camera Snapshot / Prescription Upload]                 |
|       │                                                                     |
|       ▼                                                                     |
|  [Tier 1: On-Device AI Pipeline] (Execution: < 3ms, 100% Local Memory)      |
|    ├── 1. Client PII Redaction Engine (Regex Tokenizer)                     |
|    ├── 2. Multilingual Script Classifier (Unicode Range + N-gram)           |
|    ├── 3. Edge Emergency Symptom Triage (Sub-millisecond Rule Engine)       |
|    ├── 4. Canvas 2D OCR Preprocessing (Adaptive Contrast + Binarization)   |
|    └── 5. Document Type Classifier (Heuristic Layout Classifier)            |
+-----------------------------------------------------------------------------+
                                │
                                │ Sanitized & Preprocessed Payload
                                ▼
+-----------------------------------------------------------------------------+
|                     MEDIFLOW BACKEND & CLOUD AI ENGINES                     |
|                                                                             |
|  [Tier 2: Cloud Orchestration] (Execution: ~120-220ms)                      |
|    ├── FastAPI Orchestrator + Gemini 1.5 Pro Clinical LLM                   |
|    ├── Tesseract & Vision OCR Multi-Pass Extraction                         |
|    └── 25-Tool Registry (Appointments, Wards, Billing, Pharmacy, Escalation)|
+-----------------------------------------------------------------------------+
                                │
                                ▼
+-----------------------------------------------------------------------------+
|                           UNIFIED CLIENT RESPONSE                           |
|                                                                             |
|  [Message Bubble with Transparent Processing Breakdown]                     |
|    ├── ⚡ ON-DEVICE: PII Masked (0 leaks) • Canvas Optimized • 1.4ms        |
|    └── ☁️ SERVER-SIDE: Gemini 1.5 Pro • Clinical Orchestrator • 180ms       |
+-----------------------------------------------------------------------------+
```

---

## 2. On-Device Models & Pipelines Specification

### Pipeline 1: Local Privacy PII Sanitization
* **Algorithm / Model**: Deterministic Token Masking & Regex Finite State Transducer.
* **Model Location**: Client Browser Memory (`frontend/src/services/hardware/useOnDeviceAI.ts`).
* **Input**: Raw patient text (e.g., `"My phone is 9876543210 and Aadhaar 1234 5678 9012"`).
* **Output**: Redacted text string with entity count metadata:
  ```json
  {
    "sanitizedText": "My phone is [PHONE_MASKED] and Aadhaar [AADHAAR_MASKED]",
    "maskedCount": 2,
    "maskedEntities": [
      { "type": "PHONE", "count": 1 },
      { "type": "AADHAAR", "count": 1 }
    ],
    "isSanitized": true,
    "latencyMs": 0.2
  }
  ```
* **Privacy Considerations**: Prevents sensitive national identity numbers (Aadhaar, PAN, ABHA Health IDs) and contact numbers from ever leaving the patient's device unencrypted or in plaintext.

---

### Pipeline 2: Client Multilingual Script & Code-Mixing Classifier
* **Algorithm / Model**: Unicode Code Point Range Matcher + Indic Transliteration Dictionary Scorer.
* **Model Location**: Client Browser Runtime (`useOnDeviceAI.ts`).
* **Input**: Raw or sanitized string.
* **Output**: BCP-47 language tag, confidence score, code-mixed indicator:
  ```json
  {
    "detectedLanguage": "te",
    "confidence": 0.99,
    "isCodeMixed": false,
    "languageName": "Telugu",
    "latencyMs": 0.1
  }
  ```
* **Privacy Considerations**: Detects language immediately in local RAM without sending speech or keystrokes to third-party translation APIs.

---

### Pipeline 3: Canvas 2D OCR Preprocessing & Sharpness Analyzer
* **Algorithm / Model**: Discrete 3x3 Laplacian Convolution Kernel ($\begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$) + Rec. 601 Luma Histogram Contrast Stretch.
* **Model Location**: Client Browser Canvas Rendering Context (`CanvasRenderingContext2D`).
* **Input**: Raw Base64 or Blob image from camera/upload.
* **Output**:
  ```json
  {
    "processedDataUrl": "data:image/jpeg;base64,...",
    "sharpnessScore": 88,
    "isClear": true,
    "originalSizeKb": 1420,
    "processedSizeKb": 480,
    "compressionRatio": "-66%",
    "latencyMs": 42.5
  }
  ```
* **Privacy Considerations**: Image resizing and contrast normalization happen directly in off-screen DOM canvas elements. Temporary image bitmaps are garbage-collected immediately after transmission.

---

### Pipeline 4: Edge Emergency Symptom Triage
* **Algorithm / Model**: Sub-millisecond Clinical Rule & Red-Flag Pattern Matcher.
* **Model Location**: Client Browser Runtime (`useOnDeviceAI.ts`).
* **Input**: Patient symptoms text.
* **Output**:
  ```json
  {
    "urgency": "EMERGENCY",
    "urgencyScore": 98,
    "redFlagsDetected": ["Acute Cardiac Red Flag (Suspected Myocardial Infarction / Angina)"],
    "recommendedAction": "IMMEDIATE CLINICAL ESCALATION: Proceed directly to Emergency Room.",
    "department": "Cardiology & Emergency",
    "latencyMs": 0.3
  }
  ```
* **Privacy Considerations**: Critical red flags are identified instantly on the client (< 1ms) so emergency warnings can render even during temporary network interruptions.

---

## 3. Server-Side Models & Orchestration

Tasks that require complex reasoning remain strictly on the backend:
1. **Clinical Reasoning & Dialogue Management**: Google Gemini 1.5 Pro orchestrated through FastAPI in `ai-service/app/core/orchestrator.py`.
2. **Hospital Database Tool Operations**: 25 secure backend tools in `backend/src/controllers/aiOrchestratorController.ts` (doctor availability, appointments, room admission, itemized billing).
3. **High-Density OCR**: Tesseract OCR engine + Gemini Vision for handwriting extraction.

---

## 4. Transparent UI Differentiation

MediFlow AI explicitly visualizes the hybrid execution split to the user:
* **⚡ ON-DEVICE Badge**: Shows local execution tasks (e.g. `PII Masked`, `Sharpness: 88%`, `Canvas Binarized`) with local execution latency (typically `0.2 - 2.5ms`).
* **☁️ SERVER Badge**: Shows cloud orchestrator model (`Gemini 1.5 Pro & MediFlow Engine`) and network/server latency (typically `120 - 250ms`).
* **Breakdown Inspector**: Clicking **"Inspect Breakdown"** opens a detailed modal displaying the exact pipeline stages and privacy guarantees.

---

## 5. Graceful Fallback Mechanisms

If a client device or legacy browser lacks support for specific Web APIs:
1. **Canvas API Unavailable**:
   - Detected via `capabilities.hasCanvas`.
   - If missing, `preprocessImageForOCR` emits `isFallback: true` and forwards the uncompressed image directly to the backend Vision OCR service.
2. **Web Audio API Missing**:
   - Falls back to standard audio playback without client-side spectrum visualization.
3. **Legacy Device Fallback Display**:
   - The UI automatically displays: `☁️ Server Processing (Client Fallback Active)` so the patient is never misled about where processing occurred.
