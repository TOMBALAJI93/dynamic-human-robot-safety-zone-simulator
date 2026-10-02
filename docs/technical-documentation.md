# Technical Architecture & System Documentation (Review 2 Phase 2)

## 1. System Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT 19 FRONTEND                             │
│  ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐  │
│  │   Navigation & Nav    │ │  Bilingual i18n   │ │ Tailwind CSS v4   │  │
│  │     (Navbar.tsx)      │ │ (translations.ts) │ │   Theme Engine    │  │
│  └───────────────────────┘ └───────────────────┘ └───────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Pages: Dashboard, Simulator (Multi-Agent Swarm Canvas), Layout, │  │
│  │         Scenarios, Safety Rules, Experiments, Sensitivity,        │  │
│  │         Failure Cases (Single & Multi-Agent), Data Capture.       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SIMULATION & MULTI-AGENT SAFETY CORE                 │
│  ┌─────────────────────────┐ ┌───────────────────────────────────────┐  │
│  │   Multi-Agent Motion    │ │    Pairwise Safety & Threat Arbiter   │  │
│  │   (motionEngine.ts)     │ │           (safetyEngine.ts)           │  │
│  │  - Swarm kinematics     │ │  - Extended ISO/TS 15066 (Robot-Human)│  │
│  │  - Multi-path tracking  │ │  - Combined Braking (Robot-Robot)     │  │
│  │  - Active agent gating  │ │  - Ambient Worker Buffer (Human-Human)│  │
│  │                         │ │  - Highest-Threat Priority Arbiter    │  │
│  └─────────────────────────┘ └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Scenario Data & Presets (scenarioData.ts)                         │  │
│  │  - 3 Single-Agent + 3 Multi-Agent Scenarios (MULTI-01, 02, 03)    │  │
│  │  - 18 Edge Cases (EC-01..12 Single-Agent, MULTI-EC-01..06 Swarm)  │  │
│  │  - Floor Presets: Dry Concrete, Wet Tile, Oil Slick, Frost        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       LOCAL STORAGE & EXPORT ENGINE                     │
│  ┌─────────────────────────┐ ┌───────────────────────────────────────┐  │
│  │   Browser LocalStorage  │ │         Universal CSV Exporter        │  │
│  │   (storageService.ts)   │ │  - Telemetry CSV (10Hz samples)       │  │
│  │  - Multi-Agent History  │ │  - Multi-Agent Experiments CSV        │  │
│  │  - Floor / Swarm Config │ │  - Deterministic CSV Benchmarks       │  │
│  └─────────────────────────┘ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Review 2 Phase 2 Mathematical Safety Formulations

### 2.1 Robot <-> Human Dynamic Safety Distance ($D_{\text{required,RH}}$)
$$D_{\text{required,RH}} = \left[ D_{\text{base,RH}} + \frac{v_r \cdot t_{\text{stop}} \cdot w_r}{\mu_{\text{floor}}} + (v_h \cdot t_{\text{react}} \cdot w_h \cdot \lambda_{\text{ambient}}) + C_{\text{env}} \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety,RH}}$$

Where:
* $D_{\text{base,RH}} = 1.20\text{ m}$, $M_{\text{safety,RH}} = 0.80\text{ m}$.
* $\mu_{\text{floor}} \in [0.15, 1.00]$: Floor friction scaling stopping distance.
* $\lambda_{\text{ambient}}(T, P) = 1.0 + \frac{|T - 25|}{100} + \frac{|P - 1.013|}{10}$: Ambient stress multiplier.
* $C_{\text{env}} = (0.5 \cdot t_{\text{react}} \cdot f_r) \cdot (1 + \eta \cdot 1.5) + (\eta \cdot 1.2)$: Sensor noise degradation envelope.

### 2.2 Robot <-> Robot Pairwise Safety Distance ($D_{\text{required,RR}}$)
For two AMRs ($R_1, R_2$) operating simultaneously:
$$D_{\text{required,RR}} = \left[ D_{\text{base,RR}} + \frac{v_{r1} \cdot t_{\text{stop1}} \cdot w_r + v_{r2} \cdot t_{\text{stop2}} \cdot w_r}{\mu_{\text{floor}}} + C_{\text{sensor,RR}} \right] \cdot \text{DirFactor}_{RR} + M_{\text{safety,RR}}$$
* $D_{\text{base,RR}} = 1.00\text{ m}$, $M_{\text{safety,RR}} = 0.60\text{ m}$.
* Direct head-on collision risks are mitigated by combining both vehicles' braking distances scaled by reciprocal floor friction $1/\mu_{\text{floor}}$.

### 2.3 Human <-> Human Pairwise Walking Safety Distance ($D_{\text{required,HH}}$)
For two human workers ($H_1, H_2$) in shared transit aisles:
$$D_{\text{required,HH}} = D_{\text{base,HH}} + \frac{v_{h1} \cdot t_{\text{react1}} + v_{h2} \cdot t_{\text{react2}}}{2} \cdot \lambda_{\text{ambient}} + M_{\text{safety,HH}}$$
* $D_{\text{base,HH}} = 0.80\text{ m}$, $M_{\text{safety,HH}} = 0.40\text{ m}$.

---

## 3. Highest-Threat Arbitration Logic

For $N$ robots and $M$ humans, total active pairs evaluated is:
$$K = N \cdot M + \frac{N(N-1)}{2} + \frac{M(M-1)}{2}$$
For $N=2, M=2 \implies 4 + 1 + 1 = 6$ pairs.

The system determines the global plant safety state via strict risk priority:
$$\text{EMERGENCY} \succ \text{UNSAFE} \succ \text{WARNING} \succ \text{SAFE}$$

**Tie-Breaking Rule**: When multiple pairs share the same highest risk tier, arbitration selects the pair with the **smallest remaining safety margin**:
$$\text{Margin}_{ij} = D_{\text{sep},ij} - D_{\text{required},ij}$$

---

## 4. Evaluation Latency & Scalability

Deterministic profiling across $10,000$ iterations demonstrates:
* $N=2, M=2$ (6 pairs): Mean evaluation time **$69\text{ }\mu\text{s}$ to $113\text{ }\mu\text{s}$** ($< 0.12\text{ ms}$).
* Worst-case tail latency: $< 2.8\text{ ms}$.
* The measured pairwise evaluation latency is well below the 100 ms target budget for a 10 Hz simulation step.
