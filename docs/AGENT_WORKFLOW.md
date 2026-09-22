# MediFlow AI — Agentic Workflows & Multi-Agent Coordination

## 1. Orchestration Model

MediFlow AI uses a **Central LLM Orchestrator** acting as the primary conversational interface. When a patient speaks or types, the orchestrator executes the following pipeline:

```
[Patient Input (Voice / Text)]
             │
             ▼
[Language & Code-Mixing Detector]
             │
             ▼
[Context Memory & State Tracker]
             │
             ▼
[Intent Classifier & Tool Selector]
             │
   ┌─────────┼─────────┬─────────┬─────────┬─────────┐
   ▼         ▼         ▼         ▼         ▼         ▼
[Intake]  [Triage]  [Appt]   [Beds]    [Meds]   [Billing]
   │         │         │         │         │         │
   └─────────┴─────────┼─────────┴─────────┴─────────┘
                       │
                       ▼
          [Guardrails & Safety Validator]
                       │
                       ▼
       [Multilingual Response Synthesizer]
                       │
                       ▼
          [TTS Audio + Visual Rich Cards]
```

---

## 2. Core Sub-Agent Workflows

### 2.1 Multilingual Triage & Safety Escalation Workflow
1. Patient inputs symptoms: *"I have acute chest pain and my left arm feels numb since 30 minutes."* (or Telugu/Hindi equivalents).
2. **Language Detector** identifies English (`en`) / Telugu (`te`) / Hindi (`hi`).
3. **Triage Agent** matches symptoms against clinical urgency rules:
   - Evaluates vital indicators and red flags.
   - Classification: `EMERGENCY` (Immediate intervention required).
   - Department: `Emergency Medicine / Cardiology`.
4. **Safety Guardrail**:
   - Explicitly instructs patient not to wait: *"Please proceed to the Emergency Department immediately."*
   - Emits a WebSocket alert `escalation_alert` directly to the triage nurse station.
   - Restricts AI from offering routine home remedies for critical symptoms.

### 2.2 Camera Prescription OCR & Verification Workflow
1. Patient takes a photo of doctor's handwritten or printed prescription.
2. **OCR Engine** runs text recognition and entity extraction for medicines:
   - Drug Name (e.g., `Amoxicillin`, `Metformin`, `Paracetamol`)
   - Dosage (e.g., `500 mg`)
   - Frequency (e.g., `Twice daily (BID)`)
   - Timing (e.g., `After meals (Post-prandial)`)
   - Duration (e.g., `5 days`)
   - Confidence Score (0.0 to 1.0)
3. **Safety Gate**:
   - If confidence is `< 0.95`, ambiguous fields are highlighted in warning amber.
   - Extracted table is rendered in the UI with an interactive verification modal.
   - Requires patient or clinician verification before committing to active database medication schedules.

### 2.3 Post-Discharge Follow-Up & Adherence Workflow
1. At scheduled daily intervals (e.g., 9:00 AM, 7:00 PM), the **Follow-Up Agent** sends a check-in message.
2. Patient replies via voice: *"Feeling better today, fever is gone, but slight dizziness after taking the morning tablet."*
3. **Follow-Up Agent** parses symptom improvement and flags potential medication side effects.
4. Updates patient recovery timeline and logs the daily status. If severe dizziness or hypotension is reported, automatically escalates to the attending doctor.
