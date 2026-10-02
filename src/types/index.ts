// Dynamic Human-Robot Safety-Zone Simulator Data Models
// Review 2 Phase 2: Multi-Agent Simulation & Environmental Physics

export type RiskLevel = 'SAFE' | 'WARNING' | 'UNSAFE' | 'EMERGENCY';

export type RobotState = 'IDLE' | 'MOVING' | 'PAUSED' | 'WARNING' | 'EMERGENCY_STOP';

export type HumanState = 'WORKING' | 'WALKING' | 'IDLE' | 'WARNING' | 'EVACUATING';

export type HumanTaskType = 
  | 'Inspection' 
  | 'Maintenance' 
  | 'Material handling' 
  | 'Quality checking' 
  | 'Equipment monitoring' 
  | 'Cleaning';

export interface Point2D {
  x: number;
  y: number;
}

export interface PlantObject {
  id: string;
  name: string;
  type: 'robot_station' | 'workstation' | 'equipment' | 'restricted_zone' | 'obstacle';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  description?: string;
  restrictedReason?: string;
}

export interface PlantLayout {
  id: string;
  name: string;
  width: number; // e.g. 100 meters
  height: number; // e.g. 100 meters
  gridSize: number; // e.g. 5 meters
  objects: PlantObject[];
}

export interface PathWaypoint extends Point2D {
  dwellTime?: number;
  speedMultiplier?: number;
  action?: string;
}

export interface RobotEntity {
  id: string;
  name: string;
  type: string;
  position: Point2D;
  targetPosition?: Point2D;
  currentSpeed: number; // m/s
  maxSpeed: number; // m/s
  direction: number; // angle in radians
  status: RobotState;
  path: PathWaypoint[];
  currentWaypointIndex: number;
  stoppingTime: number; // seconds
  baseRadius: number; // physical footprint radius in meters
  isActive?: boolean;
}

export interface HumanEntity {
  id: string;
  name: string;
  position: Point2D;
  targetPosition?: Point2D;
  currentSpeed: number; // m/s
  expectedSpeed: number; // m/s
  direction: number;
  task: HumanTaskType;
  status: HumanState;
  path: PathWaypoint[];
  currentWaypointIndex: number;
  reactionTime: number; // seconds
  isActive?: boolean;
}

export interface SafetyRuleConfig {
  baseDistance: number; // Base physical clearance (m)
  robotSpeedWeight: number; // Scaling factor for robot speed component
  humanSpeedWeight: number; // Scaling factor for human speed component
  reactionTimeFactor: number; // Multiplier for reaction distance
  safetyMargin: number; // Engineering safety margin buffer (m)
  emergencyThreshold: number; // Distance below which immediate EMERGENCY triggers (m)
  taskMultipliers: Record<HumanTaskType, number>;
  useDirectionalFactor: boolean; // Expand zone in the direction of velocity vector
  staticBaselineDistance: number; // Static baseline zone for comparative analysis (m)
}

export type FloorConditionType =
  | 'DRY_CLEAN'
  | 'WET_WASHDOWN'
  | 'OIL_CHEMICAL_SLICK'
  | 'COLD_FROST';

export interface EnvironmentalContext {
  temperature: number; // Celsius (°C), nominal: 25°C
  pressure: number; // Atmospheric pressure (bar), nominal: 1.013 bar
  floorCondition: FloorConditionType;
  frictionCoefficient: number; // Dimensionless (0.15 to 1.0), nominal: 1.0
  sensorDegradationFactor: number; // Dimensionless (0.0 to 0.70), nominal: 0.0
  ambientNotes?: string;
}

export interface SafetyEvaluation {
  currentDistance: number;
  requiredDynamicDistance: number;
  staticBaselineDistance: number;
  safetyMarginRemaining: number;
  riskLevel: RiskLevel;
  baselineRiskLevel: RiskLevel;
  explanation: string;
  breakdown: {
    baseDistance: number;
    robotMovementComponent: number;
    humanMovementComponent: number;
    reactionComponent: number;
    taskFactor: number;
    safetyMargin: number;
    frictionCoefficient?: number;
    ambientMultiplier?: number;
    sensorDegradationFactor?: number;
    nominalRequiredDistance?: number;
    environmentalIncrease?: number;
  };
  relativeVelocity: number;
  isApproaching: boolean;
  timestamp: number;
}

export type PairType = 'ROBOT_HUMAN' | 'ROBOT_ROBOT' | 'HUMAN_HUMAN';

export interface PairwiseEvaluation {
  id: string; // e.g. 'R1-H1', 'R1-R2', 'H1-H2'
  pairType: PairType;
  entityAId: string;
  entityAName: string;
  entityAType: 'robot' | 'human';
  entityBId: string;
  entityBName: string;
  entityBType: 'robot' | 'human';
  currentDistance: number;
  requiredDynamicDistance: number;
  safetyMarginRemaining: number;
  riskLevel: RiskLevel;
  isApproaching: boolean;
  explanation: string;
  breakdown?: {
    baseDistance?: number;
    brakingComponent?: number;
    reactionComponent?: number;
    frictionCoefficient?: number;
    ambientMultiplier?: number;
    sensorDegradationFactor?: number;
  };
}

export interface MultiAgentEvaluationResult {
  overallRiskLevel: RiskLevel;
  highestThreatPair: PairwiseEvaluation | null;
  minimumMarginRemaining: number;
  activeRobotsCount: number;
  activeHumansCount: number;
  totalPairsEvaluated: number;
  pairwiseEvaluations: PairwiseEvaluation[];
  evaluationTimeMs: number;
  overallEvaluation: SafetyEvaluation; // Canonical single-agent evaluation representation
}

export interface SafetyEvent {
  id: string;
  timestamp: number;
  simulationTime: number;
  scenarioId: string;
  scenarioName: string;
  riskLevel: RiskLevel;
  distance: number;
  requiredDistance: number;
  robotSpeed: number;
  humanSpeed: number;
  humanTask: HumanTaskType;
  message: string;
}

export interface TelemetrySample {
  time: number;
  robotX: number;
  robotY: number;
  humanX: number;
  humanY: number;
  robotSpeed: number;
  humanSpeed: number;
  distance: number;
  requiredDistance: number;
  staticBaselineDistance: number;
  safetyMargin: number;
  riskLevel: RiskLevel;
  baselineRiskLevel: RiskLevel;
  frictionCoefficient?: number;
  temperature?: number;
  sensorDegradation?: number;
}

export interface SimulationRunSummary {
  scenarioId: string;
  scenarioName: string;
  robotName: string;
  humanName: string;
  duration: number;
  minDistance: number;
  minSafetyMargin: number;
  firstWarningTime: number | null;
  firstUnsafeTime: number | null;
  totalWarningDuration: number;
  totalUnsafeDuration: number;
  maxRiskLevel: RiskLevel;
  eventCount: number;
  events: SafetyEvent[];
  baselineTimeInZone: number;
  dynamicTimeInZone: number;
  unnecessaryRestrictionsAvoidedDuration: number;
  environmentalContext?: EnvironmentalContext;
  multiAgentSummary?: {
    totalRobots: number;
    totalHumans: number;
    totalPairsEvaluated: number;
    highestThreatPairId: string;
    meanEvaluationTimeMicroseconds: number;
  };
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  expectedOutcome: RiskLevel;
  initialRobot: RobotEntity;
  initialHuman: HumanEntity;
  robots?: RobotEntity[]; // Multi-agent robot list (>= 2 AMRs)
  humans?: HumanEntity[]; // Multi-agent human list (>= 2 humans)
  environment?: EnvironmentalContext;
  safetyRules: SafetyRuleConfig;
  duration: number; // total duration in simulation seconds
}

export interface ExperimentRecord {
  id: string;
  timestamp: string;
  scenarioId: string;
  scenarioName: string;
  config: {
    robotSpeed: number;
    humanSpeed: number;
    reactionTime: number;
    stoppingTime: number;
    safetyMargin: number;
    baseDistance: number;
    humanTask: HumanTaskType;
    useDirectionalFactor: boolean;
    staticBaselineDistance: number;
    environmentalContext?: EnvironmentalContext;
  };
  summary: SimulationRunSummary;
}

export interface ExperimentSummary {
  scenarioId: string;
  scenarioName: string;
  initialRobotSpeed: number;
  initialHumanSpeed: number;
  minDistance: number;
  maxRequiredDistance: number;
  firstWarningTime: number | null;
  firstUnsafeTime: number | null;
  violationCount: number;
  maxRiskLevel: RiskLevel;
  finalDecision: RiskLevel;
  dynamicUnnecessaryStopsAvoided: number;
  baselineViolations: number;
  timestamp: string;
  environmentalCondition?: string;
  isMultiAgent?: boolean;
}

export interface SensitivityDataPoint {
  parameterValue: number;
  requiredDistance: number;
  minDistance: number;
  riskLevel: RiskLevel;
  unsafeTime: number | null;
  unsafeDuration: number;
  changeFromNominal?: number;
}

export interface DecisionTransition {
  fromState: RiskLevel;
  toState: RiskLevel;
  fromValue: number;
  toValue: number;
  description: string;
}

export interface FieldObservation {
  id: string;
  timestamp: string;
  scenarioId?: string;
  location?: string;
  locationArea?: string;
  robotId?: string;
  robotSpeed?: number;
  robotSpeedObserved?: number;
  humanTask?: string;
  taskObserved?: HumanTaskType;
  humanSpeed?: number;
  observedProximity?: number;
  humanDistanceEstimated?: number;
  safetyCondition?: string;
  riskRating?: 'Low' | 'Medium' | 'High' | 'Critical';
  capturedBy?: string;
  observerName?: string;
  role?: string;
  environmentCondition?: string;
  synced?: boolean;
  notes: string;
}

export interface AppStats {
  totalSimulationsRun: number;
  totalViolationsLogged: number;
  averageSafetyMargin: number;
  scenariosTested: number;
  lastUpdated: string;
}

export type NavPage = 
  | 'dashboard' 
  | 'simulator' 
  | 'layout' 
  | 'scenarios' 
  | 'safety_rules' 
  | 'experiments' 
  | 'sensitivity' 
  | 'failure_cases' 
  | 'data_capture' 
  | 'stakeholder_feedback' 
  | 'settings';

export type StakeholderRole = 
  | 'EHS_MANAGER' 
  | 'PLANT_OPERATOR' 
  | 'MAINTENANCE_ENGINEER' 
  | 'OTHER';

export type LikertScore = 1 | 2 | 3 | 4 | 5;

export interface StakeholderLikertResponses {
  q1_clarity: number;
  q2_warning_reasons: number;
  q3_environmental_controls: number;
  q4_multi_agent_threat: number;
  q5_static_vs_dynamic: number;
  q6_ui_usability: number;
  q7_process_plant_usefulness: number;
  q8_configurability: number;
  q9_bilingual_support: number;
  q10_overall_utility: number;
}

export interface StakeholderQualitativeFeedback {
  easyToUnderstand?: string;
  difficultToUnderstand?: string;
  mostUsefulFeature?: string;
  featureNeedingImprovement?: string;
  additionalInfoNeeded?: string;
  additionalComments?: string;
}

export interface StakeholderEvaluation {
  id: string;
  timestamp: string;
  role: StakeholderRole;
  roleOtherText?: string;
  scenarioEvaluated?: string;
  simulationMode?: 'SINGLE_AGENT' | 'MULTI_AGENT';
  environmentalCondition?: string;
  durationSeconds?: number;
  likertScores: StakeholderLikertResponses;
  qualitative: StakeholderQualitativeFeedback;
  isComplete: boolean;
}

export interface StakeholderValidationSummary {
  status: 'PENDING_ACTUAL_TRIALS' | 'IN_PROGRESS' | 'RESPONSES_AVAILABLE';
  totalResponses: number;
  completedEvaluations: number;
  roleDistribution: Record<StakeholderRole, number>;
  averageScores?: Record<keyof StakeholderLikertResponses, number>;
  overallAverageScore?: number;
}
