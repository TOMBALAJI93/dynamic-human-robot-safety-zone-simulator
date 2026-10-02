import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  Download, 
  Trash2, 
  TrendingUp, 
  History, 
  Eye, 
  X, 
  Thermometer,
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import { 
  evaluateSafetyState, 
  evaluateMultiAgentSafetyState, 
  DEFAULT_SAFETY_RULES, 
  DEFAULT_ENVIRONMENT_CONFIG 
} from '../engine/safety/safetyEngine';
import { updateRobotMotion, updateHumanMotion, updateMultiAgentMotion } from '../engine/physics/motionEngine';
import type { ExperimentSummary, ExperimentRecord, RiskLevel } from '../types';
import { storageService } from '../services/storageService';

interface ExperimentsPageProps {
  language: Language;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({ language }) => {
  const t = translations[language];
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<ExperimentSummary[]>(storageService.getExperimentResults());
  const [history, setHistory] = useState<ExperimentRecord[]>(storageService.getExperimentHistory());
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'history'>('benchmarks');
  const [selectedRecord, setSelectedRecord] = useState<ExperimentRecord | null>(null);

  useEffect(() => {
    setHistory(storageService.getExperimentHistory());
  }, []);

  const runAllExperiments = () => {
    setIsRunning(true);
    const newResults: ExperimentSummary[] = [];

    PREDEFINED_SCENARIOS.forEach((scenario) => {
      const isMulti = (scenario.robots && scenario.robots.length > 1) || (scenario.humans && scenario.humans.length > 1);
      const env = scenario.environment || DEFAULT_ENVIRONMENT_CONFIG;
      const rules = scenario.safetyRules || DEFAULT_SAFETY_RULES;

      let minDistance = 999;
      let maxRequiredDistance = 0;
      let firstWarningTime: number | null = null;
      let firstUnsafeTime: number | null = null;
      let violationCount = 0;
      let maxRiskLevel: RiskLevel = 'SAFE';
      let baselineViolations = 0;
      let dynamicStopsAvoided = 0;

      const dt = 0.2;
      const totalSteps = Math.floor(scenario.duration / dt);

      if (isMulti) {
        let currentRobots = (scenario.robots || [scenario.initialRobot]).map(r => ({ ...r }));
        let currentHumans = (scenario.humans || [scenario.initialHuman]).map(h => ({ ...h }));

        for (let step = 0; step < totalSteps; step++) {
          const time = Math.round(step * dt * 10) / 10;
          const { robots: nextR, humans: nextH } = updateMultiAgentMotion(currentRobots, currentHumans, dt);
          currentRobots = nextR;
          currentHumans = nextH;

          const multiEval = evaluateMultiAgentSafetyState(rules, currentRobots, currentHumans, env);
          const threat = multiEval.highestThreatPair;
          const curDist = threat ? threat.currentDistance : 10.0;
          const reqDist = threat ? threat.requiredDynamicDistance : 2.5;

          if (curDist < minDistance) minDistance = curDist;
          if (reqDist > maxRequiredDistance) maxRequiredDistance = reqDist;

          if (curDist < 3.0) baselineViolations++;
          if (multiEval.overallRiskLevel === 'WARNING' && firstWarningTime === null) firstWarningTime = time;
          if ((multiEval.overallRiskLevel === 'UNSAFE' || multiEval.overallRiskLevel === 'EMERGENCY') && firstUnsafeTime === null) {
            firstUnsafeTime = time;
          }
          if (multiEval.overallRiskLevel === 'UNSAFE' || multiEval.overallRiskLevel === 'EMERGENCY') violationCount++;
          if (curDist >= reqDist && curDist < 3.0) dynamicStopsAvoided++;

          const riskWeights: Record<RiskLevel, number> = { SAFE: 0, WARNING: 1, UNSAFE: 2, EMERGENCY: 3 };
          if (riskWeights[multiEval.overallRiskLevel] > riskWeights[maxRiskLevel]) {
            maxRiskLevel = multiEval.overallRiskLevel;
          }
        }
      } else {
        let robot = { ...scenario.initialRobot };
        let human = { ...scenario.initialHuman };

        for (let step = 0; step < totalSteps; step++) {
          const time = Math.round(step * dt * 10) / 10;
          robot = updateRobotMotion(robot, dt);
          human = updateHumanMotion(human, dt);

          const evalResult = evaluateSafetyState(rules, robot, human, env);

          if (evalResult.currentDistance < minDistance) minDistance = evalResult.currentDistance;
          if (evalResult.requiredDynamicDistance > maxRequiredDistance) maxRequiredDistance = evalResult.requiredDynamicDistance;

          if (evalResult.currentDistance < 3.0) baselineViolations++;
          if (evalResult.riskLevel === 'WARNING' && firstWarningTime === null) firstWarningTime = time;
          if ((evalResult.riskLevel === 'UNSAFE' || evalResult.riskLevel === 'EMERGENCY') && firstUnsafeTime === null) {
            firstUnsafeTime = time;
          }
          if (evalResult.riskLevel === 'UNSAFE' || evalResult.riskLevel === 'EMERGENCY') violationCount++;
          if (evalResult.currentDistance >= evalResult.requiredDynamicDistance && evalResult.currentDistance < 3.0) {
            dynamicStopsAvoided++;
          }

          const riskWeights: Record<RiskLevel, number> = { SAFE: 0, WARNING: 1, UNSAFE: 2, EMERGENCY: 3 };
          if (riskWeights[evalResult.riskLevel] > riskWeights[maxRiskLevel]) {
            maxRiskLevel = evalResult.riskLevel;
          }
        }
      }

      newResults.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        initialRobotSpeed: scenario.initialRobot.currentSpeed,
        initialHumanSpeed: scenario.initialHuman.currentSpeed,
        minDistance: Number(minDistance.toFixed(2)),
        maxRequiredDistance: Number(maxRequiredDistance.toFixed(2)),
        firstWarningTime,
        firstUnsafeTime,
        violationCount,
        maxRiskLevel,
        finalDecision: maxRiskLevel,
        baselineViolations,
        dynamicUnnecessaryStopsAvoided: dynamicStopsAvoided,
        timestamp: new Date().toISOString(),
        environmentalCondition: env ? `Floor ${env.floorCondition} (μ=${env.frictionCoefficient}), ${env.temperature}°C` : 'Nominal',
        isMultiAgent: isMulti
      });
    });

    setResults(newResults);
    storageService.saveExperimentResults(newResults);
    setIsRunning(false);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all experiment run history?')) {
      storageService.clearExperimentHistory();
      setHistory([]);
      setSelectedRecord(null);
    }
  };

  const exportHistoryCSV = () => {
    if (history.length === 0) return;
    const csvContent = storageService.exportExperimentsToCSV(history);
    storageService.downloadCSV(csvContent, `safety-experiments-history-${Date.now()}.csv`);
  };

  const exportHistoryJSON = () => {
    if (history.length === 0) return;
    storageService.downloadJSON(history, `safety-experiments-history-${Date.now()}.json`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">
              {t.nav.experiments} & Empirical Benchmark Hub
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Review 2 Multi-Agent Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Evaluate predefined Single-Agent and Multi-Agent scenarios against ISO/TS 15066 safety rules, multi-entity pairwise arbitration, and plant environmental factors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAllExperiments}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow transition"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running Benchmarks...' : 'Run All Benchmark Scenarios'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'benchmarks'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Predefined Scenario Benchmarks ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'history'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Simulation Run History ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Predefined Scenario Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-10 text-center text-slate-400">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No Benchmark Runs Executed Yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Click "Run All Benchmark Scenarios" to run automated deterministic simulations.</p>
              <button
                onClick={runAllExperiments}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
              >
                Execute Suite
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((res) => {
                const scenario = PREDEFINED_SCENARIOS.find(s => s.id === res.scenarioId);
                const env = scenario?.environment;
                const isMulti = res.isMultiAgent;

                return (
                  <div
                    key={res.scenarioId}
                    className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-cyan-400 font-mono">{res.scenarioId}</span>
                        {isMulti && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono border border-purple-800">
                            Multi-Agent
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        res.maxRiskLevel === 'EMERGENCY' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        res.maxRiskLevel === 'UNSAFE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        res.maxRiskLevel === 'WARNING' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {res.maxRiskLevel}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{res.scenarioName}</h3>

                    {env && (
                      <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-900/60 font-mono">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>μ={env.frictionCoefficient} • {env.temperature}°C • η={(env.sensorDegradationFactor*100).toFixed(0)}%</span>
                      </div>
                    )}

                    <div className="bg-slate-900/80 rounded-lg p-3 space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Distance:</span>
                        <span className="text-cyan-300 font-bold">{res.minDistance} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Zone Req:</span>
                        <span className="text-slate-300">{res.maxRequiredDistance} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">First Warning:</span>
                        <span className="text-yellow-400">{res.firstWarningTime !== null ? res.firstWarningTime + 's' : 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Unsafe Violations:</span>
                        <span className={res.violationCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{res.violationCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Baseline Violations (3.0m):</span>
                        <span className="text-slate-400">{res.baselineViolations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dynamic Stops Avoided:</span>
                        <span className="text-emerald-400 font-bold">{res.dynamicUnnecessaryStopsAvoided}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Run History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">Total Recorded Runs: <strong className="text-white">{history.length}</strong></span>
            <div className="flex gap-2">
              <button
                onClick={exportHistoryCSV}
                disabled={history.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={exportHistoryJSON}
                disabled={history.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 disabled:opacity-40 text-rose-300 text-xs font-semibold rounded border border-rose-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-10 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No Simulation Runs Saved Yet</p>
              <p className="text-xs text-slate-500 mt-1">Run simulations on the Simulator page and click "Save Experiment Record" to log runs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-slate-800/70 border border-slate-700/70 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-700">
                  <tr>
                    <th className="p-3">Run Time</th>
                    <th className="p-3">Scenario</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Min Dist</th>
                    <th className="p-3">Max Risk</th>
                    <th className="p-3">Unsafe Count</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-700/40">
                      <td className="p-3 text-slate-400">{new Date(rec.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3 font-semibold text-white">{rec.scenarioName}</td>
                      <td className="p-3 text-amber-300">
                        {rec.config?.environmentalContext ? `μ=${rec.config.environmentalContext.frictionCoefficient}, ${rec.config.environmentalContext.temperature}°C` : 'Nominal'}
                      </td>
                      <td className="p-3">{rec.summary.duration}s</td>
                      <td className="p-3 text-cyan-400">{rec.summary.minDistance.toFixed(2)}m</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.summary.maxRiskLevel === 'EMERGENCY' ? 'bg-rose-950 text-rose-300' :
                          rec.summary.maxRiskLevel === 'UNSAFE' ? 'bg-amber-950 text-amber-300' :
                          rec.summary.maxRiskLevel === 'WARNING' ? 'bg-yellow-950 text-yellow-300' :
                          'bg-emerald-950 text-emerald-300'
                        }`}>
                          {rec.summary.maxRiskLevel}
                        </span>
                      </td>
                      <td className="p-3">{rec.summary.totalUnsafeDuration.toFixed(1)}s</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] font-sans inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Selected Run Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">{selectedRecord.scenarioName} - Run Details</h2>
                <span className="text-xs text-slate-400">{new Date(selectedRecord.timestamp).toLocaleString()} ({selectedRecord.id})</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div><span className="text-slate-400">Duration:</span> {selectedRecord.summary.duration} s</div>
              <div><span className="text-slate-400">Min Separation Distance:</span> <strong className="text-cyan-400">{selectedRecord.summary.minDistance.toFixed(2)} m</strong></div>
              <div><span className="text-slate-400">Max Risk Level:</span> <strong className="text-amber-400">{selectedRecord.summary.maxRiskLevel}</strong></div>
              <div><span className="text-slate-400">Warning Duration:</span> {selectedRecord.summary.totalWarningDuration.toFixed(1)} s</div>
              <div><span className="text-slate-400">Unsafe Duration:</span> {selectedRecord.summary.totalUnsafeDuration.toFixed(1)} s</div>
              <div><span className="text-slate-400">Stops Avoided Duration:</span> <strong className="text-emerald-400">{selectedRecord.summary.unnecessaryRestrictionsAvoidedDuration.toFixed(1)} s</strong></div>
              <div><span className="text-slate-400">Events Recorded:</span> {selectedRecord.summary.eventCount}</div>
              <div><span className="text-slate-400">Pairs Evaluated:</span> {selectedRecord.summary.multiAgentSummary?.totalPairsEvaluated || 1}</div>
            </div>

            {selectedRecord.config?.environmentalContext && (
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700 text-xs space-y-1">
                <div className="font-bold text-amber-300">Environmental Conditions:</div>
                <div className="font-mono text-slate-300">
                  Floor: {selectedRecord.config.environmentalContext.floorCondition} (μ={selectedRecord.config.environmentalContext.frictionCoefficient}) • Temp: {selectedRecord.config.environmentalContext.temperature}°C • Sensor Deg: {(selectedRecord.config.environmentalContext.sensorDegradationFactor * 100).toFixed(0)}%
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
