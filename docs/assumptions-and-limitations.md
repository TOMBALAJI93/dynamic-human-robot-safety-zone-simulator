# Assumptions and System Limitations

## 1. Multi-Agent Kinematic & Arbitration Assumptions

1. **Pairwise Geometric Independence**:
   * Interactions between $N$ robots and $M$ humans are computed as pairwise combinations ($K = NM + \binom{N}{2} + \binom{M}{2}$). Three-body simultaneous contact dynamics are approximated via the highest-threat envelope bounding rule.

2. **Homogeneous Floor Friction Field**:
   * In the current model, floor friction coefficient $\mu_{\text{floor}}$ is assumed uniform across the active sector. Micro-patches of oil or moisture within a single grid cell are treated via sector-wide lower-bound friction clamping ($0.15 \le \mu \le 1.00$).

3. **Centralized Arbitrated Perception**:
   * The dynamic zone engine operates as a centralized supervisory safety observer receiving 10Hz odometry and vision inputs from all active units. Decentralized ad-hoc V2V mesh latency jitter is bounded within the 100ms cycle budget.

---

## 2. Environmental Assumptions

1. **Ambient Air Density Linearization**:
   * Ambient stress multiplier $\lambda_{\text{ambient}}$ models physiological worker fatigue and air turbulence linearly across $10^\circ\text{C} \le T \le 50^\circ\text{C}$ and $0.80 \le P \le 3.00\text{ bar}$.

2. **Sensor Optical Degradation Range**:
   * Haze, mist, and lens coating degradation are modeled as a scalar degradation factor $\eta \in [0.0, 0.70]$. At $\eta > 0.70$, hardware fault protocols mandate emergency plant stop.

---

## 3. Safety Boundary Guarantees

* **Clamping Invariants**: All kinematic and environmental inputs are strictly clamped to non-negative physical bounds ($v \ge 0$, $\mu \ge 0.15$, $\eta \le 0.70$), preventing `NaN`, infinite braking distances, or division-by-zero crashes.
* **Canonical Baseline Identity**: Setting active agents to $N=1, M=1$ and environment to nominal reproduces Review 1 behavior with exact zero-regression parity.
