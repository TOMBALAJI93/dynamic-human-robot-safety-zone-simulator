// Dynamic Human-Robot Safety-Zone Simulator Data Models

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
  };
  relativeVelocity: number;
  isApproaching: boolean;
  timestamp: number;
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
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  expectedOutcome: RiskLevel;
  initialRobot: RobotEntity;
  initialHuman: HumanEntity;
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
}

export interface SensitivityDataPoint {
  parameterValue: number;
  requiredDistance: number;
  minDistance: number;
  riskLevel: RiskLevel;
  unsafeTime: number | null;
  unsafeDuration: number;
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
  scenarioId: string;
  timestamp: string;
  location: string;
  robotId: string;
  humanTask: HumanTaskType;
  robotSpeed: number;
  humanSpeed: number;
  observedProximity: number;
  safetyCondition: RiskLevel;
  notes: string;
  capturedBy?: string;
  synced?: boolean;
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
  | 'settings';
