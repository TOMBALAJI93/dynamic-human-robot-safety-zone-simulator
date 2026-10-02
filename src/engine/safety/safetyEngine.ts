import type { 
  Point2D, 
  RobotEntity, 
  HumanEntity, 
  SafetyRuleConfig, 
  SafetyEvaluation, 
  RiskLevel,
  EnvironmentalContext,
  FloorConditionType,
  PairwiseEvaluation,
  MultiAgentEvaluationResult
} from '../../types';

/**
 * Nominal default environment configuration (Review 1 baseline conditions)
 */
export const DEFAULT_ENVIRONMENT_CONFIG: EnvironmentalContext = {
  temperature: 25, // 25°C (standard laboratory baseline)
  pressure: 1.013, // 1.013 bar (standard 1 atmosphere)
  floorCondition: 'DRY_CLEAN',
  frictionCoefficient: 1.00, // Nominal dry industrial concrete floor
  sensorDegradationFactor: 0.00, // 0% degradation (pristine optical sensor lens)
  ambientNotes: 'Standard ISO nominal operating conditions (dry clean concrete, 25°C, 1.013 bar)',
};

/**
 * Floor friction coefficient presets and physical descriptions
 */
export const FLOOR_FRICTION_PRESETS: Record<FloorConditionType, { friction: number; label: string; description: string }> = {
  DRY_CLEAN: {
    friction: 1.00,
    label: 'Dry Clean Concrete',
    description: 'Nominal plant floor with high traction and zero contamination (μ = 1.00)'
  },
  WET_WASHDOWN: {
    friction: 0.65,
    label: 'Wet Washdown Area',
    description: 'Post-cleaning damp or soapy tile with moderate braking traction loss (μ = 0.65)'
  },
  OIL_CHEMICAL_SLICK: {
    friction: 0.35,
    label: 'Oil / Chemical Spill Slick',
    description: 'Hazardous lubricant or process oil residue resulting in severe tire slippage (μ = 0.35)'
  },
  COLD_FROST: {
    friction: 0.20,
    label: 'Cold Storage Frost Slick',
    description: 'Sub-zero refrigerated storage moisture / frost slick with minimal friction (μ = 0.20)'
  }
};

/**
 * Validates and sanitizes environmental inputs to prevent NaN, infinity, or negative numbers
 */
export function sanitizeEnvironmentalContext(env?: Partial<EnvironmentalContext>): EnvironmentalContext {
  if (!env) return { ...DEFAULT_ENVIRONMENT_CONFIG };

  const rawFriction = typeof env.frictionCoefficient === 'number' && !isNaN(env.frictionCoefficient) 
    ? env.frictionCoefficient 
    : 1.0;
  // Floor friction clamped strictly between 0.15 (extreme ice/oil) and 1.0 (dry concrete)
  const safeFriction = Math.max(0.15, Math.min(1.0, rawFriction));

  const rawSensorDeg = typeof env.sensorDegradationFactor === 'number' && !isNaN(env.sensorDegradationFactor)
    ? env.sensorDegradationFactor
    : 0.0;
  // Sensor degradation clamped between 0.0 (pristine) and 0.70 (70% optical attenuation)
  const safeSensorDeg = Math.max(0.0, Math.min(0.70, rawSensorDeg));

  const rawTemp = typeof env.temperature === 'number' && !isNaN(env.temperature)
    ? env.temperature
    : 25;
  // Temperature clamped between -40°C and +80°C
  const safeTemp = Math.max(-40, Math.min(80, rawTemp));

  const rawPressure = typeof env.pressure === 'number' && !isNaN(env.pressure)
    ? env.pressure
    : 1.013;
  // Atmospheric pressure clamped between 0.50 bar and 3.00 bar
  const safePressure = Math.max(0.50, Math.min(3.00, rawPressure));

  return {
    floorCondition: env.floorCondition || 'DRY_CLEAN',
    frictionCoefficient: Number(safeFriction.toFixed(2)),
    sensorDegradationFactor: Number(safeSensorDeg.toFixed(2)),
    temperature: Number(safeTemp.toFixed(1)),
    pressure: Number(safePressure.toFixed(3)),
    ambientNotes: env.ambientNotes || 'Sanitized environment parameters',
  };
}

/**
 * Calculates Euclidean distance between two 2D points with NaN protection
 */
export function calculateDistance(p1: Point2D, p2: Point2D): number {
  if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
    return 10.0; // safe default separation
  }
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates directional approach factor based on velocity vectors
 */
export function calculateApproachFactor(
  entityA: { position: Point2D; currentSpeed: number; direction: number },
  entityB: { position: Point2D; currentSpeed: number; direction: number }
): { isApproaching: boolean; angleMultiplier: number; approachVelocity: number } {
  const dx = entityB.position.x - entityA.position.x;
  const dy = entityB.position.y - entityA.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 0.05) {
    return { isApproaching: true, angleMultiplier: 1.5, approachVelocity: entityA.currentSpeed + entityB.currentSpeed };
  }

  const nx = dx / distance;
  const ny = dy / distance;

  const vAx = entityA.currentSpeed * Math.cos(entityA.direction || 0);
  const vAy = entityA.currentSpeed * Math.sin(entityA.direction || 0);
  const vBx = entityB.currentSpeed * Math.cos(entityB.direction || 0);
  const vBy = entityB.currentSpeed * Math.sin(entityB.direction || 0);

  // Relative velocity projected along separation line
  const vRelA = vAx * nx + vAy * ny;
  const vRelB = vBx * (-nx) + vBy * (-ny);
  const approachVelocity = Math.max(0, vRelA + vRelB);
  const isApproaching = approachVelocity > 0.05;

  // Multiplier scales from 1.0 (diverging/perpendicular) up to 1.5 (direct head-on approach)
  const maxPossibleApproach = Math.max(1.0, entityA.currentSpeed + entityB.currentSpeed);
  const normalizedApproach = Math.min(1.0, approachVelocity / maxPossibleApproach);
  const angleMultiplier = isApproaching ? 1.0 + (0.5 * normalizedApproach) : 1.0;

  return {
    isApproaching,
    angleMultiplier: Number(angleMultiplier.toFixed(2)),
    approachVelocity: Number(approachVelocity.toFixed(2)),
  };
}

/**
 * Default Safety Rule Configuration (Review 1 Baseline)
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
 * Calculates ambient environmental multiplier lambda_ambient(T, P)
 * lambda_ambient = 1.0 + |T - 25| / 100 + |P - 1.013| / 10
 * Returns exactly 1.0 at nominal (25°C, 1.013 bar)
 */
export function calculateAmbientMultiplier(temperature: number, pressure: number): number {
  const tempOffset = Math.abs(temperature - 25);
  const pressureOffset = Math.abs(pressure - 1.013);
  return 1.0 + (tempOffset / 100) + (pressureOffset / 10);
}

/**
 * Canonical Single-Agent Dynamic Safety Distance Calculation (Robot <-> Human)
 */
export function calculateDynamicSafetyDistance(
  rules: SafetyRuleConfig,
  robot: RobotEntity,
  human: HumanEntity,
  environment: EnvironmentalContext = DEFAULT_ENVIRONMENT_CONFIG
): { requiredDistance: number; breakdown: SafetyEvaluation['breakdown'] } {
  const env = sanitizeEnvironmentalContext(environment);
  
  const rSpeed = Math.max(0, isNaN(robot.currentSpeed) ? 0 : robot.currentSpeed);
  const rStopTime = Math.max(0.1, isNaN(robot.stoppingTime) ? 0.8 : robot.stoppingTime);
  const hSpeed = Math.max(0, isNaN(human.currentSpeed) ? 0 : human.currentSpeed);
  const hReactTime = Math.max(0.1, isNaN(human.reactionTime) ? 0.5 : human.reactionTime);

  const base = Math.max(0, rules.baseDistance);
  const margin = Math.max(0, rules.safetyMargin);
  const taskFactor = rules.taskMultipliers[human.task] || 1.0;

  // 1. Environmental calculations
  const ambientMultiplier = calculateAmbientMultiplier(env.temperature, env.pressure);
  
  // 2. Robot stopping distance scaled by floor friction
  const robotStoppingComponent = (rSpeed * rStopTime * rules.robotSpeedWeight) / env.frictionCoefficient;
  
  // 3. Human movement component scaled by ambient environmental stress
  const humanMovementComponent = hSpeed * hReactTime * rules.humanSpeedWeight * ambientMultiplier;
  
  // 4. Environmental sensor degradation uncertainty component
  const baseReaction = 0.5 * hReactTime * rules.reactionTimeFactor;
  const reactionComponent = baseReaction * (1.0 + env.sensorDegradationFactor * 1.5) + (env.sensorDegradationFactor * 1.2);

  const approach = rules.useDirectionalFactor 
    ? calculateApproachFactor(robot, human).angleMultiplier 
    : 1.0;

  const rawRequired = (base + robotStoppingComponent + humanMovementComponent + reactionComponent) * taskFactor * approach + margin;
  const requiredDistance = Number((isNaN(rawRequired) || !isFinite(rawRequired) ? 2.5 : rawRequired).toFixed(2));

  // Nominal reference calculation for delta display
  const nominalRobotComp = rSpeed * rStopTime * rules.robotSpeedWeight;
  const nominalHumanComp = hSpeed * hReactTime * rules.humanSpeedWeight;
  const nominalReactionComp = baseReaction;
  const rawNominal = (base + nominalRobotComp + nominalHumanComp + nominalReactionComp) * taskFactor * approach + margin;
  const nominalRequiredDistance = Number(rawNominal.toFixed(2));
  const environmentalIncrease = Number(Math.max(0, requiredDistance - nominalRequiredDistance).toFixed(2));

  return {
    requiredDistance,
    breakdown: {
      baseDistance: Number(base.toFixed(2)),
      robotMovementComponent: Number(robotStoppingComponent.toFixed(2)),
      humanMovementComponent: Number(humanMovementComponent.toFixed(2)),
      reactionComponent: Number(reactionComponent.toFixed(2)),
      taskFactor: Number(taskFactor.toFixed(2)),
      safetyMargin: Number(margin.toFixed(2)),
      frictionCoefficient: env.frictionCoefficient,
      ambientMultiplier: Number(ambientMultiplier.toFixed(3)),
      sensorDegradationFactor: env.sensorDegradationFactor,
      nominalRequiredDistance,
      environmentalIncrease
    }
  };
}

/**
 * Robot <-> Robot Pairwise Dynamic Safety Distance Calculation
 * D_req,RR = [D_base + (v_r1 * t_stop1 * w_r + v_r2 * t_stop2 * w_r) / mu_floor + C_sensor] * DirFactor + M_safety
 */
export function calculateRobotRobotSafetyDistance(
  rules: SafetyRuleConfig,
  robotA: RobotEntity,
  robotB: RobotEntity,
  environment: EnvironmentalContext = DEFAULT_ENVIRONMENT_CONFIG
): { requiredDistance: number; breakdown: PairwiseEvaluation['breakdown'] } {
  const env = sanitizeEnvironmentalContext(environment);
  
  const v1 = Math.max(0, isNaN(robotA.currentSpeed) ? 0 : robotA.currentSpeed);
  const t1 = Math.max(0.1, isNaN(robotA.stoppingTime) ? 0.8 : robotA.stoppingTime);
  const v2 = Math.max(0, isNaN(robotB.currentSpeed) ? 0 : robotB.currentSpeed);
  const t2 = Math.max(0.1, isNaN(robotB.stoppingTime) ? 0.8 : robotB.stoppingTime);

  const base = Math.max(0, rules.baseDistance);
  const margin = Math.max(0, rules.safetyMargin);

  // Combined stopping requirement on current floor surface
  const combinedStoppingDist = ((v1 * t1 * rules.robotSpeedWeight) + (v2 * t2 * rules.robotSpeedWeight)) / env.frictionCoefficient;
  const sensorComp = env.sensorDegradationFactor * 1.5;

  const approach = rules.useDirectionalFactor 
    ? calculateApproachFactor(robotA, robotB).angleMultiplier 
    : 1.0;

  const rawReq = (base + combinedStoppingDist + sensorComp) * approach + margin;
  const requiredDistance = Number((isNaN(rawReq) || !isFinite(rawReq) ? 2.5 : rawReq).toFixed(2));

  return {
    requiredDistance,
    breakdown: {
      baseDistance: Number(base.toFixed(2)),
      brakingComponent: Number(combinedStoppingDist.toFixed(2)),
      frictionCoefficient: env.frictionCoefficient,
      sensorDegradationFactor: env.sensorDegradationFactor
    }
  };
}

/**
 * Human <-> Human Pairwise Proximity Safety Distance Calculation
 * D_req,HH = D_base,HH + (v_h1 * t_react1 + v_h2 * t_react2) * 0.5 * lambda_amb + M_safety,HH
 */
export function calculateHumanHumanSafetyDistance(
  _rules: SafetyRuleConfig,
  humanA: HumanEntity,
  humanB: HumanEntity,
  environment: EnvironmentalContext = DEFAULT_ENVIRONMENT_CONFIG
): { requiredDistance: number; breakdown: PairwiseEvaluation['breakdown'] } {
  const env = sanitizeEnvironmentalContext(environment);
  
  const v1 = Math.max(0, isNaN(humanA.currentSpeed) ? 0 : humanA.currentSpeed);
  const t1 = Math.max(0.1, isNaN(humanA.reactionTime) ? 0.5 : humanA.reactionTime);
  const v2 = Math.max(0, isNaN(humanB.currentSpeed) ? 0 : humanB.currentSpeed);
  const t2 = Math.max(0.1, isNaN(humanB.reactionTime) ? 0.5 : humanB.reactionTime);

  const ambientMultiplier = calculateAmbientMultiplier(env.temperature, env.pressure);
  const baseHH = 0.80; // Standard inter-worker walking clearance
  const marginHH = 0.40;

  const walkingReactionComp = ((v1 * t1) + (v2 * t2)) * 0.5 * ambientMultiplier;
  const rawReq = baseHH + walkingReactionComp + marginHH;
  const requiredDistance = Number((isNaN(rawReq) || !isFinite(rawReq) ? 1.5 : rawReq).toFixed(2));

  return {
    requiredDistance,
    breakdown: {
      baseDistance: baseHH,
      reactionComponent: Number(walkingReactionComp.toFixed(2)),
      ambientMultiplier: Number(ambientMultiplier.toFixed(3))
    }
  };
}

/**
 * Evaluates pairwise safety between two active entities
 */
export function evaluatePairwiseSafety(
  rules: SafetyRuleConfig,
  entityA: RobotEntity | HumanEntity,
  entityB: RobotEntity | HumanEntity,
  typeA: 'robot' | 'human',
  typeB: 'robot' | 'human',
  environment: EnvironmentalContext = DEFAULT_ENVIRONMENT_CONFIG
): PairwiseEvaluation {
  const currentDistance = calculateDistance(entityA.position, entityB.position);
  let pairType: PairwiseEvaluation['pairType'] = 'ROBOT_HUMAN';
  let reqDistance = 2.5;
  let breakdown: PairwiseEvaluation['breakdown'] = {};

  if (typeA === 'robot' && typeB === 'human') {
    const calc = calculateDynamicSafetyDistance(rules, entityA as RobotEntity, entityB as HumanEntity, environment);
    reqDistance = calc.requiredDistance;
    breakdown = calc.breakdown;
    pairType = 'ROBOT_HUMAN';
  } else if (typeA === 'human' && typeB === 'robot') {
    const calc = calculateDynamicSafetyDistance(rules, entityB as RobotEntity, entityA as HumanEntity, environment);
    reqDistance = calc.requiredDistance;
    breakdown = calc.breakdown;
    pairType = 'ROBOT_HUMAN';
  } else if (typeA === 'robot' && typeB === 'robot') {
    const calc = calculateRobotRobotSafetyDistance(rules, entityA as RobotEntity, entityB as RobotEntity, environment);
    reqDistance = calc.requiredDistance;
    breakdown = calc.breakdown;
    pairType = 'ROBOT_ROBOT';
  } else {
    const calc = calculateHumanHumanSafetyDistance(rules, entityA as HumanEntity, entityB as HumanEntity, environment);
    reqDistance = calc.requiredDistance;
    breakdown = calc.breakdown;
    pairType = 'HUMAN_HUMAN';
  }

  const marginRemaining = Number((currentDistance - reqDistance).toFixed(2));
  const approachInfo = calculateApproachFactor(entityA, entityB);

  // Risk Classification
  let riskLevel: RiskLevel = 'SAFE';
  if (currentDistance <= 0.05 || currentDistance <= rules.emergencyThreshold) {
    riskLevel = 'EMERGENCY';
  } else if (currentDistance < reqDistance * 0.55) {
    riskLevel = 'UNSAFE';
  } else if (currentDistance <= reqDistance) {
    riskLevel = 'WARNING';
  }

  // Engineering Explanation
  let explanation = '';
  if (riskLevel === 'EMERGENCY') {
    explanation = `EMERGENCY PROXIMITY (${currentDistance.toFixed(2)}m <= ${rules.emergencyThreshold}m): Immediate fail-stop triggered between ${entityA.name} and ${entityB.name}.`;
  } else if (riskLevel === 'UNSAFE') {
    explanation = `UNSAFE SEPARATION (${currentDistance.toFixed(2)}m < ${reqDistance.toFixed(2)}m): Speed reduction required between ${entityA.name} and ${entityB.name}.`;
  } else if (riskLevel === 'WARNING') {
    explanation = `PROXIMITY WARNING (${currentDistance.toFixed(2)}m <= ${reqDistance.toFixed(2)}m): Warning buffer active for ${entityA.name} and ${entityB.name}.`;
  } else {
    explanation = `SAFE CLEARANCE (${currentDistance.toFixed(2)}m > ${reqDistance.toFixed(2)}m): Nominal operation buffer +${marginRemaining.toFixed(2)}m.`;
  }

  return {
    id: `${entityA.id}-${entityB.id}`,
    pairType,
    entityAId: entityA.id,
    entityAName: entityA.name,
    entityAType: typeA,
    entityBId: entityB.id,
    entityBName: entityB.name,
    entityBType: typeB,
    currentDistance: Number(currentDistance.toFixed(2)),
    requiredDynamicDistance: reqDistance,
    safetyMarginRemaining: marginRemaining,
    riskLevel,
    isApproaching: approachInfo.isApproaching,
    explanation,
    breakdown
  };
}

/**
 * Deterministic Multi-Agent Safety Evaluation Engine
 * Evaluates all active entity pairs and arbitrates highest threat
 */
export function evaluateMultiAgentSafetyState(
  rules: SafetyRuleConfig,
  robots: RobotEntity[],
  humans: HumanEntity[],
  environment: EnvironmentalContext = DEFAULT_ENVIRONMENT_CONFIG
): MultiAgentEvaluationResult {
  const startTime = performance.now();
  const env = sanitizeEnvironmentalContext(environment);

  // Filter active entities
  const activeRobots = robots.filter(r => r.isActive !== false);
  const activeHumans = humans.filter(h => h.isActive !== false);

  const pairwiseEvaluations: PairwiseEvaluation[] = [];

  // 1. Robot <-> Human pairs (N x M)
  for (const r of activeRobots) {
    for (const h of activeHumans) {
      pairwiseEvaluations.push(evaluatePairwiseSafety(rules, r, h, 'robot', 'human', env));
    }
  }

  // 2. Robot <-> Robot pairs (N(N-1)/2)
  for (let i = 0; i < activeRobots.length; i++) {
    for (let j = i + 1; j < activeRobots.length; j++) {
      pairwiseEvaluations.push(evaluatePairwiseSafety(rules, activeRobots[i], activeRobots[j], 'robot', 'robot', env));
    }
  }

  // 3. Human <-> Human pairs (M(M-1)/2)
  for (let i = 0; i < activeHumans.length; i++) {
    for (let j = i + 1; j < activeHumans.length; j++) {
      pairwiseEvaluations.push(evaluatePairwiseSafety(rules, activeHumans[i], activeHumans[j], 'human', 'human', env));
    }
  }

  // Highest-Threat Arbitration Priority: EMERGENCY > UNSAFE > WARNING > SAFE
  // Tie-breaker: Smallest remaining safety margin
  const riskPriority: Record<RiskLevel, number> = {
    EMERGENCY: 4,
    UNSAFE: 3,
    WARNING: 2,
    SAFE: 1
  };

  let highestThreatPair: PairwiseEvaluation | null = null;
  let overallRiskLevel: RiskLevel = 'SAFE';
  let minMargin = 999.0;

  for (const pair of pairwiseEvaluations) {
    if (pair.safetyMarginRemaining < minMargin) {
      minMargin = pair.safetyMarginRemaining;
    }

    if (!highestThreatPair) {
      highestThreatPair = pair;
      overallRiskLevel = pair.riskLevel;
      continue;
    }

    const currRank = riskPriority[pair.riskLevel];
    const highRank = riskPriority[highestThreatPair.riskLevel];

    if (currRank > highRank) {
      highestThreatPair = pair;
      overallRiskLevel = pair.riskLevel;
    } else if (currRank === highRank) {
      // Tie-breaker: smallest remaining margin
      if (pair.safetyMarginRemaining < highestThreatPair.safetyMarginRemaining) {
        highestThreatPair = pair;
      }
    }
  }

  const endTime = performance.now();
  const evaluationTimeMs = Number((endTime - startTime).toFixed(3));

  // Canonical single-agent evaluation representation
  const primaryRobot = activeRobots[0] || robots[0] || { id: 'r-0', name: 'AMR', position: { x: 0, y: 0 }, currentSpeed: 0, direction: 0, stoppingTime: 0.8, status: 'IDLE', path: [], currentWaypointIndex: 0, baseRadius: 0.8, maxSpeed: 2.0, type: 'AGV' };
  const primaryHuman = activeHumans[0] || humans[0] || { id: 'h-0', name: 'Human', position: { x: 10, y: 10 }, currentSpeed: 0, expectedSpeed: 0, direction: 0, reactionTime: 0.5, task: 'Inspection', status: 'WORKING', path: [], currentWaypointIndex: 0 };
  
  const overallEvaluation: SafetyEvaluation = evaluateSafetyState(rules, primaryRobot, primaryHuman, env);
  overallEvaluation.riskLevel = overallRiskLevel;

  return {
    overallRiskLevel,
    highestThreatPair,
    minimumMarginRemaining: Number(minMargin.toFixed(2)),
    activeRobotsCount: activeRobots.length,
    activeHumansCount: activeHumans.length,
    totalPairsEvaluated: pairwiseEvaluations.length,
    pairwiseEvaluations,
    evaluationTimeMs,
    overallEvaluation
  };
}

/**
 * Validates entity safety parameters and flags boundary exceptions
 */
export function validateSafetyParameters(
  _rules: SafetyRuleConfig,
  robot: RobotEntity,
  human: HumanEntity,
  environment?: EnvironmentalContext
): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (robot.currentSpeed < 0 || robot.currentSpeed > 5.0) {
    violations.push(`Robot speed ${robot.currentSpeed}m/s out of range [0, 5.0]`);
  }
  if (human.currentSpeed < 0 || human.currentSpeed > 4.0) {
    violations.push(`Human speed ${human.currentSpeed}m/s out of range [0, 4.0]`);
  }
  if (human.reactionTime <= 0 || human.reactionTime > 3.0) {
    violations.push(`Human reaction time ${human.reactionTime}s out of range (0, 3.0]`);
  }
  if (robot.stoppingTime <= 0 || robot.stoppingTime > 3.0) {
    violations.push(`Robot stopping time ${robot.stoppingTime}s out of range (0, 3.0]`);
  }
  if (environment) {
    if (environment.frictionCoefficient < 0.15 || environment.frictionCoefficient > 1.0) {
      violations.push(`Floor friction ${environment.frictionCoefficient} outside operational range [0.15, 1.0]`);
    }
    if (environment.temperature < -40 || environment.temperature > 80) {
      violations.push(`Temperature ${environment.temperature}°C outside operational range [-40, 80]`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Generates transparent engineering explanation for single-agent state
 */
export function generateSafetyExplanation(
  riskLevel: RiskLevel,
  currentDistance: number,
  requiredDistance: number,
  robot: RobotEntity,
  human: HumanEntity,
  marginRemaining: number,
  isApproaching: boolean,
  environment?: EnvironmentalContext
): string {
  const curStr = currentDistance.toFixed(2);
  const reqStr = requiredDistance.toFixed(2);
  const rSpeedStr = robot.currentSpeed.toFixed(1);
  const hTaskStr = human.task;
  const frictionStr = environment ? environment.frictionCoefficient.toFixed(2) : '1.00';

  if (riskLevel === 'EMERGENCY') {
    return `EMERGENCY STOP TRIGGERED: Separation (${curStr}m) is below emergency limit. Robot (${rSpeedStr}m/s) stopped immediately near worker [${hTaskStr}] on floor μ=${frictionStr}.`;
  }
  if (riskLevel === 'UNSAFE') {
    return `UNSAFE PROXIMITY: Separation (${curStr}m) breached dynamic zone (${reqStr}m). Deceleration active near worker [${hTaskStr}] on floor μ=${frictionStr}.`;
  }
  if (riskLevel === 'WARNING') {
    return `PROXIMITY WARNING: Separation (${curStr}m) within warning buffer (${reqStr}m). Speed throttled near worker [${hTaskStr}]. Approach=${isApproaching ? 'Yes' : 'No'}.`;
  }
  return `SAFE OPERATION: Separation (${curStr}m) exceeds dynamic requirement (${reqStr}m) by +${marginRemaining.toFixed(2)}m buffer. AMR operating at nominal speed with worker [${hTaskStr}].`;
}

/**
 * Single-Agent Safety Evaluation function with Environmental Context support
 */
export function evaluateSafetyState(
  rules: SafetyRuleConfig,
  robot: RobotEntity,
  human: HumanEntity,
  environment: EnvironmentalContext = DEFAULT_ENVIRONMENT_CONFIG,
  timestamp: number = Date.now()
): SafetyEvaluation {
  const currentDistance = calculateDistance(robot.position, human.position);
  const dynamicCalc = calculateDynamicSafetyDistance(rules, robot, human, environment);
  const requiredDynamicDistance = dynamicCalc.requiredDistance;
  const staticBaselineDistance = rules.staticBaselineDistance;

  const marginRemaining = currentDistance - requiredDynamicDistance;
  const approachInfo = calculateApproachFactor(robot, human);

  let riskLevel: RiskLevel = 'SAFE';
  if (currentDistance <= 0.05 || currentDistance <= rules.emergencyThreshold) {
    riskLevel = 'EMERGENCY';
  } else if (currentDistance < requiredDynamicDistance * 0.55) {
    riskLevel = 'UNSAFE';
  } else if (currentDistance <= requiredDynamicDistance) {
    riskLevel = 'WARNING';
  }

  let baselineRiskLevel: RiskLevel = 'SAFE';
  if (currentDistance <= rules.emergencyThreshold) {
    baselineRiskLevel = 'EMERGENCY';
  } else if (currentDistance < staticBaselineDistance * 0.55) {
    baselineRiskLevel = 'UNSAFE';
  } else if (currentDistance <= staticBaselineDistance) {
    baselineRiskLevel = 'WARNING';
  }

  const explanation = generateSafetyExplanation(
    riskLevel,
    currentDistance,
    requiredDynamicDistance,
    robot,
    human,
    marginRemaining,
    approachInfo.isApproaching,
    environment
  );

  return {
    currentDistance: Number(currentDistance.toFixed(2)),
    requiredDynamicDistance,
    staticBaselineDistance,
    safetyMarginRemaining: Number(marginRemaining.toFixed(2)),
    riskLevel,
    baselineRiskLevel,
    explanation,
    breakdown: dynamicCalc.breakdown,
    relativeVelocity: Number(approachInfo.approachVelocity.toFixed(2)),
    isApproaching: approachInfo.isApproaching,
    timestamp,
  };
}
