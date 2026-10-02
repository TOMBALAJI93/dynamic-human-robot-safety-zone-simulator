# Failure Mode and Boundary Edge Case Analysis

## 1. Overview of Evaluated Edge Cases (18 Total)

The test suite validates 12 Single-Agent failure boundaries (EC-01 through EC-12) and 6 Multi-Agent Swarm failure boundaries (MULTI-EC-01 through MULTI-EC-06).

---

## 2. Multi-Agent Failure Modes & Deterministic Handling

| Case ID | Name | Stress Condition | Expected System Response | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MULTI-EC-01** | Coincident Spawn | Two agents starting at the exact same location ($D=0.0\text{ m}$) | Triggers immediate `EMERGENCY`; handles $0/0$ directional vector safely without `NaN` | **PASSED** |
| **MULTI-EC-02** | Four-Agent Coincident Singularity | Four agents occupying the same position ($D=0.0\text{ m}$) | Evaluates all 6 pairs simultaneously; produces multiple `EMERGENCY` pair evaluations without memory fault | **PASSED** |
| **MULTI-EC-03** | Robot-Robot Direct Head-On | Two robots moving head-on toward each other at high velocity | Combined braking stopping distance scaled by $1/\mu_{\text{floor}}$; correctly detects and escalates the Robot-Robot threat | **PASSED** |
| **MULTI-EC-04** | Robot Surrounded by Multiple Humans | One robot surrounded by multiple workers at varying distances | All relevant Robot-Human pairs evaluated concurrently; highest threat correctly selected by risk tier and margin | **PASSED** |
| **MULTI-EC-05** | Active / Inactive Agent Handling | Swarm with mixed active and inactive robots and workers | Inactive entities are safely filtered out; pairwise matrix evaluates only active agents | **PASSED** |
| **MULTI-EC-06** | Out-of-Bounds Agent Handling | Robot coordinates placed outside the $100\text{m}\times 100\text{m}$ plant boundary | Evaluates separation safely without overflow, divide-by-zero, or application crash | **PASSED** |

---

## 3. Robustness & Monte Carlo Stress Testing

* **10,000 Randomized Swarm Trials**:
  * Evaluated $10,000$ multi-agent trials with randomized positions $(x, y) \in [-20, 120]$, velocities $v \in [0, 5]$, friction $\mu \in [0.15, 1.0]$, and noise $\eta \in [0, 0.70]$.
  * **Zero crashes**, **zero `NaN` distances**, and **$100\%$ valid state transitions**.
