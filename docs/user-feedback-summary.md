# Stakeholder Feedback & Usability Evaluation Summary

## Validation Status: PENDING ACTUAL TRIALS

> [!IMPORTANT]
> **Data Integrity Guarantee**: Actual stakeholder field validation is pending. **Zero synthetic or fabricated stakeholder responses are represented as real feedback.** The in-app evaluation system is fully implemented and operational in `src/pages/StakeholderFeedbackPage.tsx`, waiting for authentic evaluator submissions.

---

## 1. Evaluation Purpose & Objective

The Stakeholder Evaluation module provides a structured evaluation framework for domain specialists to evaluate:
1. **Explainability**: Clarity of dynamic required safety zone calculations vs static fixed circles.
2. **Environmental Adaptation**: Comprehensibility and operational utility of floor friction ($\mu$), ambient temperature ($T$), pressure ($P$), and optical sensor degradation ($\eta$).
3. **Multi-Agent Threat Arbitration**: Visual clarity of swarm multi-agent safety zones and real-time highest-threat pairwise arbitration.
4. **Bilingual Usability**: Effectiveness of English and Tamil localization across engineering metrics and alerts.
5. **Industrial Decision Support**: Practical utility of the simulator as an academic and decision-support prototype.

---

## 2. Target Stakeholder Personas

| Persona Role | Industrial Focus | Key Evaluation Focus Areas |
| :--- | :--- | :--- |
| **Plant Safety Officer / EHS Manager** | Compliance with ISO 13849 & ISO/TS 15066; hazard mitigation. | Highest-threat arbitration matrix, conservative wet-floor stopping distances, emergency threshold guarantees. |
| **Process Plant Operator / Technician** | Real-time plant floor awareness and safe coexistence. | Visual clarity of state transitions (Safe $\to$ Warning $\to$ Unsafe $\to$ Emergency), Tamil terminology clarity. |
| **Automation / AMR Maintenance Engineer** | AGV/AMR kinematic limits and sensor reliability. | Braking stopping time ($t_{\text{stop}}$), optical degradation ($\eta$), and multi-vehicle intersection deconfliction. |
| **Academic / Safety Specialist / Other** | Formal mathematical modeling and verification. | Sensitivity analysis, deterministic reproducibility, and zero-singularity physics boundaries. |

---

## 3. Standardized 10-Point Questionnaire Instrument

Evaluators rate statements using a 5-point Likert scale:
*(1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree)*

* **Q1 (Clarity)**: *"The dynamic safety-zone explanation is clear and understandable."*
* **Q2 (Warning Reasons)**: *"The simulator clearly shows why a safety warning or unsafe state occurs."*
* **Q3 (Environmental Controls)**: *"The environmental controls for temperature, pressure, floor friction, and sensor degradation are understandable and useful."*
* **Q4 (Multi-Agent Threat)**: *"The multi-agent view clearly identifies which robot-human or robot-robot interaction represents the highest threat."*
* **Q5 (Static vs Dynamic)**: *"The simulator demonstrates the difference between static and dynamic safety zones clearly."*
* **Q6 (UI Usability)**: *"The simulator interface is easy to understand and operate."*
* **Q7 (Process Plant Usefulness)**: *"The simulator provides useful information for evaluating process-plant human-robot proximity scenarios."*
* **Q8 (Configurability)**: *"The configurable safety parameters appear useful for plant-specific simulation experiments."*
* **Q9 (Bilingual Usability)**: *"The English/Tamil interface and visual indicators improve usability."*
* **Q10 (Overall Utility)**: *"Overall, the simulator is useful as an academic safety-analysis and decision-support prototype."*

---

## 4. Qualitative Observation Categories

Optional open-text fields capturing domain insights:
1. *What was easy to understand?*
2. *What was difficult to understand?*
3. *Which feature was most useful?*
4. *Which feature needs improvement?*
5. *What additional information would be useful?*
6. *Additional comments or plant-specific recommendations.*

---

## 5. Storage, Validation & Export Architecture

* **Local Offline Storage**: Stored under localStorage key `safety_simulator_stakeholder_evals_v2`.
* **Export Options**: One-click **Export CSV** (RFC 4180 compliant) and **Export JSON** formats for statistical analysis in Python (pandas) or R.
* **Current Response Count**: **0 Real Responses** (State: `PENDING_ACTUAL_TRIALS`).
* **Automated Summary Policy**: Aggregate averages and charts will activate dynamically only when $\ge 1$ genuine evaluation is recorded by an evaluator.

---

## 6. Instructions for Conducting Live Field Trials

1. Navigate to the **Stakeholder Feedback** tab in the top navigation bar.
2. Select the evaluator's professional role.
3. Select the scenario and environmental conditions evaluated during the session.
4. Input ratings for Q1 through Q10 using the accessible 1–5 selector chips.
5. Provide any qualitative notes in the text fields.
6. Click **Submit Evaluation Response**. The response will be permanently persisted and added to the summary table.
7. Click **Export CSV** to archive the session dataset.
