# Failure Mode and Edge-Case Analysis (FMEA)

## Overview
This document evaluates system robustness against edge conditions, mathematical singularities, telemetry sensor glitches, and invalid parameter inputs in the **Dynamic Human-Robot Safety-Zone Simulator**.

---

## Edge Case Matrix

| ID | Case Description | Input Parameters | Expected Decision | Observed Output | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **EC-01** | Coincident Initial Coordinates | Human & Robot both at $(50.0, 50.0)$, $D_{\text{sep}} = 0.00\text{m}$ | `EMERGENCY` | `EMERGENCY` (Immediate interlock, divide-by-zero avoided) | **PASS** |
| **EC-02** | Stationary AMR (Idle Dock) | $v_r = 0.0\text{ m/s}, v_h = 1.2\text{ m/s}, D_{\text{sep}} = 6.00\text{m}$ | `SAFE` | `SAFE` ($D_{\text{req}} = 2.77\text{m}$, no false alarms) | **PASS** |
| **EC-03** | Excessive Velocity Anomaly | $v_r = 9.5\text{ m/s}$ (Rated max: $2.5\text{ m/s}$) | `UNSAFE` + Warning | `UNSAFE` + Input Validation Anomaly Flag | **PASS** |
| **EC-04** | Negative Velocity Sensor Glitch | $v_h = -1.5\text{ m/s}$ (Telemetry corruption) | Sanitized + Flagged | $v_h$ clamped to $0\text{ m/s}$ + Validation Error | **PASS** |
| **EC-05** | Out-of-Bounds Coordinate Overflow | Human at $(x = 125\text{m}, y = 110\text{m})$ | Boundary Flag | Boundary breach detected & coordinates clipped | **PASS** |
| **EC-06** | Excessive Safety Margin Buffer | $M_{\text{safety}} = 15.0\text{ m}$ | `WARNING` | Conservative zone expansion across corridor | **PASS** |

---

## Detailed Failure Mode Dossiers

### Case 1: Coincident Initial Starting Point (Singularity Prevention)
* **Input**: Robot at $(50, 50)$, Human at $(50, 50)$. Separation distance $= 0.00\text{ m}$.
* **Potential Failure Risk**: Division by zero in unit vector normalization ($\vec{n} = \Delta \vec{p} / \|\Delta \vec{p}\|$); failure to trigger instantaneous emergency stop.
* **Handling Method**:
  ```typescript
  if (dist < 0.001) {
    return { isApproaching: true, approachVelocity: robot.currentSpeed + human.currentSpeed, angleMultiplier: 1.5 };
  }
  if (distance <= rules.emergencyThreshold || (robot.position.x === human.position.x && robot.position.y === human.position.y)) {
    riskLevel = 'EMERGENCY';
  }
  ```
* **Observed Result**: Instantaneous transition to `EMERGENCY`. Emergency stop banner triggered.
* **Pass / Fail**: **PASS**

---

### Case 2: Stationary AMR (Zero Velocity Handling)
* **Input**: Robot parked at docking node ($v_r = 0.0\text{ m/s}$), Technician walking past at $D = 6.0\text{m}$ ($v_h = 1.2\text{ m/s}$).
* **Potential Failure Risk**: Dynamic equation inflating buffer when robot is completely static, causing false production alarms.
* **Handling Method**:
  The robot movement component evaluates to $v_r \cdot t_{\text{stop}} \cdot w_r = 0.0\text{m}$, reducing the required dynamic envelope to base clearance ($2.77\text{m}$).
* **Observed Result**: Risk state remains `SAFE`. No false alarm.
* **Pass / Fail**: **PASS**

---

### Case 3: Excessive / Out-of-Bounds Velocity Telemetry Anomaly
* **Input**: Sensor failure reports $v_r = 9.5\text{ m/s}$ for a machine rated at max $2.5\text{ m/s}$.
* **Potential Failure Risk**: Unrealistic safety boundary expansion or simulation crash.
* **Handling Method**:
  `validateSafetyParameters()` flags: `"Robot speed (9.5 m/s) severely exceeds max rating (2.5 m/s)"`. State correctly evaluated as `UNSAFE` while warning UI displays input anomaly alert.
* **Pass / Fail**: **PASS**

---

### Case 4: Negative Speed Sensor Glitch
* **Input**: Telemetry transmission error reporting $v_h = -1.5\text{ m/s}$.
* **Potential Failure Risk**: Negative velocity subtracting from the dynamic distance requirement, dangerously reducing safety boundaries.
* **Handling Method**:
  ```typescript
  const humanComp = Math.max(0, human.currentSpeed * human.reactionTime * rules.humanSpeedWeight);
  ```
  Negative values are clamped to zero in kinematics and `validateSafetyParameters()` generates an error: `"Human speed cannot be negative"`.
* **Pass / Fail**: **PASS**

---

### Case 5: Out-of-Bounds Spatial Coordinates
* **Input**: Human placed at $(125\text{m}, 110\text{m})$ in a $100\text{m} \times 100\text{m}$ plant layout.
* **Potential Failure Risk**: Entities rendering outside canvas bounds and corrupting spatial collision math.
* **Handling Method**:
  Canvas coordinate transformer clamps positions to $[0, 100]\text{m}$ and warns the operator that the worker has exited physical unit boundaries.
* **Pass / Fail**: **PASS**

---

### Case 6: Extremely High Safety Margin
* **Input**: User configures $M_{\text{safety}} = 15.0\text{m}$.
* **Potential Failure Risk**: Math overflow or excessive restriction causing system deadlock.
* **Handling Method**:
  Model gracefully adds the 15.0m buffer, resulting in conservative warning states across wider separation.
* **Pass / Fail**: **PASS**
