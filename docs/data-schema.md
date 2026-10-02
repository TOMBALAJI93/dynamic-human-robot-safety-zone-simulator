# Data Schemas, Storage Architecture & Service Interfaces

## 1. Architectural Clarification: Client-Side Prototype

> [!IMPORTANT]
> **No External Backend or Database**:
> * The current application is a client-side React/TypeScript prototype. It does not use a remote REST API or external SQL database.
> * **No external HTTP REST/GraphQL API** or remote backend server is required.
> * **No external SQL/NoSQL database** is used.
> * All simulation states, layout definitions, telemetry records, and stakeholder evaluation responses are persisted locally using the standard **Web Storage API (`localStorage`)**.

---

## 2. Browser LocalStorage Schema

The application uses namespaced versioned keys to avoid collisions:

| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `safety_simulator_stakeholder_evals_v2` | `StakeholderEvaluation[]` | Array of evaluator responses submitted via the Stakeholder Feedback page. |
| `safety_simulator_field_obs_v2` | `FieldObservation[]` | Proximity observations recorded during plant walkthroughs. |
| `safety_simulator_exp_history_v2` | `ExperimentRecord[]` | History of executed simulation benchmark runs. |
| `safety_simulator_plant_layout_v2` | `PlantLayout` | Custom user-modified equipment layout coordinates. |
| `safety_simulator_safety_rules_v2` | `SafetyRuleConfig` | Custom safety weight calibration settings. |
| `safety_simulator_environment_v2` | `EnvironmentalContext` | Active environmental physics parameters ($T, P, \mu, \eta$). |
| `safety_simulator_language_v2` | `'en' | 'ta'` | User interface display language preference. |

---

## 3. Stakeholder Evaluation Data Structure

### TypeScript Interface:
```typescript
export type StakeholderRole = 
  | 'EHS_MANAGER' 
  | 'PLANT_OPERATOR' 
  | 'MAINTENANCE_ENGINEER' 
  | 'OTHER';

export interface StakeholderLikertResponses {
  q1_clarity: number;                  // 1-5 Likert: Dynamic safety explanation
  q2_warning_reasons: number;          // 1-5 Likert: Warning cause clarity
  q3_environmental_controls: number;   // 1-5 Likert: Environmental controls utility
  q4_multi_agent_threat: number;       // 1-5 Likert: Multi-agent threat arbitration
  q5_static_vs_dynamic: number;        // 1-5 Likert: Dynamic vs static distinction
  q6_ui_usability: number;             // 1-5 Likert: Interface usability
  q7_process_plant_usefulness: number; // 1-5 Likert: Process plant practical utility
  q8_configurability: number;          // 1-5 Likert: Parameter configurability
  q9_bilingual_support: number;        // 1-5 Likert: English/Tamil support
  q10_overall_utility: number;         // 1-5 Likert: Academic prototype usefulness
}

export interface StakeholderQualitativeFeedback {
  easyToUnderstand?: string;           // Features easily understood
  difficultToUnderstand?: string;      // Features difficult to grasp
  mostUsefulFeature?: string;          // Most valuable simulator tool
  featureNeedingImprovement?: string;  // Areas needing refinement
  additionalInfoNeeded?: string;       // Missing information
  additionalComments?: string;         // Open engineering recommendations
}

export interface StakeholderEvaluation {
  id: string;                          // Unique UUID (e.g., 'eval-171829381-x9a2')
  timestamp: string;                   // ISO 8601 UTC timestamp
  role: StakeholderRole;               // Selected persona
  roleOtherText?: string;              // Custom title if role === 'OTHER'
  scenarioEvaluated?: string;          // Evaluated scenario ID
  simulationMode?: 'SINGLE_AGENT' | 'MULTI_AGENT';
  environmentalCondition?: string;     // Active floor/thermal condition
  durationSeconds?: number;            // Session duration in seconds
  likertScores: StakeholderLikertResponses;
  qualitative: StakeholderQualitativeFeedback;
  isComplete: boolean;                 // True if all 10 Likert questions answered
}
```

---

## 4. Export Schemas (CSV & JSON)

### 4.1 Stakeholder CSV Schema (RFC 4180 Compliant)
```csv
Evaluation_ID,Timestamp,Role,Role_Custom,Scenario,Simulation_Mode,Environment_Condition,Duration_Seconds,Is_Complete,Q1_Clarity,Q2_Warning_Reasons,Q3_Environmental_Controls,Q4_Multi_Agent_Threat,Q5_Static_vs_Dynamic,Q6_UI_Usability,Q7_Plant_Usefulness,Q8_Configurability,Q9_Bilingual_Support,Q10_Overall_Utility,Easy_To_Understand,Difficult_To_Understand,Most_Useful_Feature,Feature_Needing_Improvement,Additional_Info_Needed,Additional_Comments
```

### 4.2 Multi-Agent Experiments Benchmark CSV Schema
```csv
ScenarioId,ScenarioName,Friction_mu,Temp_C,SensorDeg_eta,TotalRobots,TotalHumans,TotalPairs,MinSeparation_m,MaxRequired_m,HighestThreatPair,PeakRiskLevel,FirstWarningTime_s,FirstUnsafeTime_s,UnsafeDuration_s,MeanEvalLatency_us,MaxEvalLatency_us
```

---

## 5. Internal Application Service Interfaces

While there are no network HTTP APIs, the application exposes modular client-side service interfaces in `src/services/` and `src/engine/`:

### 1. `storageService` Interface
* `getStakeholderEvaluations(): StakeholderEvaluation[]`
* `saveStakeholderEvaluation(evaluation: StakeholderEvaluation): boolean`
* `clearStakeholderEvaluations(): void`
* `getStakeholderSummary(): StakeholderValidationSummary`
* `exportStakeholderToCSV(): string`
* `exportStakeholderToJSON(): string`

### 2. `safetyEngine` Interface
* `calculateDynamicSafetyDistance(rules, robot, human, env): { requiredDistance, breakdown }`
* `calculateRobotRobotSafetyDistance(rules, robotA, robotB, env): { requiredDistance, breakdown }`
* `calculateHumanHumanSafetyDistance(rules, humanA, humanB, env): { requiredDistance, breakdown }`
* `evaluateMultiAgentSafetyState(rules, robots, humans, env): MultiAgentEvaluationResult`
