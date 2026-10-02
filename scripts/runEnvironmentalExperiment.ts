/**
 * DETERMINISTIC ENVIRONMENTAL EXPERIMENT RUNNER (ENV-EXP-01)
 * Project: Dynamic Human-Robot Safety-Zone Simulator for Process Plants
 * 
 * Executes Scenario 1 (Head-On Process Walkway) across 5 standard industrial environmental conditions:
 * Condition A: Nominal Dry Clean Floor (T=25°C, P=1.013 bar, μ=1.00, η=0.00)
 * Condition B: Wet Washdown Floor (T=28°C, P=1.013 bar, μ=0.65, η=0.05)
 * Condition C: Oil / Chemical Spill Slick (T=30°C, P=1.013 bar, μ=0.35, η=0.10)
 * Condition D: Optical Sensor Degradation / Mist (T=25°C, P=1.013 bar, μ=1.00, η=0.40)
 * Condition E: Extreme Ambient Temperature (T=45°C, P=1.013 bar, μ=1.00, η=0.00)
 */

import * as fs from 'fs';
import * as path from 'path';
import { PREDEFINED_SCENARIOS } from '../src/engine/scenarios/scenarioData';
import { evaluateSafetyState, DEFAULT_SAFETY_RULES, DEFAULT_ENVIRONMENT_CONFIG } from '../src/engine/safety/safetyEngine';
import { updateRobotMotion, updateHumanMotion } from '../src/engine/physics/motionEngine';
import type { EnvironmentalContext, RiskLevel } from '../src/types';

interface EnvConditionTest {
  code: string;
  name: string;
  env: EnvironmentalContext;
}

const conditions: EnvConditionTest[] = [
  {
    code: 'COND-A',
    name: 'Nominal Dry Clean Floor',
    env: { ...DEFAULT_ENVIRONMENT_CONFIG }
  },
  {
    code: 'COND-B',
    name: 'Wet Washdown Area Floor',
    env: { floorCondition: 'WET_WASHDOWN', frictionCoefficient: 0.65, temperature: 28, pressure: 1.013, sensorDegradationFactor: 0.05, ambientNotes: 'Post-washdown wet tile' }
  },
  {
    code: 'COND-C',
    name: 'Oil / Chemical Spill Slick',
    env: { floorCondition: 'OIL_CHEMICAL_SLICK', frictionCoefficient: 0.35, temperature: 30, pressure: 1.013, sensorDegradationFactor: 0.10, ambientNotes: 'Chemical lubricant leak' }
  },
  {
    code: 'COND-D',
    name: 'Optical Sensor Degradation / Mist',
    env: { floorCondition: 'DRY_CLEAN', frictionCoefficient: 1.0, temperature: 25, pressure: 1.013, sensorDegradationFactor: 0.40, ambientNotes: 'Particulate & lens condensation' }
  },
  {
    code: 'COND-E',
    name: 'Elevated Ambient Temperature Stress',
    env: { floorCondition: 'DRY_CLEAN', frictionCoefficient: 1.0, temperature: 45, pressure: 1.013, sensorDegradationFactor: 0.00, ambientNotes: 'High thermal boiler environment' }
  }
];

const scenario = PREDEFINED_SCENARIOS[0]; // Scenario 1: Head-On Process Walkway
const rules = scenario.safetyRules || DEFAULT_SAFETY_RULES;

interface ExperimentRow {
  conditionCode: string;
  conditionName: string;
  friction: number;
  temperature: number;
  sensorDeg: number;
  minSeparationDist: number;
  maxRequiredDist: number;
  meanRequiredDist: number;
  firstWarningTime: number | null;
  firstUnsafeTime: number | null;
  unsafeDuration: number;
  peakRisk: RiskLevel;
  staticBaselineViolations: number;
  staticStopsAvoided: number;
}

const results: ExperimentRow[] = [];
const allTelemetrySamples: any[] = [];

conditions.forEach((cond) => {
  let robot = { ...scenario.initialRobot };
  let human = { ...scenario.initialHuman };
  const dt = 0.1;
  const totalSteps = Math.floor(scenario.duration / dt);

  let minDist = 999;
  let maxReq = 0;
  let sumReq = 0;
  let firstWarn: number | null = null;
  let firstUnsafe: number | null = null;
  let unsafeCount = 0;
  let peakRisk: RiskLevel = 'SAFE';
  let staticViolations = 0;
  let stopsAvoided = 0;

  const riskRank: Record<RiskLevel, number> = { SAFE: 0, WARNING: 1, UNSAFE: 2, EMERGENCY: 3 };

  for (let step = 0; step < totalSteps; step++) {
    const time = Number((step * dt).toFixed(1));
    robot = updateRobotMotion(robot, dt);
    human = updateHumanMotion(human, dt);

    const evalRes = evaluateSafetyState(rules, robot, human, cond.env);

    if (evalRes.currentDistance < minDist) minDist = evalRes.currentDistance;
    if (evalRes.requiredDynamicDistance > maxReq) maxReq = evalRes.requiredDynamicDistance;
    sumReq += evalRes.requiredDynamicDistance;

    if (evalRes.riskLevel === 'WARNING' && firstWarn === null) firstWarn = time;
    if ((evalRes.riskLevel === 'UNSAFE' || evalRes.riskLevel === 'EMERGENCY') && firstUnsafe === null) firstUnsafe = time;
    if (evalRes.riskLevel === 'UNSAFE' || evalRes.riskLevel === 'EMERGENCY') unsafeCount++;
    if (evalRes.currentDistance < 3.0) staticViolations++;
    if (evalRes.currentDistance >= evalRes.requiredDynamicDistance && evalRes.currentDistance < 3.0) stopsAvoided++;

    if (riskRank[evalRes.riskLevel] > riskRank[peakRisk]) peakRisk = evalRes.riskLevel;

    allTelemetrySamples.push({
      condition: cond.code,
      time,
      robotX: robot.position.x,
      robotY: robot.position.y,
      humanX: human.position.x,
      humanY: human.position.y,
      distance: evalRes.currentDistance,
      requiredDistance: evalRes.requiredDynamicDistance,
      riskLevel: evalRes.riskLevel,
      friction: cond.env.frictionCoefficient,
      temperature: cond.env.temperature,
      sensorDeg: cond.env.sensorDegradationFactor
    });
  }

  results.push({
    conditionCode: cond.code,
    conditionName: cond.name,
    friction: cond.env.frictionCoefficient,
    temperature: cond.env.temperature,
    sensorDeg: cond.env.sensorDegradationFactor,
    minSeparationDist: Number(minDist.toFixed(2)),
    maxRequiredDist: Number(maxReq.toFixed(2)),
    meanRequiredDist: Number((sumReq / totalSteps).toFixed(2)),
    firstWarningTime: firstWarn,
    firstUnsafeTime: firstUnsafe,
    unsafeDuration: Number((unsafeCount * dt).toFixed(1)),
    peakRisk,
    staticBaselineViolations: staticViolations,
    staticStopsAvoided: stopsAvoided
  });
});

console.log('========================================================================================================');
console.log('DETERMINISTIC EXPERIMENTAL RESULTS: ENV-EXP-01 (Scenario 1 across 5 Environmental Conditions)');
console.log('========================================================================================================');
console.table(results);

// Ensure data folder exists
const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'docs/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Export Summary CSV
const csvHeaders = [
  'ConditionCode',
  'ConditionName',
  'Friction_mu',
  'Temperature_C',
  'SensorDegradation_eta',
  'MinSeparation_m',
  'MaxRequired_m',
  'MeanRequired_m',
  'FirstWarningTime_s',
  'FirstUnsafeTime_s',
  'UnsafeDuration_s',
  'PeakRisk',
  'StaticBaselineViolations',
  'StaticStopsAvoided'
];

const csvRows = results.map(r => [
  r.conditionCode,
  `"${r.conditionName}"`,
  r.friction,
  r.temperature,
  r.sensorDeg,
  r.minSeparationDist,
  r.maxRequiredDist,
  r.meanRequiredDist,
  r.firstWarningTime ?? 'None',
  r.firstUnsafeTime ?? 'None',
  r.unsafeDuration,
  r.peakRisk,
  r.staticBaselineViolations,
  r.staticStopsAvoided
]);

const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
fs.writeFileSync(path.join(dataDir, 'environmental_experiments_results.csv'), csvContent);
console.log('Saved: docs/data/environmental_experiments_results.csv');

// Save Telemetry Samples CSV
const telemHeaders = ['Condition', 'Time_s', 'RobotX', 'RobotY', 'HumanX', 'HumanY', 'SeparationDistance', 'RequiredDistance', 'RiskLevel', 'Friction_mu', 'Temp_C', 'SensorDeg_eta'];
const telemRows = allTelemetrySamples.map(s => [
  s.condition,
  s.time,
  s.robotX.toFixed(2),
  s.robotY.toFixed(2),
  s.humanX.toFixed(2),
  s.humanY.toFixed(2),
  s.distance.toFixed(2),
  s.requiredDistance.toFixed(2),
  s.riskLevel,
  s.friction,
  s.temperature,
  s.sensorDeg
]);
fs.writeFileSync(path.join(dataDir, 'environmental_telemetry_samples.csv'), [telemHeaders.join(','), ...telemRows.map(r => r.join(','))].join('\n'));
console.log('Saved: docs/data/environmental_telemetry_samples.csv');
