# Project Assumptions and System Limitations

## 1. Project Characterization & Scope
The **Dynamic Human-Robot Safety-Zone Simulator** is a **research and academic prototype** developed to demonstrate the feasibility of adaptive, kinematic-based human-robot separation zones in process plant logistics. 

> [!WARNING]
> **Important Safety & Compliance Notice**:
> This simulator is a decision-support and academic simulation tool. It is **NOT** a certified industrial safety system and must not be used to directly control real-world industrial machinery or safety-critical interlocks without certified hardware and formal safety validation.

---

## 2. Core Modeling Assumptions

1. **Planar 2D Kinematics**:
   * The process plant is modeled as a flat, single-level coordinate grid ($100\text{m} \times 100\text{m}$). Multi-level mezzanine decks, staircases, and vertical robot arm reach envelopes are outside the current prototype scope.
2. **Deterministic Kinematic Velocities**:
   * Velocity magnitudes and directions are computed instantaneously. Deceleration stopping time ($t_{\text{stop}}$) and perception-reaction latency ($t_{\text{react}}$) are parameterized as lumped constants rather than complex non-linear hydraulic/motor curve transients.
3. **Synthetic Demonstration Data**:
   * All baseline scenarios and test runs use project-created synthetic data designed to test boundary conditions. They do not represent proprietary empirical telemetry from an operational process facility.
4. **Transparent Prototype Safety Formula**:
   * The safety boundary formula:
     $$D_{\text{required}} = \left[ D_{\text{base}} + (v_r \cdot t_{\text{stop}} \cdot w_r) + (v_h \cdot t_{\text{react}} \cdot w_h) + (0.5 \cdot t_{\text{react}} \cdot f_r) \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety}}$$
     is an explainable engineering model formulated for research comparison against static perimeters.
5. **Human Attentiveness & Task Factors**:
   * Human tasks (Inspection, Maintenance, Material Handling) apply scalar multiplier weights based on assumed distraction level, but do not simulate biomechanical worker ergonomics.

---

## 3. Explicit System Limitations

| Category | What the Prototype Implements | What the Prototype Does NOT Represent |
| :--- | :--- | :--- |
| **Robotics Hardware** | Predefined waypoint following and continuous velocity vectors. | Real robot controller firmwares (KUKA KRC, Fanuc, ABB IRC5), torque limits, or wheel friction slip. |
| **Sensing & Telemetry** | 10Hz mathematical sampling and simulated sensor glitches. | Real LiDAR point-cloud clustering, time-of-flight camera occlusion, or multipath radio interference. |
| **Industrial Control** | High-level risk state calculation (`SAFE`, `WARNING`, `UNSAFE`, `EMERGENCY`). | Hardware-level failsafe relays, SIL 2/3 PLCs, or fieldbus industrial Ethernet (PROFINET/EtherCAT). |
| **Regulatory Certification** | Academic verification of mathematical consistency and boundary robustness. | Formal certification under **ISO 10218-1/2** (Industrial Robots), **ISO/TS 15066** (Collaborative Robots), or **IEC 61508 / ISO 13849-1** (Functional Safety). |
| **Multi-Agent Scale** | Single robot AMR and single human worker per scenario. | Dense multi-robot fleet traffic dispatching, deadlocks, and dynamic swarm avoidance. |
| **Environmental Dynamics** | Static equipment blocks and restricted hazard zones. | Dynamic swinging crane loads, liquid spills, or structural thermal expansion. |

---

## 4. Academic Integrity & Honest Reporting Guidelines
* **No "Zero-Risk" Claims**: No automated safety algorithm can guarantee zero industrial risk in physical environments.
* **No Fabricated Accuracies**: In the absence of real-world ground-truth telemetry from thousands of certified plant hours, results are reported in terms of **mathematical consistency, boundary compliance, and avoided unnecessary restrictions**.
