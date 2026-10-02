# Dynamic Human-Robot Safety-Zone Simulator for Process Plants

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8-646cff.svg)](https://vite.dev/)
[![Review 2 Status](https://img.shields.io/badge/Review%202-Implemented%20%26%20Verified-success.svg)]()
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **RESEARCH PROTOTYPE NOTICE**: This software is an academic decision-support prototype. It is a research/prototype implementation informed by relevant safety-distance concepts (including ISO 13855 and ISO/TS 15066 principles) and does not claim legal industrial safety certification.

---

## 1. Project Overview & Problem Statement

In industrial process plant environments (petrochemical refineries, pharmaceutical manufacturing facilities, chemical plants), Autonomous Mobile Robots (AMRs) and human operators share corridors, valve aisles, and equipment maintenance bays.

Conventional safety systems rely on **fixed, static exclusion zones** (stopping an AMR whenever any human enters a static radius). While fail-safe, static exclusion creates operational bottlenecks through false nuisance restrictions. This project delivers a deterministic dynamic safety zone simulator that calculates adaptive safety envelopes in real time.

---

## 2. Review 2 Architecture & Three Major Pillars

The Review 1 baseline scored **34.3 / 35 (98%)** and is preserved with 100% backward compatibility. Review 2 introduces three major pillars:

### Pillar 1: Environmental Physics Integration
- **Floor Surface Friction ($\mu_{\text{floor}}$)**: Dynamically scales braking stopping distance across Dry Concrete ($\mu=1.00$), Wet Washdown Tile ($\mu=0.65$), Oil Slick ($\mu=0.35$), and Frost ($\mu=0.20$).
- **Ambient Multiplier ($\lambda_{\text{ambient}}$)**: Modulates human reaction buffer for thermal-pressure stress ($T \in [10, 50]^\circ\text{C}, P \in [0.8, 3.0]\text{ bar}$).
- **Sensor Optical Degradation ($\eta_{\text{sensor}}$)**: Accounts for perception envelope expansion in haze/dust/steam ($\eta \in [0.0, 0.70]$).

### Pillar 2: Multi-Agent Swarm Simulation & Pairwise Arbitration
- **Multi-Agent Entities**: Simulates $\ge 2$ AMRs ($R_1, R_2$) and $\ge 2$ Human Workers ($H_1, H_2$).
- **Pairwise Evaluation Matrix**: Evaluates all $K = NM + \binom{N}{2} + \binom{M}{2} = 6$ active combinations (Robot-Human, Robot-Robot, Human-Human).
- **Highest-Threat Priority Arbiter**: Deterministic escalation (`EMERGENCY` $\succ$ `UNSAFE` $succ$ `WARNING` $succ$ `SAFE`) with margin tie-breaking ($D_{\text{sep}} - D_{\text{req}}$).
- **Multi-Agent Scenarios**: MULTI-01 (Intersection Crossing), MULTI-02 (Worker-Heavy Aisle), MULTI-03 (Reactor Convergence).

### Pillar 3: Stakeholder Evaluation System
- **Stakeholder Personas**: Plant Safety Officer / EHS Manager, Process Plant Operator / Technician, Automation / AMR Maintenance Engineer, Academic / Safety Specialist.
- **Evaluation Instrument**: 10-question stakeholder questionnaire using a 5-point Likert scale + 6 qualitative observation fields.
- **Validation Status**: **Stakeholder evaluation interface implemented; validation pending actual stakeholder trials.** (Zero fabricated responses).
- **Persistence & Export**: Offline `localStorage` persistence with one-click CSV and JSON exports.

---

## 3. Mathematical Safety Formulation

### Extended Dynamic Required Distance ($D_{\text{required,RH}}$):
$$D_{\text{required,RH}} = \left[ D_{\text{base,RH}} + \frac{v_r \cdot t_{\text{stop}} \cdot w_r}{\mu_{\text{floor}}} + (v_h \cdot t_{\text{react}} \cdot w_h \cdot \lambda_{\text{ambient}}) + C_{\text{env}} \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety,RH}}$$

### Robot-Robot Dynamic Braking Distance ($D_{\text{required,RR}}$):
$$D_{\text{required,RR}} = \left[ D_{\text{base,RR}} + \frac{v_{r1} \cdot t_{\text{stop1}} \cdot w_r + v_{r2} \cdot t_{\text{stop2}} \cdot w_r}{\mu_{\text{floor}}} + C_{\text{sensor,RR}} \right] \cdot \text{DirFactor}_{RR} + M_{\text{safety,RR}}$$

### Human-Human Walking Proximity Distance ($D_{\text{required,HH}}$):
$$D_{\text{required,HH}} = D_{\text{base,HH}} + \frac{v_{h1} \cdot t_{\text{react1}} + v_{h2} \cdot t_{\text{react2}}}{2} \cdot \lambda_{\text{ambient}} + M_{\text{safety,HH}}$$

---

## 4. Multi-Agent Failure Boundary Cases (MULTI-EC-01 to MULTI-EC-06)

1. **MULTI-EC-01**: Coincident spawn / agents starting at the same location ($D=0.0\text{ m}$, handles $0/0$ directional vector safely).
2. **MULTI-EC-02**: Four agents occupying the same position, producing multiple EMERGENCY pair evaluations simultaneously.
3. **MULTI-EC-03**: Two robots moving head-on toward each other and correctly detecting the Robot-Robot threat.
4. **MULTI-EC-04**: One robot surrounded by multiple humans, with all relevant Robot-Human pairs evaluated and the highest threat selected.
5. **MULTI-EC-05**: Active/inactive agent handling (inactive entities excluded from pairwise matrix).
6. **MULTI-EC-06**: Out-of-bounds agent handling (coordinates outside $100\text{m} \times 100\text{m}$ grid evaluated safely without crashes).

---

## 5. Measured Experimental Performance

Directly measured from deterministic benchmark executions:

### Multi-Agent Swarm Experiments (`docs/data/multi_agent_experiments_results.csv`):
| Experiment ID | Scenario Name | Active Pairs | $\mu$ | Temp | Noise $\eta$ | Min Sep | Max Req | Critical Threat | Peak State | Mean Latency | Max Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MULTI-EXP-01** | Intersection Crossing | 6 | 1.00 | 25°C | 0.00 | **0.05 m** | **7.05 m** | AMR-01 ↔ AMR-02 | **EMERGENCY** | **113 $\mu$s** | **2,759 $\mu$s** |
| **MULTI-EXP-02** | Worker-Heavy Aisle | 3 | 1.00 | 25°C | 0.00 | **2.00 m** | **8.65 m** | AMR-01 ↔ Worker-01 | **UNSAFE** | **46 $\mu$s** | **792 $\mu$s** |
| **MULTI-EXP-03** | Plant Convergence | 6 | 0.65 | 30°C | 0.10 | **0.02 m** | **10.03 m** | AMR-01 ↔ Worker-01 | **EMERGENCY** | **69 $\mu$s** | **603 $\mu$s** |

---

## 6. Verification & Test Suite

Run the full automated test suite (26 tests covering Review 1 baseline, Phase 1 environmental factors, Phase 2 multi-agent swarms, and Phase 3 stakeholder modules):

```bash
# Run automated test harness
npx tsx scripts/runTests.ts

# Run production build
npm run build
```

**Result**: 26 / 26 Tests Passed (100%), 0 Build Errors.

---

## 7. Current Project & Review Status

> **Review 2 development scope is implemented and tested, with stakeholder validation pending actual trials.**

* **Review 1 Baseline**: Preserved ($34.3/35, 98\%$).
* **Review 2 Phase 1 (Environmental)**: Complete.
* **Review 2 Phase 2 (Multi-Agent)**: Complete.
* **Review 2 Phase 3 (Stakeholder Portal)**: Implemented; validation pending actual stakeholder trials.
