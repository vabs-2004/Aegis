# AEGIS — Adaptive C-UAS Threat Simulation Trainer

[![Status: Production-Ready MVP](https://img.shields.io/badge/Status-Demo--Ready%20MVP-89A97D?style=flat-square)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16.3%20(Turbopack)-111614?style=flat-square&logo=next.js)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-8CA8B8?style=flat-square&logo=typescript)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-39433C?style=flat-square)](#)
[![Groq AI](https://img.shields.io/badge/AI%20Inference-Groq%20(GPT--OSS)-D6A85B?style=flat-square)](#)

> **Ministry of Defence (MoD) // Defence Services Staff College (DSSC)**  
> **Problem Statement #26247**: *AI-Enabled Drone & Counter-Drone Threat Simulation Trainer*  
> **Category**: Software | **Theme**: Robotics & Drones  
> **Environment**: Restricted Synthetic Simulation (All coordinates, units, and telemetry are fictional training abstractions)

---

## 1. Executive Summary

**AEGIS** is an operational counter-unmanned aerial system (C-UAS) decision-training workstation. Unlike video games or static SaaS metric dashboards, AEGIS is built around an autonomous closed-loop cognitive training loop:

$$\text{SCENARIO GENERATION} \longrightarrow \text{OBSERVE} \longrightarrow \text{DETECT} \longrightarrow \text{CLASSIFY} \longrightarrow \text{ASSESS} \longrightarrow \text{COMMIT DECISION} \longrightarrow \text{MEASURE} \longrightarrow \text{AAR} \longrightarrow \text{IDENTIFY GAP} \longrightarrow \text{TARGETED ADAPTATION}$$

### The Core Value Proposition
> *"AEGIS does not simply simulate threats — it measures how a trainee responds under uncertainty, isolates their specific cognitive weakness, and autonomously synthesizes the next training scenario designed specifically to address that weakness."*

---

## 2. Institutional Visual Design (0% AI Slop)

AEGIS rejects generic AI landing page aesthetics—no purple-to-blue gradients, no glassmorphism, no floating rounded cards, no bouncy physics, and no generic marketing copy. 

Instead, it embodies a **high-end military/aviation operational workstation**:
- **Solid Graphite Surfaces**: `#0B0E0D` (Page Canvas), `#111614` (Primary Surface), `#171C19` (Secondary), `#1C231F` (Raised).
- **Crisp 1px Borders**: `#2A322D` (Subtle) and `#39433C` (Structural).
- **Semantic Color Tokens**:
  - `Sage` (`#89A97D`): Healthy, correct classifications, nominal status.
  - `Steel Blue` (`#8CA8B8`): Target acquisition lock, active selection, information.
  - `Amber` (`#D6A85B`): Sensor degradation, cognitive load warnings, attention required.
  - `Critical Red` (`#C96862`): Misclassifications, latency timeouts, critical incursions.
- **Strict Typography**:
  - **IBM Plex Sans**: Primary interface, labels, headings, and instructional copy.
  - **IBM Plex Mono**: Exclusively reserved for timestamps, contact IDs (`D-07`), latency readouts, and telemetry readouts.

---

## 3. Product Architecture & Routes

```
app/
├── page.tsx                     # [/] Command Center & Trainee Readiness
├── train/
│   └── page.tsx                 # [/train] Live 3-Zone Tactical Simulator
├── aar/
│   └── [sessionId]/
│       └── page.tsx             # [/aar/[sessionId]] After-Action Review & Session Replay
├── scenarios/
│   └── page.tsx                 # [/scenarios] Scenario Studio & Repository
├── trainees/
│   └── page.tsx                 # [/trainees] Unit Competency & Operator Dossiers
├── instructor/
│   └── page.tsx                 # [/instructor] Supervisory Terminal & Readiness Overview
└── api/
    ├── sessions/[id]/complete/  # POST: Process scoring & result persistence
    └── aar/[sessionId]/generate/# GET: AAR intelligence & adaptive scenario synthesis
```

### Route Breakdown

| Route | View | Description | Key Features |
|---|---|---|---|
| `/` | **Command Center** | Initial operational orientation | Trainee readiness strip (`ARJUN-04`), competency radar matrix showing multi-contact deficit, and `[ START RECOMMENDED TRAINING ]` CTA. |
| `/train` | **Tactical Simulator** | 3-Zone live simulation workspace | Custom SVG tactical radar canvas, uncertainty rings, contact inspector, abstract classification/response selectors, and real-time millisecond event strip. |
| `/aar/[sessionId]` | **After-Action Review** | In-depth diagnostic review | Dynamic computed score, `-31 pt` multi-contact gap analysis, **Session Replay (0.5× / 1× / 2×)** on tactical canvas, and **The Adaptive Process Chain**. |
| `/scenarios` | **Scenario Studio** | Scenario authoring repository | Inspect deterministic scenarios (`SCN-001` through `SCN-009`) and launch targeted configurations. |
| `/trainees` | **Trainee Performance** | Operator proficiency matrix | Squadron roster tracking readiness trends, streak counts, and primary skill gaps. |
| `/instructor` | **Instructor Dashboard** | Supervisory unit terminal | Aggregate squadron readiness statistics, curriculum adaptation oversight, and intervention logs. |

---

## 4. Tactical Canvas & Live Simulation

The tactical canvas is custom-built with pure vector SVG and Canvas rendering (no third-party map APIs or photographic satellite imagery):
- **Range Rings**: Concentric distance rings (`2.5 KM`, `5.0 KM`, `7.5 KM`, `10.0 KM`).
- **Synthetic Terrain**: Topographic elevation contours NW sector and urban building cluster footprints SE sector.
- **Sensor Aperture**: Dynamic sweep cone reflecting simulated RF sensor fidelity.
- **Abstract Vector Symbology**:
  - Unknown Contact: Hollow circle with animated dashed uncertainty ring.
  - Friendly Reference Asset: Hollow diamond in sage green.
  - Target Lock: Steel-blue focus brackets with contact ID annotation.
  - Trajectory Trace: Historical breadcrumb polylines displaying entry vectors.
  - Directional Arrow: Velocity vector showing instantaneous heading.

### Cognitive Decision Workflow
Trainees reason under synthetic uncertainty:
1. **Observe**: Track movement profiles (`VARIABLE SPEED / LOW ELEVATION`).
2. **Inspect**: Check detection and classification confidence gauges (e.g. `54% CONF`).
3. **Classify**: Select from abstract options: `UNKNOWN`, `AUTHORIZED / EXPECTED`, `COMMERCIAL`, `MILITARY-LIKE SIGNATURE`, `COORDINATED GROUP`.
4. **Choose Response**: Select from abstract pathways: `VERIFY`, `MONITOR`, `ALERT`, `ESCALATE`, `SIMULATED MITIGATION`.
5. **Commit**: Click `[ COMMIT DECISION ]` to log latency and assess accuracy against ground truth.

---

## 5. Deterministic Process Scoring Model

The official training score is **never calculated by an LLM**. A deterministic engine measures the trainee's decision process across 5 weighted dimensions:

$$\text{Final Score} = 0.25\, S_{\text{det}} + 0.25\, S_{\text{cls}} + 0.25\, S_{\text{dec}} + 0.15\, S_{\text{tim}} + 0.10\, S_{\text{multi}}$$

- **Detection ($S_{\text{det}}$)**: Optimal latency $< 2500\,\text{ms}$, scaling down with elapsed time. Penalizes missed contacts.
- **Classification ($S_{\text{cls}}$)**: Strict ground-truth validation with partial credit for correlated signatures.
- **Decision ($S_{\text{dec}}$)**: Abstract response appropriateness evaluated against threat severity.
- **Response Timing ($S_{\text{tim}}$)**: Decision window latency penalty ($> 3000\,\text{ms}$).
- **Multi-Contact ($S_{\text{multi}}$)**: Measures degradation when multiple simultaneous contacts saturate the operator.

---

## 6. Advanced Training Capabilities (Controlled Expansion)

Four advanced training dimensions enhance the core causal loop without altering the visual language or deterministic scoring foundation:

```
OBSERVE ──> UNCERTAINTY ──> DECIDE ──> MEASURE ──> UNDERSTAND ──> ADAPT ──> TRAIN AGAIN
```

### 1. Predictable Information Decay & Sensor Uncertainty
- **Kinematics vs. Sensor Separation**: Kinematics (`trajectory.ts`) computes movement coordinates while the sensor model (`sensor.ts`) evaluates sweep beam intersections ($20^\circ$ beam width at $45^\circ/\text{s}$ rotation).
- **Deterministic Timestamp Tracking**: Tracks `lastConfirmedAtSec` and computes elapsed decay as `lastConfirmedSec = Math.max(0, currentTimeSec - lastConfirmedAtSec)`.
- **Monotonic Confidence Degradation**: As time without confirmation increases, detection confidence and classification confidence degrade predictably.
- **Discrete Visibility States**: Transitions through `STABLE`, `DEGRADED`, and `INTERMITTENT`, dynamically modulating tactical canvas uncertainty rings (dash patterns `2 2`, `3 3`, `4 5`).

### 2. Decision-Time Simulated Cognitive Load
- **Real-Time Workload Evaluation**: Evaluated at the exact second a decision is committed:
  $$\text{Task Load} = f(\text{Active Contacts}, \text{Unresolved Contacts}, \text{Sensor Quality})$$
- **Stratified AAR Diagnostics**: Categorizes decisions into `LOW`, `MEDIUM`, and `HIGH` workload, uncovering exact performance degradation drops (e.g. $-31\,\text{pts}$ under simultaneous arrivals) without fabricating metrics. Displays `INSUFFICIENT SAMPLE DATA` when sample sizes are small.

### 3. Decision Confidence Calibration
- **Subjective Calibration Slider**: Integrated into the Inspector panel ($20\%\text{--}100\%$) with standardized terminology (`LOW CONFIDENCE`, `MODERATE CONFIDENCE`, `HIGH CONFIDENCE`).
- **Calibration Matrix**: Analyzes whether operator confidence matches objective ground-truth accuracy. Computes the overconfidence gap in the AAR without polluting official scoring weights.

### 4. Interactive What-If Replay & Counterfactuals
- **Zero-LLM Counterfactual Engine**: Integrated into Session Replay. Allows instructors and trainees to select a past decision (e.g., misclassified swarm contact `D-07`), substitute alternative classification and response vectors, and rerun the deterministic scoring engine.
- **Instant Projected Score Delta**: Reruns `calculateSessionScore()` deterministically to output exact projected score deltas (e.g., $+7\,\text{pts}$) and competency shifts with complete mathematical reproducibility.

---

## 7. AI Architecture & External Resilience

AEGIS integrates Groq LLM inference asynchronously without blocking the 60 FPS local simulation:

```
[LIVE SIMULATOR] ──(100% Deterministic Local Engine)──> [SCORER]
                                                              │
                                                              ▼
                                                   [/api/aar/generate]
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
     Groq Online (openai/gpt-oss-120b)                                                        Deterministic Fallback
     • Deep AAR narrative synthesis                                                           • Structured rule-based analysis
     • Causal skill gap explanation                                                           • Guaranteed 0-downtime demo
     • Adapted scenario briefing (gpt-oss-20b)                                                • Same JSON schema format
```

- **Models**:
  - `openai/gpt-oss-20b`: Rapid scenario briefings and structured scenario parameter variations.
  - `openai/gpt-oss-120b`: High-value AAR interpretation, skill-gap synthesis, and instructor-level assessments.
- **100% Offline/Deterministic Fallback**: If Groq is unavailable, rate-limited, or unconfigured, the application continues functioning flawlessly with local rule-based templates.

---

---

## 8. Setup & Installation

### Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+
- **PostgreSQL** *(Optional — auto-fallback to in-memory store if offline)*

### Step 1: Clone and Install
```powershell
cd c:\projects\Aegis\aegis
npm install
```

### Step 2: Environment Configuration
Create or inspect `.env` in the root directory:
```env
# Groq API Key (both GROQ_API_KEY and GROK_KEY are supported)
GROQ_API_KEY=gsk_your_groq_api_key_here

# PostgreSQL connection (both DATABASE_URL and POSTGRE_URL supported)
DATABASE_URL=postgresql://postgres:password@localhost:5432/aegis
```
*(A template is provided in `.env.example`)*

### Step 3: Initialize Database (Optional)
Run the automated schema setup script:
```powershell
npm run db:init
```
*Creates `trainees`, `scenarios`, `sessions`, `session_events`, `session_scores`, and initializes baseline seed data.*

### Step 4: Run the Application

#### Development Mode:
```powershell
npm run dev
```

#### Production Build & Start:
```powershell
npm run build
npm run start
```
Access the console at: **`http://localhost:3000`**

---


## 11. License & Disclaimers

This software is developed strictly as an educational and training simulation prototype for **Smart India Hackathon (SIH) 2026**.  
- All radar coordinates, contacts, units, terrain features, and response options are **entirely fictional abstractions**.
- Does not contain real-world weapon parameters, frequencies, electronic warfare vulnerabilities, or live tactical deployment instructions.
