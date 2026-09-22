# MediFlow AI — Phone-to-Laptop Bridge & Secure Patient Session Handoff Architecture

## 1. Overview & Architecture Diagram

MediFlow AI implements a genuine, zero-mock **Phone-to-Laptop Bridge** and **Patient Session Handoff Mechanism** built directly on top of the HackTracker Office Kit hardware and socket infrastructure.

A patient can initiate an AI consultation on their smartphone (via voice, text, camera OCR, or symptom triage), seamlessly transfer the authorized context to a hospital laptop or desktop workstation via a dynamic QR code or 6-digit PIN, and maintain real-time bi-directional synchronization between both screens.

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│       PATIENT SMARTPHONE        │                 │         LAPTOP WORKSTATION      │
│  (Multimodal Chat / Voice / Rx) │                 │      (Desktop Screen / Web)     │
└───────────────┬─────────────────┘                 └────────────────┬────────────────┘
                │                                                    │
                │ 1. Initiates handoff                               │
                │    (messages, Rx doc, appointment)                 │
                ▼                                                    │
┌──────────────────────────────────────────────────┐                 │
│         MEDIFLOW BACKEND BRIDGE SERVICE          │                 │
│  • Generates cryptographically unique 6-digit PIN│                 │
│  • Enforces 10-Minute TTL (expiresAt timestamp)  │                 │
│  • Creates isolated Socket.IO room `bridge:${id}`│                 │
└───────────────┬──────────────────────────────────┘                 │
                │                                                    │
                │ 2. Returns PIN, SessionID, Expiration              │
                ▼                                                    │
┌─────────────────────────────────┐                                  │
│   DYNAMIC SCANNABLE QR CODE     │                                  │
│   • Rendered via HTML5 Canvas   │                                  │
│   • Encodes URL with PIN query  │                                  │
│   • Active 10-minute countdown  │                                  │
└───────────────┬─────────────────┘                                  │
                │                                                    │
                │ 3. Laptop scans QR code or enters 6-digit PIN      │
                └─────────────────────────┬──────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       AUTHORIZATION & STATE HANDSHAKE                               │
│  • Verifies PIN is active and NOT revoked                                           │
│  • Rejects expired sessions with 401 Unauthorized                                   │
│  • Transmits full PatientHandoffPayload (chat history, prescription, appointment)  │
│  • Joins both devices to synchronized WebSocket room                                │
└─────────────────────────────────────────┬───────────────────────────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
┌─────────────────────────────────────┐       ┌─────────────────────────────────────┐
│       PHONE STATUS: BRIDGED         │       │       LAPTOP STATUS: BRIDGED        │
│  🟢 Connected to Laptop (Chrome)    │ ◄───► │  🟢 Connected to Phone (Smartphone) │
│  Bi-directional chat sync active    │       │  Full patient context displayed     │
└──────────────────┬──────────────────┘       └──────────────────┬──────────────────┘
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          │
                                          ▼ 4. ONE-CLICK DISCONNECT / SEVERANCE
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  • Either device taps "Disconnect Bridge"                                           │
│  • In-memory session invalidated, PIN destroyed, authorization revoked              │
│  • Both screens instantly de-authorized — no sensitive records left on laptop      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Security, Authentication & Expiration (Zero Data Leaks)

1. **Cryptographic PIN & Session Token Generation**:
   - Every handoff generates a 6-digit numerical PIN using Node.js `crypto.randomInt(100000, 999999)`.
   - Generates a high-entropy session ID: `bridge-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`.
2. **10-Minute Time-To-Live (TTL)**:
   - Sessions expire strictly after 10 minutes (`expiresAt = Date.now() + 10 * 60 * 1000`).
   - The UI displays an active countdown timer (`09:42...`).
   - If an unauthorized party attempts to connect with an expired code, the backend rejects with:
     `401 Unauthorized: This handoff PIN has expired for patient security.`
   - In-memory periodic sweep prunes expired sessions every 60 seconds.
3. **Strict Authorization Before Data Release**:
   - The query status endpoint (`GET /api/bridge/status/:pin`) only confirms session existence and status; it **never returns medical data or chat history** before successful authorization.
   - Medical history (`PatientHandoffPayload`) is only released to the authorized socket room or via `POST /api/bridge/authorize`.
4. **Instant One-Click Severance / De-Authorization**:
   - Clicking **"Disconnect Bridge"** on either device immediately:
     1. Triggers `bridge:sever_session`.
     2. Sets `isRevoked: true` and deletes the PIN from the active registry.
     3. Emits `bridge:session_severed` to all connected sockets.
     4. Clears active session state from the laptop workstation, ensuring no residual patient data remains visible on shared or unauthorized computers.

---

## 3. Real Dynamic QR Code Generation

Unlike static demo graphics, MediFlow AI generates **genuine, scannable QR codes** directly in the browser using the `qrcode` library on an HTML5 `<canvas>` element:
- Target payload: `${window.location.origin}/?view=chat&bridgePin=${session.pinCode}`.
- Any standard smartphone camera, iPhone Camera app, or Google Lens can scan the QR code to open the URL directly with the pairing PIN pre-loaded.
- High-contrast clinical styling (primary medical slate-blue dots `#0369a1` on pure white background `#ffffff`).

---

## 4. Real-Time Bi-Directional Synchronization

Once bridged, any interaction on either device is synchronized in sub-second real time:
- **Text & Voice Transcripts**: Messages typed or spoken on phone appear immediately in the laptop's chat feed.
- **AI Agent Responses**: Responses generated from the Gemini 1.5 Pro cloud orchestrator stream simultaneously to both screens.
- **Prescription OCR & Verification**: When a patient or clinician verifies extracted medicine dosages on one device, the verification badge and reminder activation update simultaneously on both screens.
- **Uploaded Documents**: Prescription images captured via phone camera or uploaded from gallery are shared instantly to the laptop screen.

---

## 5. Socket.IO & REST Protocol Specification

### WebSocket Events (`Socket.IO`)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `bridge:initiate_patient_handoff` | Client $\rightarrow$ Server | `{ patientId, patientName, handoffData }` | Initiates handoff session from source phone |
| `bridge:handoff_initiated` | Server $\rightarrow$ Client | `BridgeSession` | Returns PIN, sessionId, and 10-minute expiration |
| `bridge:join_session` | Client $\rightarrow$ Server | `{ pinCode, deviceName }` | Connects laptop via PIN or scanned QR link |
| `bridge:join_success` | Server $\rightarrow$ Client | `BridgeSession` | Confirms successful authentication |
| `bridge:handoff_authorized` | Server $\rightarrow$ Client | `{ session, handoffData }` | Delivers full authorized chat & patient state to laptop |
| `bridge:device_connected` | Server $\rightarrow$ Room | `{ sessionId, deviceName, connectedAt }` | Notifies phone that laptop has connected |
| `bridge:sync_handoff` | Client $\rightarrow$ Server | `{ sessionId, update }` | Synchronizes new messages or document verifications |
| `bridge:handoff_synced` | Server $\rightarrow$ Room | `{ update, handoffData, syncedAt }` | Relays live updates across connected peers |
| `bridge:sever_session` | Client $\rightarrow$ Server | `{ sessionId }` | Instantly terminates and revokes the bridge |
| `bridge:session_severed` | Server $\rightarrow$ Room | `{ sessionId, message }` | De-authorizes and clears peer devices |

### REST Endpoints (`Express`)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| `POST` | `/api/bridge/initiate` | `{ patientId, patientName, handoffData }` | `{ success: true, session: { pinCode, sessionId, expiresAt } }` |
| `POST` | `/api/bridge/authorize` | `{ pinCode, deviceName }` | `{ success: true, session, handoffData }` (or 401 if invalid/expired) |
| `GET` | `/api/bridge/status/:pin` | — | `{ success: true, status, expiresAt }` (No medical data) |
| `POST` | `/api/bridge/sever` | `{ sessionId }` | `{ success: true, message: 'Bridge session successfully severed.' }` |

---

## 6. Synergy with HackTracker Office Kit

This implementation extends the HackTracker Office Kit from being solely a doctor-facing sensor telemetry dashboard into a **complete dual-role cross-device ecosystem**:
1. **Clinical Mode (`OfficeKitDoctorStation`)**: Laptop workstation monitors phone sensors (camera PPG optical pulse, accelerometer tremor, bedside nurse call).
2. **Patient Handoff Mode (`DeviceBridgeModal`)**: Patient transfers active multimodal AI chat, prescriptions, and appointment state seamlessly between mobile and desktop with zero friction and enterprise-grade privacy protection.
