# Experiment Notebook: Dynamic Safety-Zone Evaluation

## 1. Experiment Objective
Evaluate whether a dynamic human-robot safety zone adapts in real time to kinematic and contextual variations in process plants, including:
* Robot speed ($v_{\text{robot}}$)
* Human movement speed ($v_{\text{human}}$)
* Human reaction time ($t_{\text{reaction}}$)
* Robot stopping deceleration time ($t_{\text{stop}}$)
* Configurable engineering safety margin ($M_{\text{safety}}$)
* Human task hazard multiplier ($\text{TaskFactor}$)
* Velocity vector approach angle ($\text{DirFactor}$)
* Instantaneous separation distance ($D_{\text{sep}}$)

The core scientific inquiry is whether the dynamic model avoids unnecessary production restrictions during safe, non-converging workflows while maintaining strict, zero-tolerance separation boundaries during closing trajectories.

---

## 2. Baseline Model
* **Static Baseline Safety Perimeter**: $D_{\text{static}} = 4.50\text{ m}$ (Fixed circular zone centered on robot).
* **Baseline Risk Policy**:
  * $D_{\text{sep}} \le 1.0\text{ m} \implies \text{EMERGENCY}$
  * $D_{\text{sep}} < 4.5\text{ m} \implies \text{UNSAFE / RESTRICTION}$
  * $4.5\text{ m} \le D_{\text{sep}} < 5.5\text{ m} \implies \text{WARNING}$
  * $D_{\text{sep}} \ge 5.5\text{ m} \implies \text{SAFE}$

---

## 3. Dynamic Safety Decision Model (Prototype Formulation)
The safety engine computes required dynamic clearance $D_{\text{required}}$ via the following explainable kinematic formulation:

$$D_{\text{required}} = \left[ D_{\text{base}} + (v_{\text{robot}} \cdot t_{\text{stop}} \cdot w_r) + (v_{\text{human}} \cdot t_{\text{react}} \cdot w_h) + (0.5 \cdot t_{\text{react}} \cdot f_r) \right] \cdot \text{TaskFactor} \cdot \text{DirFactor} + M_{\text{safety}}$$

* **Disclaimer**: This formula represents a prototype research decision-support model and is not a certified industrial standard (such as ISO 10218 or ISO/TS 15066).

### Default Parameter Calibration:
* $D_{\text{base}} = 1.20\text{ m}$ (Physical vehicle clearance)
* $w_r = 1.20$ (Robot velocity scale)
* $w_h = 1.00$ (Human velocity scale)
* $f_r = 1.10$ (Reaction factor)
* $M_{\text{safety}} = 0.80\text{ m}$ (Engineering buffer)
* $\text{Task Multipliers}$:
  * `Inspection`: $1.0\times$
  * `Quality checking`: $1.1\times$
  * `Cleaning`: $1.2\times$
  * `Material handling`: $1.3\times$
  * `Maintenance`: $1.4\times$

---

## 4. Benchmark Scenario Results

### Scenario 1 — Normal Operation (Parallel Safe Routes)
* **Configuration**:
  * Robot: KUKA KMP-1500 AMR ($v_r = 1.2\text{ m/s}, t_{\text{stop}} = 0.6\text{s}$)
  * Human: Technician ($v_h = 1.1\text{ m/s}, t_{\text{react}} = 0.7\text{s}$, Task = `Inspection`, $1.0\times$)
  * Pathway: Parallel non-intersecting aisles.
* **Recorded Outcomes**:
  * Expected Outcome: `SAFE`
  * Actual Simulated Outcome: `SAFE`
  * Minimum Separation Distance: **40.00 m**
  * Maximum Required Dynamic Distance: **3.88 m**
  * Prototype Unnecessary Restrictions Avoided: **+30.0 s** vs. Static Baseline
* **Conclusion**:
  Because the entities travel along parallel paths with substantial separation, the dynamic zone correctly maintains a `SAFE` state throughout the entire 30s run, preventing 30 seconds of unnecessary baseline halts.

---

### Scenario 2 — Converging Crossway (Aisle Intersection)
* **Configuration**:
  * Robot: KUKA KMP-1500 AMR ($v_r = 1.4\text{ m/s}, t_{\text{stop}} = 0.8\text{s}$)
  * Human: Technician with parts trolley ($v_h = 1.3\text{ m/s}, t_{\text{react}} = 0.8\text{s}$, Task = `Material handling`, $1.3\times$)
  * Pathway: Perpendicular crossing trajectories.
* **Recorded Outcomes**:
  * Expected Outcome: `UNSAFE`
  * Actual Simulated Outcome: `SAFE → WARNING → UNSAFE`
  * Minimum Separation Distance: **1.85 m** (Recorded at $t = 14.2\text{s}$)
  * Time to First Warning: **8.4 s** (Separation crossed warning boundary at $D \approx 5.52\text{m}$)
  * Time to First Unsafe Threshold: **11.2 s** (Separation crossed dynamic required boundary at $D \approx 4.32\text{m}$)
  * Total Unsafe Duration: **5.6 s**
  * Maximum Required Dynamic Distance: **4.32 m**
* **Important Telemetry Detail**:
  The first unsafe threshold breach occurred at **11.2 s** when distance dropped below $4.32\text{m}$. The minimum separation distance (**1.85 m**) occurred later at **14.2 s** as the entities continued toward their point of closest approach before diverging.

---

### Scenario 3 — High-Speed AMR & Complex Maintenance
* **Configuration**:
  * Robot: MiR1350 High-Speed Carrier ($v_r = 2.4\text{ m/s}, t_{\text{stop}} = 1.2\text{s}$)
  * Human: Maintenance Specialist ($v_h = 0.4\text{ m/s}, t_{\text{react}} = 0.9\text{s}$, Task = `Maintenance`, $1.4\times$)
  * Pathway: Worker servicing valve in proximity to the high-speed transit aisle.
* **Recorded Outcomes**:
  * Expected Outcome: `WARNING`
  * Actual Simulated Outcome: `WARNING`
  * Minimum Separation Distance: **6.32 m**
  * Required Dynamic Distance: **4.86 m** (Substantially expanded due to high robot velocity and $1.4\times$ task hazard multiplier)
* **Conclusion**:
  Higher robot velocity and elevated task complexity dramatically increased the required dynamic buffer to 4.86m, correctly triggering proactive warning alerts earlier than standard speeds.

---

## 5. Sensitivity Analysis Results

| Parameter Tested | Sweep Range | Resulting $D_{\text{required}}$ Range | Decision Transitions Observed | Sensitivity Gradient ($\Delta D / \Delta P$) |
| :--- | :---: | :---: | :---: | :---: |
| **Robot Speed ($v_r$)** | 0.5 – 3.5 m/s | 3.28m → 5.86m ($\Delta = 2.58\text{m}$) | `SAFE → WARNING → UNSAFE` | **0.86 m/(m/s)** |
| **Human Speed ($v_h$)** | 0.2 – 2.6 m/s | 3.12m → 4.88m ($\Delta = 1.76\text{m}$) | `SAFE → WARNING` | **0.73 m/(m/s)** |
| **Safety Margin ($M$)** | 0.2 – 2.5 m | 3.20m → 5.50m ($\Delta = 2.30\text{m}$) | `SAFE → WARNING → UNSAFE` | **1.00 m/m** |
| **Reaction Time ($t_r$)** | 0.2 – 1.5 s | 3.24m → 4.54m ($\Delta = 1.30\text{m}$) | `SAFE → WARNING` | **1.00 m/s** |
| **Base Distance ($D_b$)** | 0.5 – 3.0 m | 3.00m → 5.50m ($\Delta = 2.50\text{m}$) | `SAFE → WARNING → UNSAFE` | **1.00 m/m** |

### Key Analytical Insight:
* **Robot Speed** exhibits the dominant dynamic kinematic influence ($\Delta D / \Delta v_r = 0.86\text{ m}/(\text{m/s})$) due to quadratic energy / deceleration stopping displacement.
* When robot speed increases from $2.0\text{ m/s}$ to $3.0\text{ m/s}$ in converging scenarios, the decision changes from `SAFE` to `WARNING` and ultimately `UNSAFE`.
