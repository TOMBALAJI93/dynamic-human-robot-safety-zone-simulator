import type { 
  Point2D, 
  RobotEntity, 
  HumanEntity, 
  SafetyRuleConfig, 
  SafetyEvaluation, 
  RiskLevel 
} from '../../types';

/**
 * Standard Euclidian distance between two 2D points (in meters)
 */
export function calculateDistance(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates vector dot product and approach angle to determine if entities are closing in
 */
export function calculateApproachFactor(robot: RobotEntity, human: HumanEntity): { isApproaching: boolean; approachVelocity: number; angleMultiplier: number } {
  const dx = human.position.x - robot.position.x;
  const dy = human.position.y - robot.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.001) {
    return { isApproaching: true, approachVelocity: robot.currentSpeed + human.currentSpeed, angleMultiplier: 1.5 };
  }

  // Normalized separation vector from robot to human
  const nx = dx / dist;
  const ny = dy / dist;

  // Robot velocity vector
  const rvX = Math.cos(robot.direction) * robot.currentSpeed;
  const rvY = Math.sin(robot.direction) * robot.currentSpeed;

  // Human velocity vector
  const hvX = Math.cos(human.direction) * human.currentSpeed;
  const hvY = Math.sin(human.direction) * human.currentSpeed;

  // Relative velocity component along the line connecting them
  const robotTowardHuman = rvX * nx + rvY * ny;
  const humanTowardRobot = -(hvX * nx + hvY * ny);

  const approachVelocity = robotTowardHuman + humanTowardRobot;
  const isApproaching = approachVelocity > 0.05;

  // Angle multiplier expands the safety envelope if human and robot are headed directly toward each other
  let angleMultiplier = 1.0;
  if (isApproaching) {
    angleMultiplier = 1.0 + Math.min(0.5, Math.max(0, approachVelocity / (robot.maxSpeed + 2.0)));
  }

  return { isApproaching, approachVelocity, angleMultiplier };
}

/**
 * Default Safety Rule Configuration
 */
export const DEFAULT_SAFETY_RULES: SafetyRuleConfig = {
  baseDistance: 1.2,
  robotSpeedWeight: 1.2,
  humanSpeedWeight: 1.0,
  reactionTimeFactor: 1.1,
  safetyMargin: 0.8,
  emergencyThreshold: 1.0,
  useDirectionalFactor: true,
  staticBaselineDistance: 4.5,
  taskMultipliers: {
    'Inspection': 1.0,
    'Maintenance': 1.4,
    'Material handling': 1.3,
    'Quality checking': 1.1,
    'Equipment monitoring': 1.0,
    'Cleaning': 1.2,
  },
};

/**
 * Core mathematical calculation of required dynamic safety boundary:
 * D_req = [D_base + (v_r * t_stop * w_r) + (v_h * t_react * w_h)] * TaskFactor * DirFactor + SafetyMargin
 */
export function calculateDynamicSafetyDistance(
  rules: SafetyRuleConfig,
  robot: RobotEntity,
  human: HumanEntity
): { requiredDistance: number; breakdown: SafetyEvaluation['breakdown'] } {
  const base = Math.max(0, rules.baseDistance);
  const robotComp = Math.max(0, robot.currentSpeed * robot.stoppingTime * rules.robotSpeedWeight);
  const humanComp = Math.max(0, human.currentSpeed * human.reactionTime * rules.humanSpeedWeight);
  const reactionComp = Math.max(0, human.reactionTime * rules.reactionTimeFactor * 0.5);
  const taskFactor = rules.taskMultipliers[human.task] || 1.0;
  const margin = Math.max(0, rules.safetyMargin);

  const approach = rules.useDirectionalFactor 
    ? calculateApproachFactor(robot, human).angleMultiplier 
    : 1.0;

  const rawRequired = (base + robotComp + humanComp + reactionComp) * taskFactor * approach + margin;
  const requiredDistance = Math.round(rawRequired * 100) / 100;

  return {
    requiredDistance,
    breakdown: {
      baseDistance: Math.round(base * 100) / 100,
      robotMovementComponent: Math.round(robotComp * 100) / 100,
      humanMovementComponent: Math.round(humanComp * 100) / 100,
      reactionComponent: Math.round(reactionComp * 100) / 100,
      taskFactor: Math.round(taskFactor * 100) / 100,
      safetyMargin: Math.round(margin * 100) / 100,
    }
  };
}

/**
 * Validates whether safety parameters and entity inputs are within physical reasonable limits
 */
export function validateSafetyParameters(
  rules: SafetyRuleConfig,
  robot: RobotEntity,
  human: HumanEntity
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (robot.currentSpeed < 0) errors.push(`Robot speed cannot be negative: ${robot.currentSpeed}`);
  if (robot.maxSpeed <= 0) errors.push(`Robot maximum speed must be > 0: ${robot.maxSpeed}`);
  if (robot.currentSpeed > robot.maxSpeed * 1.5) {
    errors.push(`Robot speed (${robot.currentSpeed} m/s) severely exceeds max rating (${robot.maxSpeed} m/s)`);
  }
  if (human.currentSpeed < 0) errors.push(`Human speed cannot be negative: ${human.currentSpeed}`);
  if (human.currentSpeed > 8.0) {
    errors.push(`Human speed (${human.currentSpeed} m/s) exceeds human physical sprint thresholds`);
  }
  if (rules.baseDistance < 0) errors.push(`Base safety distance cannot be negative`);
  if (rules.safetyMargin < 0) errors.push(`Safety margin buffer cannot be negative`);
  if (rules.emergencyThreshold <= 0) errors.push(`Emergency threshold must be positive`);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates transparent, human-readable engineering explanation for the safety state
 */
export function generateSafetyExplanation(
  riskLevel: RiskLevel,
  currentDistance: number,
  requiredDistance: number,
  robot: RobotEntity,
  human: HumanEntity,
  marginRemaining: number,
  isApproaching: boolean
): string {
  const curStr = currentDistance.toFixed(2);
  const reqStr = requiredDistance.toFixed(2);
  const rSpd = robot.currentSpeed.toFixed(1);
  const hSpd = human.currentSpeed.toFixed(1);

  switch (riskLevel) {
    case 'EMERGENCY':
      return `CRITICAL PROXIMITY: Human is only ${curStr}m from Robot (Threshold <= 1.0m). Emergency Stop interlock triggered.`;
    case 'UNSAFE':
      return `UNSAFE: Separation (${curStr}m) has breached required dynamic safety zone (${reqStr}m). Robot speed: ${rSpd} m/s, Human speed: ${hSpd} m/s (${human.task}). Deceleration / diversion recommended.`;
    case 'WARNING':
      return `WARNING: Human is approaching boundary (${curStr}m vs ${reqStr}m required). Remaining safety margin: ${marginRemaining.toFixed(2)}m. ${isApproaching ? 'Vectors indicate convergence.' : 'Monitoring trajectory.'}`;
    case 'SAFE':
    default:
      return `SAFE: Human remains clear of dynamic safety boundary (${curStr}m distance > ${reqStr}m required). Robot operating at ${rSpd} m/s. No production interruption needed.`;
  }
}

/**
 * Full Safety Evaluation Engine
 */
export function evaluateSafetyState(
  rules: SafetyRuleConfig,
  robot: RobotEntity,
  human: HumanEntity,
  timestamp: number = Date.now()
): SafetyEvaluation {
  const distance = calculateDistance(robot.position, human.position);
  const { requiredDistance, breakdown } = calculateDynamicSafetyDistance(rules, robot, human);
  const approachInfo = calculateApproachFactor(robot, human);

  const marginRemaining = distance - requiredDistance;
  const warningBuffer = Math.max(1.2, rules.safetyMargin * 1.5);

  let riskLevel: RiskLevel = 'SAFE';

  if (distance <= rules.emergencyThreshold || (robot.position.x === human.position.x && robot.position.y === human.position.y)) {
    riskLevel = 'EMERGENCY';
  } else if (distance < requiredDistance) {
    riskLevel = 'UNSAFE';
  } else if (distance < requiredDistance + warningBuffer) {
    riskLevel = 'WARNING';
  } else {
    riskLevel = 'SAFE';
  }

  let baselineRiskLevel: RiskLevel = 'SAFE';
  if (distance <= rules.emergencyThreshold) {
    baselineRiskLevel = 'EMERGENCY';
  } else if (distance < rules.staticBaselineDistance) {
    baselineRiskLevel = 'UNSAFE';
  } else if (distance < rules.staticBaselineDistance + 1.0) {
    baselineRiskLevel = 'WARNING';
  }

  const explanation = generateSafetyExplanation(
    riskLevel,
    distance,
    requiredDistance,
    robot,
    human,
    marginRemaining,
    approachInfo.isApproaching
  );

  return {
    currentDistance: Math.round(distance * 100) / 100,
    requiredDynamicDistance: requiredDistance,
    staticBaselineDistance: rules.staticBaselineDistance,
    safetyMarginRemaining: Math.round(marginRemaining * 100) / 100,
    riskLevel,
    baselineRiskLevel,
    explanation,
    breakdown,
    relativeVelocity: Math.round(approachInfo.approachVelocity * 100) / 100,
    isApproaching: approachInfo.isApproaching,
    timestamp,
  };
}
