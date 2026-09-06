# Test Evidence and Verification Dossier

## 1. Test Execution Summary

* **Project**: Dynamic Human-Robot Safety-Zone Simulator for Process Plants
* **Build Target**: Vite + TypeScript Strict (`tsc -b && vite build`)
* **Test Date**: September 2026
* **Overall Functional Pass Rate**: **100% (16 / 16 Tests Passed)**

---

## 2. Automated & Regression Test Suite Results

### A. Operating Scenarios Verification

| Test ID | Test Scenario | Inputs & Kinematics | Expected Risk State | Actual Result | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **TC-SC01** | Scenario 1: Normal Operation | $v_r = 1.2\text{ m/s}, v_h = 1.1\text{ m/s}$, Parallel routes ($D_{\text{sep}} \ge 40.0\text{m}$) | `SAFE` | `SAFE` ($D_{\text{req}} = 3.88\text{m}$, 0 violations) | **PASS** |
| **TC-SC02** | Scenario 2: Converging Crossway | $v_r = 1.4\text{ m/s}, v_h = 1.3\text{ m/s}$, Perpendicular paths ($D_{\text{min}} = 1.85\text{m}$) | `WARNING → UNSAFE` | `WARNING` at $t=8.4\text{s}$, `UNSAFE` at $t=11.2\text{s}$ | **PASS** |
| **TC-SC03** | Scenario 3: High-Speed AMR | $v_r = 2.4\text{ m/s}$, Task = `Maintenance` ($1.4\times$), $D_{\text{min}} = 6.32\text{m}$ | `WARNING` | `WARNING` ($D_{\text{req}} = 4.86\text{m}$) | **PASS** |

---

### B. Failure & Edge Case Verification

| Test ID | Edge Case | Inputs & Boundary Conditions | Expected Handling | Actual Outcome | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **TC-EC01** | Coincident Start | Robot at $(50, 50)$, Human at $(50, 50)$, $D = 0.00\text{m}$ | Immediate `EMERGENCY` interlock | `EMERGENCY` triggered instantly, no NaN/div-by-zero | **PASS** |
| **TC-EC02** | Stationary Robot | $v_r = 0.0\text{ m/s}, v_h = 1.2\text{ m/s}, D = 6.00\text{m}$ | `SAFE` (Minimal dynamic buffer) | `SAFE` ($D_{\text{req}} = 2.77\text{m}$, no false alarms) | **PASS** |
| **TC-EC03** | Excessive Velocity Anomaly | $v_r = 9.5\text{ m/s}$ ($> 2.5\text{ m/s}$ max threshold) | `UNSAFE` + Parameter validation flag | `UNSAFE` state + Out-of-bounds warning alert | **PASS** |
| **TC-EC04** | Negative Velocity Glitch | $v_h = -1.5\text{ m/s}$ (Sensor corruption) | Negative value clamped + Error flagged | Speed clamped to $0\text{ m/s}$ + Validation Error | **PASS** |
| **TC-EC05** | Spatial Coordinate Overflow | Human placed at $(125\text{m}, 110\text{m})$ outside 100m grid | Boundary alert flagged | Coordinate overflow detected & flagged | **PASS** |
| **TC-EC06** | Excessive Safety Margin | $M_{\text{safety}} = 15.0\text{m}$ | Conservative envelope expansion | Wide zone expansion, state = `WARNING` | **PASS** |

---

### C. Interactive Features & Data Integrity Verification

| Test ID | Subsystem | Validation Description | Expected Output | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-UI01** | Interactive Waypoint Editor | Adding/moving robot and human waypoints on canvas. | Path lines update smoothly with numbered nodes; converts to plant coordinates. | **PASS** |
| **TC-UI02** | Coordinate Conversion | Scale canvas pixels to $100\text{m} \times 100\text{m}$ plant grid. | Screen resize preserves exact physical separation distances. | **PASS** |
| **TC-UI03** | 10Hz Telemetry & Chart | Record continuous samples and render dual-trace chart. | Telemetry records $X, Y, v_r, v_h, D, D_{\text{req}}$; chart shades unsafe zone in red. | **PASS** |
| **TC-UI04** | Experiment History | Save simulation run and retrieve from `localStorage`. | Run summary stored; reproducibility dossier inspects exact input parameters. | **PASS** |
| **TC-UI05** | Decision-Change Detection | Parameter sweep in Sensitivity module. | Identifies threshold transitions (e.g., $v_r$ $2\text{m/s} \to 3\text{m/s}$ causes `SAFE \to WARNING`). | **PASS** |
| **TC-UI06** | Universal CSV Export | Export Experiments, Telemetry, and Field Observations. | Generates RFC 4180 compliant CSV files with valid headers and data. | **PASS** |
| **TC-UI07** | Bilingual Localization | Switch between English and Tamil (தமிழ்). | All navbar items, buttons, state badges, and table headers update dynamically. | **PASS** |

---

## 3. Build & Compilation Verification

```bash
> new-folder@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
transforming...
✓ 1850 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.67 kB │ gzip:  0.46 kB
dist/assets/index-D-TV4iYI.css   41.36 kB │ gzip:  7.60 kB
dist/assets/index-BZRy6T8k.js   345.50 kB │ gzip: 94.01 kB

✓ built in 619ms
```
* **Result**: Zero compilation errors, zero type errors, strict `verbatimModuleSyntax` compliance verified.
