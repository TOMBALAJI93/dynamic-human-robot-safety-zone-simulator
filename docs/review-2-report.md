# College Review 2 Comprehensive Final Report
**Project Title**: Dynamic Human-Robot Safety-Zone Simulator for Process Plants  
**Review Stage**: Review 2 (Final Deliverable Report)  
**Academic Score Baseline (Review 1)**: **34.3 / 35 (98%)**  
**Engineering Verification**: 100% Automated Tests Passed (26/26 Tests), Clean Production Build (0 Errors)

---

## 1. Project Overview
This research project develops a deterministic, physics-grounded, web-based simulation and decision-support platform designed to model, analyze, and visualize dynamic safety envelopes for Autonomous Mobile Robots (AMRs) and human workers in industrial process plant environments.

Unlike conventional fixed static safety perimeters (which enforce rigid 3.0-meter exclusion rings leading to excessive nuisance production stops), the simulator computes adaptive dynamic safety envelopes in accordance with **ISO/TS 15066** and **ISO 13849**, factoring in kinematic trajectories, human task multipliers, environmental conditions, and multi-agent swarm proximity.

---

## 2. Review 1 Baseline Preservation
The Review 1 baseline scored **34.3 / 35 (98%)** and is strictly preserved:
* All 3 Review 1 scenarios (`SC-01`, `SC-02`, `SC-03`) remain fully operational.
* Single-agent mode ($N=1, M=1$) remains the canonical baseline.
* Nominal environmental parameters ($T=25^\circ\text{C}, P=1.013\text{ bar}, \mu=1.00, \eta=0.00$) yield **exact mathematical identity** ($5.92\text{ m}$ required distance) to Review 1 calculations.
* All original UI panels, waypoint editors, and telemetry charts remain functional.

---

## 3. Review 2 Phase 1 — Environmental Factors (COMPLETED)
Phase 1 extended the core safety formulation to model plant floor conditions:
1. **Floor Surface Friction ($\mu_{\text{floor}}$)**: Scaled stopping distances across Dry Concrete ($\mu=1.00$), Wet Washdown Tile ($\mu=0.65$), Oil Slick ($\mu=0.35$), and Cold Storage Frost ($\mu=0.20$).
2. **Ambient Stress Multiplier ($\lambda_{\text{ambient}}$)**: Modulates worker reaction buffer based on ambient temperature ($T \in [10, 50]^\circ\text{C}$) and barometric pressure ($P \in [0.8, 3.0]\text{ bar}$).
3. **Sensor Perception Noise ($\eta_{\text{sensor}}$)**: Models LiDAR/camera optical degradation due to airborne chemical dust, steam, or fog ($\eta \in [0.0, 0.70]$).

---

## 4. Review 2 Phase 2 — Multi-Agent Simulation (COMPLETED)
Phase 2 transitioned the simulator into a concurrent multi-agent swarm platform:
1. **Swarm Kinematics**: Simulates $\ge 2$ AMRs ($R_1, R_2$) and $\ge 2$ human workers ($H_1, H_2$) concurrently in the $100\text{m} \times 100\text{m}$ plant layout.
2. **Pairwise Status Matrix**: Real-time evaluation of all $K = NM + \binom{N}{2} + \binom{M}{2} = 6$ active pairs.
3. **Highest-Threat Priority Arbiter**: Deterministic risk escalation (`EMERGENCY` $\succ$ `UNSAFE` $succ$ `WARNING` $succ$ `SAFE`) with margin tie-breaking.
4. **Interactive Swarm Canvas**: Distinct color coding per entity, individual active/inactive agent toggles, dynamic envelopes, and pulsing critical threat vectors.

---

## 5. Review 2 Phase 3 — Stakeholder Evaluation System (COMPLETED • PENDING ACTUAL TRIALS)
Phase 3 implemented an authentic field evaluation system:
1. **Stakeholder Personas**: EHS Safety Officers, Plant Operators, Maintenance Engineers, and Academic Specialists.
2. **10-Question Questionnaire using a 5-Point Likert Scale**: Standardized 1–5 usability and explainability questionnaire.
3. **Qualitative Capture**: Structured fields for operational feedback and improvement suggestions.
4. **Strict Zero-Fabrication Policy**: Initial status is explicitly set to `PENDING ACTUAL TRIALS` with 0 fabricated responses.

---

## 6. Environmental Mathematical Model
$$D_{\text{required,RH}} = \left[ D_{\text{base,RH}} + \frac{v_r \cdot t_{\text{stop}} \cdot w_r}{\mu_{\text{floor}}} + (v_h \cdot t_{\text{react}} \cdot w_h \cdot \lambda_{\text{ambient}}) + C_{\text{env}} \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety,RH}}$$

Where:
* $\lambda_{\text{ambient}}(T, P) = 1.0 + \frac{|T - 25|}{100} + \frac{|P - 1.013|}{10}$
* $C_{\text{env}} = (0.5 \cdot t_{\text{react}} \cdot f_r) \cdot (1 + \eta_{\text{sensor}} \cdot 1.5) + (\eta_{\text{sensor}} \cdot 1.2)$
* $0.15 \le \mu_{\text{floor}} \le 1.00$, $\quad 0.0 \le \eta_{\text{sensor}} \le 0.70$

---

## 7. Multi-Agent Architecture
The multi-agent coordinator computes synchronized kinematic trajectories at 10Hz, passing active entity states to the pairwise safety engine:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        MULTI-AGENT COORDINATOR                          │
│                                                                         │
│   Active Robots (R1, R2, ...)              Active Humans (H1, H2, ...)   │
│   Pos, Vel, Heading, mu, stopTime          Pos, Vel, Heading, Task, T, P│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PAIRWISE SAFETY EVALUATION CORE                     │
│  ┌──────────────────────────┬──────────────────────────┬─────────────┐  │
│  │ Robot-Human (R_i ↔ H_j)  │ Robot-Robot (R_i ↔ R_k)  │ H-H (H_j↔H_l│  │
│  │ Extended ISO/TS 15066    │ Combined 1/mu Braking    │ Worker Buff │  │
│  └──────────────────────────┴──────────────────────────┴─────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    HIGHEST-THREAT ARBITRATION MATRIX                    │
│  - Tier 1: EMERGENCY (D_sep <= 1.0m)                                    │
│  - Tier 2: UNSAFE    (D_sep < 0.55 * D_req)                             │
│  - Tier 3: WARNING   (0.55 * D_req <= D_sep <= D_req)                   │
│  - Tier 4: SAFE      (D_sep > D_req)                                    │
│  - Tie-Breaker: Smallest Remaining Safety Margin (D_sep - D_req)        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Pairwise Safety Evaluation

### Robot $\leftrightarrow$ Robot Dynamic Braking Formula ($D_{\text{required,RR}}$):
$$D_{\text{required,RR}} = \left[ D_{\text{base,RR}} + \frac{v_{r1} \cdot t_{\text{stop1}} \cdot w_r + v_{r2} \cdot t_{\text{stop2}} \cdot w_r}{\mu_{\text{floor}}} + C_{\text{sensor,RR}} \right] \cdot \text{DirFactor}_{RR} + M_{\text{safety,RR}}$$

### Human $\leftrightarrow$ Human Worker Buffer Formula ($D_{\text{required,HH}}$):
$$D_{\text{required,HH}} = D_{\text{base,HH}} + \frac{v_{h1} \cdot t_{\text{react1}} + v_{h2} \cdot t_{\text{react2}}}{2} \cdot \lambda_{\text{ambient}} + M_{\text{safety,HH}}$$

---

## 9. Highest-Threat Arbitration Logic
For $K$ active pairs, the system arbitrates the global plant safety state:
$$\text{GlobalRisk} = \max_{k \in K} \{ \text{RiskLevel}_k \}$$
If multiple pairs share the maximum risk level, the arbiter selects the critical threat pair $k^*$ minimizing:
$$k^* = \arg\min_{k} \left( D_{\text{current},k} - D_{\text{required},k} \right)$$

---

## 10. Multi-Agent Scenarios
* **MULTI-01 (Intersection Crossing)**: 2 AMRs crossing orthogonal paths at central 4-way intersection with 2 walking workers. Tests cross-traffic deceleration and vehicle-to-vehicle threat arbitration.
* **MULTI-02 (Worker-Heavy Aisle)**: 1 AMR navigating through a narrow transit aisle occupied by 2 workers performing inspection and maintenance. Tests multi-worker proximity envelopes.
* **MULTI-03 (Process Plant Convergence)**: 2 AMRs and 2 workers converging simultaneously on Reactor Node 1 under wet washdown floor conditions ($\mu=0.65, T=30^\circ\text{C}, \eta=0.10$).

---

## 11. Environmental Experiments (Measured Results)
Directly measured via `scripts/runEnvironmentalExperiment.ts` (saved to `docs/data/environmental_experiments_results.csv`):

| Scenario ID | Floor Condition | $\mu$ | Temp | Sensor $\eta$ | Min Sep ($m$) | Max Req ($m$) | Baseline Req ($m$) | $\Delta D_{\text{req}}$ | Peak State |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ENV-EXP-01A** | Dry Concrete (Nominal) | 1.00 | 25°C | 0.00 | 0.85 | **5.92** | 5.92 | **+0.00 m (0%)** | EMERGENCY |
| **ENV-EXP-01B** | Wet Washdown Tile | 0.65 | 25°C | 0.00 | 0.85 | **7.15** | 5.92 | **+1.23 m (+20.8%)** | EMERGENCY |
| **ENV-EXP-01C** | Oil Slick Leakage | 0.35 | 25°C | 0.00 | 0.85 | **9.42** | 5.92 | **+3.50 m (+59.1%)** | EMERGENCY |
| **ENV-EXP-01D** | High Heat & Mist | 0.65 | 45°C | 0.30 | 0.85 | **8.12** | 5.92 | **+2.20 m (+37.2%)** | EMERGENCY |

---

## 12. Multi-Agent Experiments (Measured Results)
Directly measured via `scripts/runMultiAgentExperiment.ts` (saved to `docs/data/multi_agent_experiments_results.csv`):

| Scenario ID | Scenario Name | Active Pairs | $\mu$ | Temp | Noise $\eta$ | Min Sep | Max Req | Critical Threat | Peak State | Mean Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Scenario ID | Scenario Name | Active Pairs | $\mu$ | Temp | Noise $\eta$ | Min Sep | Max Req | Critical Threat | Peak State | Mean Latency | Max Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MULTI-EXP-01** | Intersection Crossing | 6 | 1.00 | 25°C | 0.00 | **0.05 m** | **7.05 m** | AMR-01 ↔ AMR-02 | **EMERGENCY** | **113 $\mu$s** | **2,759 $\mu$s** |
| **MULTI-EXP-02** | Worker-Heavy Aisle | 3 | 1.00 | 25°C | 0.00 | **2.00 m** | **8.65 m** | AMR-01 ↔ Worker-01 | **UNSAFE** | **46 $\mu$s** | **792 $\mu$s** |
| **MULTI-EXP-03** | Plant Convergence | 6 | 0.65 | 30°C | 0.10 | **0.02 m** | **10.03 m** | AMR-01 ↔ Worker-01 | **EMERGENCY** | **69 $\mu$s** | **603 $\mu$s** | Plant Convergence | 6 | 0.65 | 30°C | 0.10 | **0.02 m** | **10.03 m** | AMR-01 ↔ Worker-01 | **EMERGENCY** | **69 $\mu$s** |

---

## 13. Failure Mode & Boundary Analysis (18 Edge Cases)
* **Single-Agent Boundaries (EC-01 to EC-12)**: Zero speed, supersonic overspeed (5.0 m/s), stationary worker, running worker (3.5 m/s), high-risk chemical maintenance task, oil slick low-friction clamp, heavy haze clamp, coincident spawn, direct head-on collision, and rapid direction reversal.
* **Multi-Agent Boundaries (MULTI-EC-01 to MULTI-EC-06)**:
  1. **MULTI-EC-01**: Coincident spawn / agents starting at the same location ($D=0.0\text{ m}$).
  2. **MULTI-EC-02**: Four agents occupying the same position, producing multiple EMERGENCY pair evaluations.
  3. **MULTI-EC-03**: Two robots moving head-on toward each other and correctly detecting the Robot-Robot threat.
  4. **MULTI-EC-04**: One robot surrounded by multiple humans, with all relevant Robot-Human pairs evaluated and the highest threat selected.
  5. **MULTI-EC-05**: Active/inactive agent handling (inactive entities safely excluded from pairwise matrix).
  6. **MULTI-EC-06**: Out-of-bounds agent handling (coordinates outside $100\text{m}\times 100\text{m}$ grid evaluated safely without crash).
* **All 18 edge cases pass with 100% expected behavior.**

## 14. Automated Testing Summary

```text
================================================================
REVIEW 2: COMPREHENSIVE AUTOMATED SAFETY & MULTI-AGENT TEST SUITE
================================================================

[ENV-01] ✓ PASS: Nominal Environmental Conditions Match Review 1 Baseline Identity
[ENV-02] ✓ PASS: Wet Floor (μ=0.65) Expands Dynamic Safety Distance vs Dry Floor (μ=1.0)
[ENV-03] ✓ PASS: Oil Slick (μ=0.35) Expands Distance Further than Wet Floor
[ENV-04] ✓ PASS: Zero Friction Input (μ=0.0) Safely Clamped to Minimum Bound (μ=0.15)
[ENV-05] ✓ PASS: Elevated Temperature (45°C) Modulates Ambient Stress Clearance
[ENV-06] ✓ PASS: Sensor Optical Degradation (η=0.40) Increases Required Clearance
[ENV-07] ✓ PASS: Sensor Degradation Overflow (η=1.5) Safely Clamped to Max Bound (0.70)
[ENV-08] ✓ PASS: High Ambient Pressure (2.5 bar) Safely Accommodated
[MULTI-01] ✓ PASS: Two Robots Pairwise Braking Separation Evaluated Correctly
[MULTI-02] ✓ PASS: Two Humans Pairwise Walking Proximity Buffer Evaluated Correctly
[MULTI-03] ✓ PASS: Multi-Agent System Evaluates All Combinations (6 Pairs for 2 AMRs + 2 Humans)
[MULTI-04] ✓ PASS: Highest Threat Correctly Arbitrated by Risk Priority (EMERGENCY over UNSAFE)
[MULTI-05] ✓ PASS: Coincident Coordinates (0.0m Separation) Trigger EMERGENCY without NaN
[MULTI-06] ✓ PASS: Inactive Agents Excluded from Pairwise Evaluation
[MULTI-07] ✓ PASS: Out-of-Bounds Entity Coordinates Evaluated Safely Without Application Crash
[MULTI-08] ✓ PASS: Wet Floor (μ=0.65) Expands Robot-Robot Required Braking Distance
[MULTI-09] ✓ PASS: 18 Edge Cases & Failure Boundary Suite (12 Single-Agent + 6 Multi-Agent)
[MULTI-10] ✓ PASS: Monte Carlo Multi-Agent Stress Trials: Robustness & Zero NaN across Randomized Swarms

--- PHASE 3 STAKEHOLDER EVALUATION MODULE TESTS ---
[STAKE-01] ✓ PASS: Empty Evaluation State Produces PENDING_ACTUAL_TRIALS with Zero Averages
[STAKE-02] ✓ PASS: Valid Completed Likert Response Yields RESPONSES_AVAILABLE and Correct Average
[STAKE-03] ✓ PASS: Multiple Personas Aggregated with Accurate Role Distribution
[STAKE-04] ✓ PASS: Partial / Incomplete Evaluation Produces IN_PROGRESS Status Without Averaging Bias
[STAKE-05] ✓ PASS: Stakeholder CSV Export Conforms to Evaluation Schema with Headers & Escaped Fields
[STAKE-06] ✓ PASS: Stakeholder JSON Export Produces Valid Parseable Array
[STAKE-07] ✓ PASS: English Stakeholder Localization Dictionary Complete Across All 10 Questions & Personas
[STAKE-08] ✓ PASS: Tamil Stakeholder Localization Dictionary Complete Across All 10 Questions & Personas

================================================================
FINAL TEST SUMMARY: 26/26 PASSED (100% SUCCESS)
================================================================
```

---

## 15. Performance Measurements
* **Mean Multi-Agent Cycle Time**: $69\text{ }\mu\text{s}$ (6 pairs) $\ll 100\text{ ms}$ ($10\text{ Hz}$ limit).
* **Memory Footprint**: $< 15\text{ MB}$ RAM heap allocation.
* **Production Bundle Size**: $418\text{ kB}$ JavaScript ($109\text{ kB}$ gzip), $50\text{ kB}$ CSS ($8.8\text{ kB}$ gzip).

---

## 16. Accessibility
* High-contrast color palette with WCAG AAA text contrast.
* Triple-redundant status indicators (Color + Lucide Icon + Explicit Text).
* Full keyboard navigation support (Tab / Enter / Space / Arrow keys) with visible `ring-2` focus states across all Likert buttons and inputs.

---

## 17. English & Tamil Localization
* 100% string coverage in English (`en`) and Tamil (`ta`).
* Dynamic runtime language switcher persisting choice to localStorage.
* Tamil translations reviewed for engineering appropriateness (`அவசர நிறுத்தம்`, `பங்குதாரர் கருத்து`, `மாறும் பாதுகாப்பு மண்டலம்`).

---

## 18. Offline Data Capture & Storage
* Operates 100% offline without requiring internet access or cloud backend.
* Web Storage API persists simulation configs, layouts, telemetry history, and stakeholder evaluation responses.
* Universal CSV & JSON export functionality.

---

## 19. Stakeholder Evaluation Method
Implemented in `src/pages/StakeholderFeedbackPage.tsx` with 4 role personas, 10 Likert questions, 6 qualitative fields, session duration tracking, and dynamic summary calculations.

---

## 20. Current Validation Status
* **Status**: **`PENDING ACTUAL TRIALS`**
* **Total Stored Responses**: **0 Real Responses**
* **Zero Synthetic Responses**: No fabricated scores or fake user interviews are displayed as authentic.

---

## 21. Assumptions and Limitations
1. **2D Kinematic Planar Approximation**: AMRs and workers navigate in horizontal $(x, y)$ coordinates; multi-level vertical clearance is not modeled.
2. **Homogeneous Sector Friction**: Floor friction $\mu$ applies uniformly across sector cells.
3. **Decentralized Network Delay Bounded**: Centralized safety observer processes odometry within a $100\text{ ms}$ latency budget.

---

## 22. Known Limitations
1. Does not interface directly with physical PLC industrial fieldbuses (e.g. PROFINET, EtherCAT).
2. Human trajectory modeling follows deterministic waypoints rather than non-linear stochastic behavioral intentions.

---

## 23. Future Work (Post-Review 2)
1. Conducting formal in-person field trials with plant EHS officers and collecting authentic questionnaire responses.
2. Integrating 3D LiDAR point cloud voxel ray-casting.
3. Implementing ROS2 / Micro-ROS bridge adapters for physical AMR testbed validation.
