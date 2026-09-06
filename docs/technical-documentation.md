# Technical Architecture & System Documentation

## 1. System Architecture Overview

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

## 2. Source Code Modular Map

| Component / Subsystem | Primary Source File | Key Responsibilities |
| :--- | :--- | :--- |
| **Data Models & Types** | [`src/types/index.ts`](../src/types/index.ts) | TypeScript interfaces for entities, safety rules, evaluations, telemetry samples, and experiment history. |
| **Dynamic Safety Engine** | [`src/engine/safety/safetyEngine.ts`](../src/engine/safety/safetyEngine.ts) | Mathematical dynamic safety envelope calculation, approach angle expansion, decision classification, and explainability text generation. |
| **Motion & Physics Engine** | [`src/engine/physics/motionEngine.ts`](../src/engine/physics/motionEngine.ts) | Continuous kinematic stepping, distance interpolation along waypoint lists, and entity velocity direction integration. |
| **Scenario & Preset Matrix** | [`src/engine/scenarios/scenarioData.ts`](../src/engine/scenarios/scenarioData.ts) | Defines 100m $\times$ 100m plant layout, default equipment objects, 3 industrial benchmark scenarios, and 6 regression failure cases. |
| **Storage & Export Service** | [`src/services/storageService.ts`](../src/services/storageService.ts) | Browser `localStorage` persistence for offline records, experiment history logs, and RFC 4180 compliant CSV export formatting. |
| **Bilingual Dictionary** | [`src/i18n/translations.ts`](../src/i18n/translations.ts) | Translation dictionary providing 100% UI coverage in **English** and **Tamil (தமிழ்)**. |
| **Plant Simulator Page** | [`src/pages/SimulatorPage.tsx`](../src/pages/SimulatorPage.tsx) | Interactive 2D canvas with coordinate transforms, interactive waypoint editor (drag & click), live distance telemetry chart, and run summaries. |
| **Dashboard Page** | [`src/pages/DashboardPage.tsx`](../src/pages/DashboardPage.tsx) | Executive KPIs, safe/warning/unsafe ratios, avoided false restrictions, active scenario preview, and quick launch links. |
| **Plant Layout Editor** | [`src/pages/LayoutPage.tsx`](../src/pages/LayoutPage.tsx) | Equipment coordinate editor with add/delete entity management for the 100m $\times$ 100m plant grid. |
| **Safety Rules Config** | [`src/pages/SafetyRulesPage.tsx`](../src/pages/SafetyRulesPage.tsx) | Parameter calibration panel for kinematic weights, buffers, base distance, and human task hazard multipliers. |
| **Experiments Harness** | [`src/pages/ExperimentsPage.tsx`](../src/pages/ExperimentsPage.tsx) | Automated batch scenario test harness, baseline comparison, reproducibility dossier modal, and history manager. |
| **Sensitivity Analysis** | [`src/pages/SensitivityPage.tsx`](../src/pages/SensitivityPage.tsx) | Single-parameter sweeps with decision transition alerts, sensitivity gradient ($\Delta D / \Delta P$), and influence ranking. |
| **Failure Cases Suite** | [`src/pages/FailureCasesPage.tsx`](../src/pages/FailureCasesPage.tsx) | Boundary verification suite validating singularity handling, stationary robots, sensor glitches, and out-of-bounds inputs. |
| **Field Data Capture** | [`src/pages/DataCapturePage.tsx`](../src/pages/DataCapturePage.tsx) | Field worker observation log with offline form and JSON/CSV data backup. |
| **Settings & Audit Page** | [`src/pages/SettingsPage.tsx`](../src/pages/SettingsPage.tsx) | Preferences, in-app architecture docs, Review 1 audit checklist, and limitations disclosure. |

---

## 3. Mathematical Safety Formulation

### Dynamic Required Distance Formula:
$$D_{\text{required}} = \left[ D_{\text{base}} + (v_{\text{robot}} \cdot t_{\text{stop}} \cdot w_r) + (v_{\text{human}} \cdot t_{\text{react}} \cdot w_h) + (0.5 \cdot t_{\text{react}} \cdot f_r) \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety}}$$

### Directional Vector Approach Factor:
To prevent unnecessary expansion when entities travel away from each other while expanding the envelope during head-on convergence, the relative velocity vector along the unit separation vector $\vec{n} = (\vec{p}_h - \vec{p}_r) / \|\vec{p}_h - \vec{p}_r\|$ is computed:
$$v_{\text{approach}} = (\vec{v}_r \cdot \vec{n}) - (\vec{v}_h \cdot \vec{n})$$
$$\text{DirFactor} = 1.0 + \min\left(0.5, \max\left(0, \frac{v_{\text{approach}}}{v_{\text{max}} + 2.0}\right)\right)$$

### Decision States:
* $\text{EMERGENCY}$: $D_{\text{sep}} \le 1.0\text{ m}$ (Or coincident start $(x_r, y_r) = (x_h, y_h)$).
* $\text{UNSAFE}$: $1.0\text{ m} < D_{\text{sep}} < D_{\text{required}}$.
* $\text{WARNING}$: $D_{\text{required}} \le D_{\text{sep}} < D_{\text{required}} + 1.2\text{ m}$.
* $\text{SAFE}$: $D_{\text{sep}} \ge D_{\text{required}} + 1.2\text{ m}$.

---

## 4. Coordinate Transformation Mathematics
The process plant is defined on a standard physical metric domain: $X \in [0, 100]\text{ m}, Y \in [0, 100]\text{ m}$.
To map to screen canvas viewport of dimension $W \times H$:
$$X_{\text{screen}} = \frac{X_{\text{plant}}}{100} \cdot W, \quad Y_{\text{screen}} = \frac{Y_{\text{plant}}}{100} \cdot H$$
$$X_{\text{plant}} = \frac{X_{\text{screen}}}{W} \cdot 100, \quad Y_{\text{plant}} = \frac{Y_{\text{screen}}}{H} \cdot 100$$
This guarantees invariant kinematics across all client screen resolutions.
