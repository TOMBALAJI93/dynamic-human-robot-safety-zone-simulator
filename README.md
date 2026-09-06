# Dynamic Human-Robot Safety-Zone Simulator for Process Plants

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8-646cff.svg)](https://vite.dev/)
[![Review 1 Status](https://img.shields.io/badge/Review%201-Validated-success.svg)]()
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **RESEARCH PROTOTYPE NOTICE**: This software is an academic decision-support prototype. It is NOT an industrial safety-certified system and does not claim legal ISO 10218-1/2 or ISO/TS 15066 certification.

---

## 1. Problem Statement

In heavy process plant environments (petrochemical refineries, pharmaceutical manufacturing facilities, specialty chemical processing plants), Autonomous Mobile Robots (AMRs) and human operators frequently share corridors, valve aisles, and equipment inspection bays. 

Conventional safety systems rely on **fixed, static exclusion zones** (e.g., stopping an AMR whenever any human enters a static 4.5m radius). While fail-safe, static exclusion creates major operational bottlenecks:
* **False Nuisance Restrictions**: AMRs are halted during harmless parallel travel or when moving away from a worker.
* **Insufficient High-Speed Cushioning**: Fast-moving machines with heavy payloads or distracted maintenance technicians require dynamically expanded deceleration buffers when moving along converging trajectories.

---

## 2. Project Objective

This project delivers a complete, functional, browser-based software prototype that **dynamically evaluates human-robot safety separation distances** in real time based on:

1. **Plant Layout**: 100m $\times$ 100m process plant layout with equipment coordinates and danger zones.
2. **Robot Path & Waypoints**: Interactive, editable AMR navigation path.
3. **Human Path & Waypoints**: Interactive, editable human worker traversal route.
4. **Robot Speed ($v_r$)**: Instantaneous machine velocity ($0.0 - 3.0\text{ m/s}$).
5. **Human Speed ($v_h$)**: Instantaneous worker velocity ($0.5 - 2.0\text{ m/s}$).
6. **Task Characteristics ($\text{TaskFactor}$)**: Task hazard multiplier based on worker cognitive load (e.g., $1.0\times$ for inspection vs. $1.4\times$ for maintenance).
7. **Direction of Movement ($\text{DirFactor}$)**: Relative vector approach angle expanding the envelope for head-on convergence.
8. **Reaction & Deceleration Latency**: Worker perception time ($t_{\text{react}}$) and robot braking stopping time ($t_{\text{stop}}$).
9. **Configurable Safety Margins**: Adjustable engineering buffer ($M_{\text{safety}}$).

---

## 3. Current Project Status

> **Review 1 milestone: completed and validated.**  
> **Overall project: still under development.**

The core simulation, kinematic path editor, dynamic mathematical safety engine, telemetry charts, baseline experiments harness, sensitivity sweeps, failure regression cases, offline data capture, bilingual localization, and documentation have been fully implemented and verified for College Review 1.

---

## 4. Key Implemented Features

* **Interactive 2D Plant Simulator**:
  * 100m $\times$ 100m coordinate-invariant plant grid with storage tanks, distillation columns, reactors, and docking stations.
  * Real-time visual dynamic safety zone (pulsating blue/amber/red envelope) vs. static baseline circle (4.5m).
* **Interactive Waypoint Path Editor**:
  * Interactive canvas editing allowing users to click to append waypoints, drag nodes to reshape paths, and delete waypoints for both AMR (Blue) and Human (Green).
* **Transparent Dynamic Safety Decision Engine**:
  * Evaluates proximity at 10Hz and classifies risk into `SAFE`, `WARNING`, `UNSAFE`, and `EMERGENCY`.
  * Generates plain-language explainable engineering rationale text for every state.
* **Real-Time Telemetry & Distance Dual-Trace Chart**:
  * Real-time strip chart comparing Current Physical Separation Distance vs. Required Dynamic Distance ($D_{\text{req}}$) with visual violation shading.
* **Automated Baseline Experiments Harness**:
  * One-click batch evaluation across 3 realistic plant operating scenarios.
  * Measures **Prototype Unnecessary Restrictions Avoided** vs. static baseline.
* **Sensitivity Analysis & Decision-Change Detection**:
  * Single-parameter sweeps ($v_r, v_h, \theta, B_m, T_r$) with automatic detection of decision boundary threshold crossings.
  * Sensitivity gradient calculation ($\Delta D / \Delta P$) and parameter influence ranking.
* **6 Failure & Edge-Case Boundary Tests**:
  * Validates singularity prevention ($D=0$), stationary AMRs, extreme velocity anomalies, negative velocity sensor glitches, spatial boundary overflow, and large margin buffers.
* **Offline Field Data Capture & Universal CSV Exporter**:
  * Proximity observation logging form with complete `localStorage` persistence.
  * CSV/JSON export for live telemetry logs, saved experiment benchmarks, and field observations.
* **Bilingual Localization (English & Tamil)**:
  * 100% user interface localization in English and Tamil (தமிழ்).

---

## 5. Technology Stack

* **Frontend Framework**: React 19 (TypeScript)
* **Styling & UI**: Tailwind CSS v4, Lucide React icons
* **Data Visualization**: Canvas 2D Rendering Engine, Recharts
* **Build System & Dev Server**: Vite v8
* **Persistence & Offline Storage**: Browser `localStorage`, RFC 4180 CSV serialization

---

## 6. System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT 19 FRONTEND                             │
│  ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐  │
│  │   Navigation & Nav    │ │  Bilingual i18n   │ │ Tailwind CSS v4   │  │
│  │     (Navbar.tsx)      │ │ (translations.ts) │ │   Theme Engine    │  │
│  └───────────────────────┘ └───────────────────┘ └───────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Pages: Dashboard, Simulator, Layout, Scenarios, Rules,           │  │
│  │         Experiments, Sensitivity, FailureCases, DataCapture, etc. │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SIMULATION & SAFETY CORE                         │
│  ┌─────────────────────────┐ ┌───────────────────────────────────────┐  │
│  │      Motion Engine      │ │         Dynamic Safety Engine         │  │
│  │   (motionEngine.ts)     │ │           (safetyEngine.ts)           │  │
│  │  - Waypoint kinematics  │ │  - Dynamic formula: D_req calculation │  │
│  │  - Direction vector     │ │  - Vector dot product approach factor │  │
│  │  - Smooth dt stepping   │ │  - Explainable engineering reasons    │  │
│  └─────────────────────────┘ └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Scenario Data & Presets (scenarioData.ts)                         │  │
│  │  - 100m x 100m Plant Layout, 3 Scenarios, 6 Edge Failure Cases    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       LOCAL STORAGE & EXPORT ENGINE                     │
│  ┌─────────────────────────┐ ┌───────────────────────────────────────┐  │
│  │   Browser LocalStorage  │ │         Universal CSV Exporter        │  │
│  │   (storageService.ts)   │ │  - Telemetry CSV (10Hz samples)       │  │
│  │  - Offline state cache  │ │  - Experiments History CSV            │  │
│  │  - Field observation log│ │  - Field Proximity Observations CSV   │  │
│  └─────────────────────────┘ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Project Structure

```text
├── docs/
│   ├── assumptions-and-limitations.md    # Theoretical assumptions & real-world limitations
│   ├── experiment-notebook.md            # Simulation benchmarks, sensitivity gradients & metrics
│   ├── failure-mode-analysis.md          # 6-case FMEA regression test table
│   ├── field-workflow.md                 # Field operational user journey & deployment guide
│   ├── review-1-report.md                # College Review 1 formal milestone report
│   ├── synthetic_safety_dataset.csv      # 150-record synthetic parametric dataset
│   ├── synthetic_safety_dataset.json     # JSON representation of synthetic dataset
│   ├── technical-documentation.md        # Architecture, math formulation & code mapping
│   ├── test-evidence.md                  # Test suite matrix & verification results (16 tests)
│   └── user-feedback-summary.md          # Questionnaire protocol (Marked PENDING actual testing)
├── scripts/
│   └── generateSyntheticData.ts          # Deterministic dataset generation script
├── src/
│   ├── components/
│   │   └── layout/Navbar.tsx             # Responsive bilingual navigation bar
│   ├── engine/
│   │   ├── physics/motionEngine.ts       # Kinematic waypoint interpolation engine
│   │   ├── safety/safetyEngine.ts        # Dynamic safety separation calculation
│   │   └── scenarios/scenarioData.ts     # Plant equipment layout, 3 scenarios, 6 failure cases
│   ├── i18n/
│   │   └── translations.ts               # Bilingual English/Tamil dictionary
│   ├── pages/
│   │   ├── DashboardPage.tsx             # Executive safety KPIs & scenario launcher
│   │   ├── DataCapturePage.tsx           # Field observation log & CSV data backup
│   │   ├── ExperimentsPage.tsx           # Automated benchmark harness & baseline comparison
│   │   ├── FailureCasesPage.tsx          # 6 boundary failure case test cards
│   │   ├── LayoutPage.tsx                # Process plant equipment layout manager
│   │   ├── SafetyRulesPage.tsx           # Kinematic calibration & hazard multipliers
│   │   ├── ScenariosPage.tsx             # Industrial scenario catalog
│   │   ├── SensitivityPage.tsx           # Parameter sweep plots & decision transition detection
│   │   ├── SettingsPage.tsx              # Preferences & Review 1 Evidence Checklist
│   │   └── SimulatorPage.tsx             # 2D Canvas simulator, waypoint editor & telemetry
│   ├── services/
│   │   └── storageService.ts             # LocalStorage manager & RFC 4180 CSV serializer
│   ├── types/
│   │   └── index.ts                      # Strict TypeScript interfaces & types
│   ├── App.tsx                           # Main application layout & view router
│   ├── index.css                         # Tailwind CSS imports & theme definitions
│   └── main.tsx                          # React 19 application entry point
├── .gitignore                            # Standard repository ignore configuration
├── index.html                            # HTML entry document
├── package.json                          # Dependencies & NPM scripts
├── tsconfig.json                         # TypeScript strict compiler configuration
└── vite.config.ts                        # Vite configuration
```

---

## 8. Dynamic Safety Distance Mathematical Model

> **Disclaimer**: This is a project-level simulation model inspired by relevant safety-distance concepts. It is not an industrial safety-certified system.

The required dynamic separation distance $D_{\text{required}}$ is computed continuously as:

$$D_{\text{required}} = \left[ D_{\text{base}} + (v_{\text{robot}} \cdot t_{\text{stop}} \cdot w_r) + (v_{\text{human}} \cdot t_{\text{react}} \cdot w_h) + (0.5 \cdot t_{\text{react}} \cdot f_r) \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety}}$$

### Parameter Definitions:
* **$D_{\text{base}}$**: Base minimum physical separation distance ($1.20\text{ m}$).
* **$v_{\text{robot}}, v_{\text{human}}$**: Instantaneous scalar velocities of robot AMR and human worker ($\text{m/s}$).
* **$t_{\text{stop}}$**: AMR braking deceleration time constant ($0.6\text{s} - 1.2\text{s}$).
* **$t_{\text{react}}$**: Human operator perception-reaction time ($0.7\text{s} - 0.9\text{s}$).
* **$w_r, w_h, f_r$**: Dimensionless kinematic weighting constants ($w_r = 1.2, w_h = 1.0, f_r = 1.1$).
* **$\text{TaskFactor}$**: Task distraction multiplier:
  * `Inspection` / `Equipment monitoring`: $1.0\times$
  * `Quality checking`: $1.1\times$
  * `Cleaning`: $1.2\times$
  * `Material handling`: $1.3\times$
  * `Maintenance`: $1.4\times$
* **$\text{DirFactor}$**: Approach vector dot-product multiplier expanding the envelope when trajectories converge head-on:
  $$\text{DirFactor} = 1.0 + \min\left(0.5, \max\left(0, \frac{v_{\text{approach}}}{v_{\text{max}} + 2.0}\right)\right)$$
* **$M_{\text{safety}}$**: Additional engineering safety buffer margin ($0.80\text{ m}$).

### Proximity Risk States:
* **`EMERGENCY`**: Separation $D_{\text{sep}} \le 1.0\text{m}$ (or coincident coordinates). Robot speed capped at $0\%$.
* **`UNSAFE`**: $1.0\text{m} < D_{\text{sep}} < D_{\text{required}}$. Speed capped at $0\%$ (Emergency braking).
* **`WARNING`**: $D_{\text{required}} \le D_{\text{sep}} < D_{\text{required}} + 1.2\text{m}$. Speed capped at $50\%$ (Caution slowdown).
* **`SAFE`**: $D_{\text{sep}} \ge D_{\text{required}} + 1.2\text{m}$. Full operating speed ($100\%$).

---

## 9. Operating Scenarios & Benchmark Results

| Scenario | Kinematics & Task | Expected Risk State | Actual Simulated Outcome | Minimum Distance | Maximum Required Dynamic Zone | Prototype Unnecessary Restrictions Avoided |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Scenario 1: Normal Operation (Parallel Paths)** | $v_r = 1.2\text{m/s}, v_h = 1.1\text{m/s}$, Parallel Aisle, Inspection | `SAFE` | `SAFE` | **40.00 m** | **3.88 m** | **+30.0 s** full-speed operation |
| **Scenario 2: Converging Crossway** | $v_r = 1.4\text{m/s}, v_h = 1.3\text{m/s}$, Perpendicular crossing, Material Handling | `UNSAFE` | `WARNING → UNSAFE` | **1.85 m** ($t = 14.2\text{s}$) | **4.32 m** | Warning at 8.4s, Unsafe at 11.2s |
| **Scenario 3: High-Speed AMR Valve Service** | $v_r = 2.4\text{m/s}, v_h = 0.5\text{m/s}$, Maintenance ($1.4\times$) | `WARNING` | `WARNING` | **6.32 m** | **4.86 m** | Proactive warning expansion |

* **Prototype Unnecessary Restriction Metric**: A static-triggered halt (distance $< 4.5\text{m}$) that was safely avoided by the dynamic decision model under the exact same kinematics.

---

## 10. Failure & Edge-Case Regression Testing

The prototype contains an automated regression suite covering 6 edge cases:

1. **Coincident Initial Position ($D=0.00\text{m}$)**: Triggered immediately into `EMERGENCY`; singularity handled safely without division-by-zero.
2. **Stationary Robot AMR ($v_r = 0.0\text{m/s}$)**: Dynamic envelope reduces to $(S_h + C + B)\mu = 2.77\text{m}$, maintaining `SAFE` state and avoiding false alarms.
3. **Extreme AMR Velocity ($v_r = 9.5\text{m/s}$)**: Dynamic envelope safely scales to $25.06\text{m}$ and triggers `UNSAFE` alongside an input anomaly flag.
4. **Negative Velocity Sensor Glitch ($v_r = -1.5\text{m/s}$)**: Physical engine clamps velocity to $0.0\text{m/s}$ without crash.
5. **Out-of-Bounds Coordinate Overflow ($x=125, y=110$)**: Boundary safety monitor warns of spatial perimeter breach.
6. **Large Safety Margin Buffer ($M_{\text{safety}} = 15.0\text{m}$)**: Gracefully expands dynamic zone without numerical instability.

---

## 11. Sensitivity Analysis

Single-parameter sensitivity sweeps evaluate the gradient of required dynamic distance ($\Delta D_{\text{required}} / \Delta P$):

* **Robot Speed ($v_r$)**: Gradient $\Delta D / \Delta v_r = 0.86\text{ m}/(\text{m/s})$ (Highest influence).
* **Human Speed ($v_h$)**: Gradient $\Delta D / \Delta v_h = 0.70\text{ m}/(\text{m/s})$.
* **Task Multiplier ($\text{TaskFactor}$)**: Gradient $\Delta D / \Delta \mu = 2.44\text{ m}/\text{unit}$.
* **Safety Margin Buffer ($M_{\text{safety}}$)**: Gradient $\Delta D / \Delta M = 1.00\text{ m}/\text{m}$.
* **Stopping Time ($t_{\text{stop}}$)**: Gradient $\Delta D / \Delta t = 1.44\text{ m}/\text{s}$.

**Decision-Change Detection**: The sensitivity module automatically detects the exact parameter thresholds where the risk state shifts (e.g., in Scenario 2, increasing $v_r$ past $1.8\text{m/s}$ triggers early warning state transitions).

---

## 12. Offline & Low-Bandwidth Capability

* **100% Client-Side**: Operates entirely within the browser with zero external runtime API or cloud server dependencies.
* **LocalStorage Persistence**: Simulation history, field observation logs, and calibrated safety rules persist automatically in the browser.
* **Offline Data Export**: Generates and downloads RFC 4180 compliant CSV files and JSON dossiers directly on the client machine.

---

## 13. Accessibility and Multilingual Support

* **Triple Indicator Redundancy**: Every safety decision is communicated via **Icon + Color + Text Label** (`SAFE` ✓, `WARNING` ⚠, `UNSAFE` 🛑, `EMERGENCY` 🚨), ensuring full usability for color-blind operators.
* **Bilingual Localization**: Instant runtime switching between **English** and **Tamil (தமிழ்)** across all pages, charts, tables, and alerts.

---

## 14. Synthetic Demonstration Dataset

The project includes a standalone deterministic dataset generator script:

```bash
# Generate reproducible synthetic safety telemetry dataset
npx tsx scripts/generateSyntheticData.ts
# OR using the package script:
npm run generate-data
```

**Generated Dataset Files in `docs/`:**
* [`docs/synthetic_safety_dataset.csv`](docs/synthetic_safety_dataset.csv): 150 synthetic records covering multi-variable parametric scenarios and edge cases.
* [`docs/synthetic_safety_dataset.json`](docs/synthetic_safety_dataset.json): JSON representation of the synthetic dataset.

> **Disclaimer**: All generated records are synthetic demonstration data for algorithm testing and do not represent certified plant sensor readings.

---

## 15. Documentation Directory (`/docs`)

Comprehensive technical and evaluation documentation:

* [`docs/review-1-report.md`](docs/review-1-report.md): College Review 1 formal evaluation milestone report.
* [`docs/experiment-notebook.md`](docs/experiment-notebook.md): Experiment logs, sensitivity gradients, and comparative metrics.
* [`docs/failure-mode-analysis.md`](docs/failure-mode-analysis.md): 6-case FMEA regression test table.
* [`docs/technical-documentation.md`](docs/technical-documentation.md): Modular system architecture and source code map.
* [`docs/assumptions-and-limitations.md`](docs/assumptions-and-limitations.md): Explicit project assumptions and safety boundary limitations.
* [`docs/test-evidence.md`](docs/test-evidence.md): Automated and manual test suite verification evidence (16/16 tests passed).
* [`docs/field-workflow.md`](docs/field-workflow.md): Step-by-step user journey and operational guide.
* [`docs/user-feedback-summary.md`](docs/user-feedback-summary.md): Structured questionnaire protocol (*Validation Status: Pending actual user testing*).

---

## 16. How to Install and Run

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ (Tested on Node v24 LTS)
* npm (bundled with Node.js)

### Quick Start
```bash
# 1. Clone or extract the repository
# git clone <repo-url>

# 2. Navigate to project directory
# cd dynamic-human-robot-safety-zone-simulator

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The application will launch at **`http://localhost:5173/`**.

---

## 17. Production Build

To verify strict TypeScript compilation and create the production bundle:

```bash
npm run build
```

Production output will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 18. Assumptions and Limitations

1. **2D Planar Layout**: The plant is modeled as a 2D metric grid without vertical multi-tier mezzanine routing.
2. **Simplified Friction & Wheel Slip**: Ample floor traction is assumed; dynamic surface friction variations (e.g., oil spills) are not modeled.
3. **Single Human / AMR Pair Focus**: The primary safety envelope evaluates proximity between a primary AMR and an operator. Multi-robot fleet arbitration is part of future milestones.
4. **Prototype Decision-Support Only**: This software is not certified for direct hardware Emergency-Stop relay triggering without certified industrial safety controllers (ISO 13849 PL-d/e).

---

## 19. Future Roadmap (Review 2 & Beyond)

* **Review 2 Milestone**:
  * Multi-AMR fleet collision prediction and yield arbitration.
  * Moving environmental obstacles (e.g., overhead gantry cranes).
  * Field pilot trials with plant safety personnel using the questionnaire protocol in [`docs/user-feedback-summary.md`](docs/user-feedback-summary.md).
* **Review 3 / Final Milestone**:
  * Hardware-in-the-loop ROS2 / WebRTC bridge integration.
  * 3D spatial zone projection using Three.js / WebGL.
  * Formal comparative benchmark against industrial LiDAR zone configurations.

---

## 20. License

Academic & Research Prototype — For evaluation and educational demonstration purposes.
