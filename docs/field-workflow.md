# Field Operational Workflow: Human-Robot Proximity Simulation

## 1. End-to-End Operational Pipeline

```text
               +--------------------------------------+
               |       1. Plant Floor Layout          |
               |  (Set equipment, bays & hazard zones)|
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |       2. Define Robot Waypoints      |
               | (Interactive Canvas / Edit Path Mode)|
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |     3. Define Human Task & Route     |
               |  (Inspection, Maintenance, Handling) |
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |  4. Configure Speeds & Safety Rules  |
               |  (Base dist, Reaction time, Margins) |
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |       5. Execute 2D Simulation       |
               |    (Real-time motion & approach math)|
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |    6. Dynamic Zone & Risk Decision   |
               |   (SAFE / WARNING / UNSAFE / EMERG)  |
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |    7. Real-Time Telemetry Logging    |
               | (10Hz Distance Chart & Event Stream) |
               +--------------------------------------+
                                  │
                                  ▼
               +--------------------------------------+
               |   8. Capture Observation & Export    |
               |   (Offline LocalStorage, JSON & CSV) |
               +--------------------------------------+
```

---

## 2. Operational Roles & Responsibilities

### A. Safety Engineer (Safety Officer)
1. Calibrate safety parameters ($D_{\text{base}}$, reaction times, task multipliers) in the **Safety Rules** page.
2. Review the **Sensitivity Analysis** module to determine which operational parameters (e.g., AMR speed limit) most aggressively expand the safety perimeter.
3. Audit warning and emergency stop events during high-risk maintenance operations.

### B. Process & Logistics Plant Engineer
1. Design plant layouts using the **Plant Layout Editor** (100m $\times$ 100m coordinate grid).
2. Configure AMR automated delivery routes and test for spatial overlap with manual worker pathways.
3. Test layout modifications in the **Interactive Simulator** to verify that worker paths do not produce persistent `UNSAFE` bottlenecks.

### C. Field Operations Supervisor
1. Perform on-site walk-through audits and record observed proximity values using the **Field Data Capture** form.
2. Export captured observations as CSV/JSON for shift safety reviews.
3. Switch interface language to Tamil (தமிழ்) or English as needed for operational clarity.

---

## 3. Distinction: Current Prototype vs. Future Real-World Field System

| Feature Area | Current Prototype Capability (Browser-Based Decision Support) | Future Real-World Field Production Capability |
| :--- | :--- | :--- |
| **Execution Environment** | Browser-based interactive simulator (React / TypeScript / Canvas). | Embedded edge industrial computer / PLC / Safety Controller. |
| **Data Source** | Mathematical kinematics, synthetic benchmarks, and manual field entry. | Real-time LiDAR laser scanners, Ultra-Wideband (UWB) worker tags, optical vision. |
| **Control Action** | Decision support alerts (`SAFE`, `WARNING`, `UNSAFE`, `EMERGENCY`) and visual telemetry. | Direct hardware interlocks, failsafe relays, and AMR speed reduction commands via ROS2/PLC. |
| **Safety Certification** | **Research prototype model**. Not certified for safety-critical interlocks. | Certified according to ISO 10218-1/2, ISO/TS 15066, and IEC 61508 (SIL 2/3). |
| **Data Storage** | Local browser storage (`localStorage`), JSON export, CSV export. | Centralized Industrial SCADA / MES / Historian database. |

> [!IMPORTANT]
> **Safety Disclaimer**: The current simulator is a research decision-support prototype. It does not directly command or override real-world industrial robot machinery. Real industrial deployment requires certified safety hardware and formal third-party safety audits.
