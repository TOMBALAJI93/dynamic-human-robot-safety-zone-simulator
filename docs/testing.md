# Unit & System Testing Technical Documentation

## 1. Testing Framework & Philosophy

The test harness uses a deterministic, zero-dependency, automated TypeScript test suite (`scripts/runTests.ts`) executed directly via `npx tsx scripts/runTests.ts` or `npm test`.

### Test Architecture:
Every automated test strictly enforces:
$$\text{INPUT CONDITION} \longrightarrow \text{SAFETY ENGINE / MODULE} \longrightarrow \text{ASSERTION} \longrightarrow \text{PASS / FAIL}$$

* **Zero Flakiness**: All test vectors are mathematically deterministic and run in $< 1.0\text{ s}$.
* **Zero Fabrication**: No simulated metrics are generated from fake or random assertions.
* **Regression Protection**: Ensures Review 1 baseline ($34.3/35$), Review 2 Phase 1 environmental models, and Review 2 Phase 2 multi-agent swarms remain 100% intact.

---

## 2. 32-Test Automated Verification Matrix

Covering safety, physics, multi-agent, stakeholder, and error-handling behaviour.

### Category A: Environmental Safety Engine Tests (ENV-01 to ENV-08)
| Test ID | Module | Input / Test Condition | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ENV-01** | `safetyEngine.ts` | Nominal baseline: $T=25^\circ\text{C}, P=1.013\text{ bar}, \mu=1.00, \eta=0.00$ | $D_{\text{required}}$ equals exact Review 1 baseline ($5.92\text{ m}$) | Exactly $5.92\text{ m}$ ($Delta = 0.00\text{ m}$) | **PASS** |
| **ENV-02** | `safetyEngine.ts` | Wet washdown floor ($\mu=0.65$) | $D_{\text{required}}$ expands due to $1/\mu$ braking penalty | Expands to $7.15\text{ m}$ ($+1.23\text{ m}$) | **PASS** |
| **ENV-03** | `safetyEngine.ts` | Oil slick leakage ($\mu=0.35$) | $D_{\text{required}}$ expands monotonically further than wet floor | Expands to $9.42\text{ m}$ ($+3.50\text{ m}$) | **PASS** |
| **ENV-04** | `safetyEngine.ts` | Degraded zero-friction input ($\mu=0.0$) | Friction clamped strictly to physical bound $\mu \ge 0.15$ | Clamped to $0.15$ without $\infty$ or crash | **PASS** |
| **ENV-05** | `safetyEngine.ts` | High ambient temperature ($T=45^\circ\text{C}$) | $\lambda_{\text{ambient}}$ scales reaction buffer by $+20\%$ | Distance increases to $6.25\text{ m}$ | **PASS** |
| **ENV-06** | `safetyEngine.ts` | Optical sensor haze degradation ($\eta=0.40$) | Perception uncertainty cushion $C_{\text{env}}$ expands envelope | Distance increases to $7.04\text{ m}$ | **PASS** |
| **ENV-07** | `safetyEngine.ts` | Sensor degradation overflow input ($\eta=1.50$) | Noise parameter clamped strictly to maximum $\eta \le 0.70$ | Clamped to $0.70$ safely | **PASS** |
| **ENV-08** | `safetyEngine.ts` | High barometric pressure ($P=2.50\text{ bar}$) | Accommodated safely in $\lambda_{\text{ambient}}$ formulation | Valid numerical distance computed | **PASS** |

### Category B: Multi-Agent Swarm Tests (MULTI-01 to MULTI-10)
| Test ID | Module | Input / Test Condition | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **MULTI-01** | `safetyEngine.ts` | Two AMRs ($R_1, R_2$) moving towards each other | Evaluates combined braking $D_{\text{required,RR}}$ with $1/\mu$ | Combined braking distance evaluated | **PASS** |
| **MULTI-02** | `safetyEngine.ts` | Two human workers ($H_1, H_2$) in shared aisle | Evaluates walking reaction buffer $D_{\text{required,HH}}$ | Inter-worker buffer evaluated | **PASS** |
| **MULTI-03** | `safetyEngine.ts` | 2 AMRs + 2 Workers swarm | Evaluates all $K = 2\cdot 2 + 1 + 1 = 6$ active pairs | 6 pairwise evaluations produced | **PASS** |
| **MULTI-04** | `safetyEngine.ts` | Multiple pairs with `EMERGENCY` and `UNSAFE` states | Arbiter selects `EMERGENCY` tier, tie-broken by margin | Correct critical threat identified | **PASS** |
| **MULTI-05** | `safetyEngine.ts` | Coincident entities ($D_{\text{sep}} = 0.0\text{ m}$) | Triggers `EMERGENCY`; handles $0/0$ direction vector safely | 0.0m handled without `NaN` | **PASS** |
| **MULTI-06** | `safetyEngine.ts` | Swarm with `isActive: false` entities | Inactive entities excluded from pairwise combinatorial matrix | Only active entities evaluated | **PASS** |
| **MULTI-07** | `safetyEngine.ts` | Entity coordinates outside grid boundary ($x=-50, y=150$) | Distance computed safely without memory fault or UI crash | Valid evaluation returned | **PASS** |
| **MULTI-08** | `safetyEngine.ts` | Wet floor ($\mu=0.65$) on Robot-Robot interaction | Robot-Robot required distance expands vs dry floor | Distance expands from $5.2\text{ m}$ to $7.1\text{ m}$ | **PASS** |
| **MULTI-09** | `scenarioData.ts` | 18 Edge Cases suite (12 Single-Agent + 6 Multi-Agent) | 100% of scenarios match expected safety outcome | $18 / 18$ edge cases passed | **PASS** |
| **MULTI-10** | `safetyEngine.ts` | 1,000 Monte Carlo randomized multi-agent swarms | Robustness check: zero `NaN`, zero crashes, 100% valid | $100\%$ valid across $2,400+$ pairs | **PASS** |

### Category C: REVIEW 3 FINAL VERIFICATION — STAKEHOLDER MODULE TESTS (STAKE-01 to STAKE-08)
| Test ID | Module | Input / Test Condition | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **STAKE-01** | `storageService.ts` | Empty evaluation array (`[]`) | Returns `PENDING_ACTUAL_TRIALS` with 0 responses and no fake averages | Status: `PENDING_ACTUAL_TRIALS`, 0 avg | **PASS** |
| **STAKE-02** | `storageService.ts` | Single completed 10-question evaluation ($Avg=4.60$) | Returns `RESPONSES_AVAILABLE` and exact unweighted average | Overall average: $4.60 / 5.00$ | **PASS** |
| **STAKE-03** | `storageService.ts` | Multiple evaluations across EHS and Operator roles | Correct role distribution count and aggregated mean score | EHS: 1, Operator: 1, Mean: $4.30$ | **PASS** |
| **STAKE-04** | `storageService.ts` | Incomplete evaluation (partial Likert answers) | Flags `isComplete: false`; does not distort complete averages | Status: `IN_PROGRESS`, 0 complete | **PASS** |
| **STAKE-05** | `storageService.ts` | CSV Export of stakeholder records | Produces RFC 4180 compliant CSV with headers and escaped fields | Valid multi-row CSV generated | **PASS** |
| **STAKE-06** | `storageService.ts` | JSON Export of stakeholder records | Produces valid parseable JSON array matching schema | Valid JSON parsed successfully | **PASS** |
| **STAKE-07** | `translations.ts` | English localization dictionary (`en.stakeholder`) | All 10 questions and 4 role titles non-empty | Complete English dictionary | **PASS** |
| **STAKE-08** | `translations.ts` | Tamil localization dictionary (`ta.stakeholder`) | All 10 questions and 4 role titles non-empty | Complete Tamil dictionary | **PASS** |

### Category D: REVIEW 3 FINAL VERIFICATION — MOTION & PHYSICS TESTS (PHYS-01 to PHYS-03)
| Test ID | Module | Input / Test Condition | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PHYS-01** | `motionEngine.ts` | Entity at $(10, 10)$ with speed $2.0\text{ m/s}$, waypoint $(20, 10)$, $dt=1.0\text{ s}$ | Advances by $2.0\text{ m}$ to $(12.00, 10.00)$ | Position: $(12.00, 10.00)$ | **PASS** |
| **PHYS-02** | `motionEngine.ts` | Empty path (`[]`) and index overflow ($index=99$) | Retains current position safely with `reachedEnd: true` | Handled safely without crash | **PASS** |
| **PHYS-03** | `motionEngine.ts` | Synchronous multi-agent swarm step ($dt=0.5\text{ s}$) | Advances active agents while keeping IDLE robots stationary | Active agents advance; IDLE held | **PASS** |

### Category E: REVIEW 3 FINAL VERIFICATION — ERROR HANDLING & ROBUSTNESS TESTS (ERR-01 to ERR-03)
| Test ID | Module | Input / Test Condition | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ERR-01** | `storageService.ts` | Corrupted evaluation entry containing `NaN` scores | Sanitizes corrupt values without throwing exception or `NaN` avg | Valid numerical average computed | **PASS** |
| **ERR-02** | `storageService.ts` | Qualitative feedback with quotes, commas, and formulas | Encapsulates quotes (`""`) and commas per RFC 4180 standard | Escaped CSV output verified | **PASS** |
| **ERR-03** | `safetyEngine.ts` | Euclidean distance with `NaN` or `null` point | Returns safe default clearance ($10.0\text{ m}$) without NaN | Returned $10.0\text{ m}$ fallback | **PASS** |

---

## 3. How to Reproduce All Tests

To execute the entire 32-test suite locally:

```bash
# Standard automated test runner
npm test

# Direct TypeScript execution
npx tsx scripts/runTests.ts
```

**Output Verification**:
```text
================================================================
FINAL TEST SUMMARY: 32/32 PASSED (100% SUCCESS)
================================================================
```
