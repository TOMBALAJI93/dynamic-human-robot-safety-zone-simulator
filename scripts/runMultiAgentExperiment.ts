/**
 * DETERMINISTIC MULTI-AGENT EXPERIMENT RUNNER (Review 2 Phase 2)
 * Project: Dynamic Human-Robot Safety-Zone Simulator for Process Plants
 * 
 * Executes:
 * MULTI-EXP-01: Two AMRs crossing an intersection (2 AMRs + 2 Humans, Nominal Floor)
 * MULTI-EXP-02: One AMR moving through worker-heavy aisle (1 AMR + 2 Humans, Nominal Floor)
 * MULTI-EXP-03: Two AMRs and two humans converging near Reactor 02 under Wet Washdown (μ=0.65)
 */

import * as fs from 'fs';
import * as path from 'path';
import { PREDEFINED_SCENARIOS } from '../src/engine/scenarios/scenarioData';
import { evaluateMultiAgentSafetyState, DEFAULT_SAFETY_RULES, DEFAULT_ENVIRONMENT_CONFIG } from '../src/engine/safety/safetyEngine';
import { updateMultiAgentMotion } from '../src/engine/physics/motionEngine';
import type { EnvironmentalContext, RiskLevel } from '../src/types';

const multiScenarios = PREDEFINED_SCENARIOS.filter(s => s.id.startsWith('sc-multi-'));

interface MultiExpSummary {
  scenarioId: string;
  scenarioName: string;
  friction_mu: number;
  temperature_C: number;
  sensorDeg_eta: number;
  totalRobots: number;
  totalHumans: number;
  totalPairs: number;
  minSeparationDist_m: number;
  maxRequiredDist_m: number;
  highestThreatPair: string;
  peakRiskLevel: RiskLevel;
  firstWarningTime_s: number | null;
  firstUnsafeTime_s: number | null;
  unsafeDuration_s: number;
  meanEvalLatencyMicroseconds: number;
  maxEvalLatencyMicroseconds: number;
}

const results: MultiExpSummary[] = [];
const allSamples: any[] = [];

multiScenarios.forEach((sc) => {
  let robots = (sc.robots || [sc.initialRobot]).map(r => ({ ...r, isActive: true }));
  let humans = (sc.humans || [sc.initialHuman]).map(h => ({ ...h, isActive: true }));
  const env = sc.environment || DEFAULT_ENVIRONMENT_CONFIG;
  const rules = sc.safetyRules || DEFAULT_SAFETY_RULES;

  const dt = 0.1;
  const totalSteps = Math.floor(sc.duration / dt);

  let minDist = 999;
  let maxReq = 0;
  let firstWarn: number | null = null;
  let firstUnsafe: number | null = null;
  let unsafeCount = 0;
  let peakRisk: RiskLevel = 'SAFE';
  let highestPairId = 'None';
  let totalEvalTimeMs = 0;
  let maxEvalTimeMs = 0;

  const riskRank: Record<RiskLevel, number> = { SAFE: 0, WARNING: 1, UNSAFE: 2, EMERGENCY: 3 };

  for (let step = 0; step < totalSteps; step++) {
    const time = Number((step * dt).toFixed(1));
    const { robots: nextR, humans: nextH } = updateMultiAgentMotion(robots, humans, dt);
    robots = nextR;
    humans = nextH;

    const tStart = performance.now();
    const evalRes = evaluateMultiAgentSafetyState(rules, robots, humans, env);
    const tEnd = performance.now();
    const stepLatency = tEnd - tStart;
    totalEvalTimeMs += stepLatency;
    if (stepLatency > maxEvalTimeMs) maxEvalTimeMs = stepLatency;

    const threat = evalRes.highestThreatPair;
    const curDist = threat ? threat.currentDistance : 10.0;
    const reqDist = threat ? threat.requiredDynamicDistance : 2.5;

    if (curDist < minDist) minDist = curDist;
    if (reqDist > maxReq) maxReq = reqDist;

    if (evalRes.overallRiskLevel === 'WARNING' && firstWarn === null) firstWarn = time;
    if ((evalRes.overallRiskLevel === 'UNSAFE' || evalRes.overallRiskLevel === 'EMERGENCY') && firstUnsafe === null) firstUnsafe = time;
    if (evalRes.overallRiskLevel === 'UNSAFE' || evalRes.overallRiskLevel === 'EMERGENCY') unsafeCount++;

    if (riskRank[evalRes.overallRiskLevel] > riskRank[peakRisk]) {
      peakRisk = evalRes.overallRiskLevel;
      if (threat) highestPairId = threat.id;
    }

    allSamples.push({
      scenario: sc.id,
      time,
      overallRisk: evalRes.overallRiskLevel,
      highestThreatPair: threat ? threat.id : 'None',
      currentDistance: curDist,
      requiredDistance: reqDist,
      marginRemaining: evalRes.minimumMarginRemaining,
      evalLatencyMicroseconds: Math.round(stepLatency * 1000)
    });
  }

  const meanLatencyMicro = Math.round((totalEvalTimeMs / totalSteps) * 1000);
  const maxLatencyMicro = Math.round(maxEvalTimeMs * 1000);

  results.push({
    scenarioId: sc.id,
    scenarioName: sc.name,
    friction_mu: env.frictionCoefficient,
    temperature_C: env.temperature,
    sensorDeg_eta: env.sensorDegradationFactor,
    totalRobots: robots.length,
    totalHumans: humans.length,
    totalPairs: (robots.length * humans.length) + (robots.length * (robots.length - 1) / 2) + (humans.length * (humans.length - 1) / 2),
    minSeparationDist_m: Number(minDist.toFixed(2)),
    maxRequiredDist_m: Number(maxReq.toFixed(2)),
    highestThreatPair: highestPairId,
    peakRiskLevel: peakRisk,
    firstWarningTime_s: firstWarn,
    firstUnsafeTime_s: firstUnsafe,
    unsafeDuration_s: Number((unsafeCount * dt).toFixed(1)),
    meanEvalLatencyMicroseconds: meanLatencyMicro,
    maxEvalLatencyMicroseconds: maxLatencyMicro
  });
});

console.log('========================================================================================================');
console.log('DETERMINISTIC MULTI-AGENT EXPERIMENTAL RESULTS: MULTI-EXP-01, MULTI-EXP-02, MULTI-EXP-03');
console.log('========================================================================================================');
console.table(results);

const dataDir = path.join(process.cwd(), 'docs/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Export Summary CSV
const csvHeaders = [
  'ScenarioId',
  'ScenarioName',
  'Friction_mu',
  'Temp_C',
  'SensorDeg_eta',
  'TotalRobots',
  'TotalHumans',
  'TotalPairs',
  'MinSeparation_m',
  'MaxRequired_m',
  'HighestThreatPair',
  'PeakRiskLevel',
  'FirstWarningTime_s',
  'FirstUnsafeTime_s',
  'UnsafeDuration_s',
  'MeanEvalLatency_us',
  'MaxEvalLatency_us'
];

const csvRows = results.map(r => [
  r.scenarioId,
  `"${r.scenarioName}"`,
  r.friction_mu,
  r.temperature_C,
  r.sensorDeg_eta,
  r.totalRobots,
  r.totalHumans,
  r.totalPairs,
  r.minSeparationDist_m,
  r.maxRequiredDist_m,
  r.highestThreatPair,
  r.peakRiskLevel,
  r.firstWarningTime_s ?? 'None',
  r.firstUnsafeTime_s ?? 'None',
  r.unsafeDuration_s,
  r.meanEvalLatencyMicroseconds,
  r.maxEvalLatencyMicroseconds
]);

fs.writeFileSync(path.join(dataDir, 'multi_agent_experiments_results.csv'), [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n'));
console.log('Saved: docs/data/multi_agent_experiments_results.csv');
