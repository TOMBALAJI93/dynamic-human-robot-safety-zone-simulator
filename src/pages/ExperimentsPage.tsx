import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  Download, 
  Trash2, 
  TrendingUp, 
  History, 
  ShieldCheck, 
  Eye,
  X
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import { evaluateSafetyState, DEFAULT_SAFETY_RULES } from '../engine/safety/safetyEngine';
import { updateRobotMotion, updateHumanMotion } from '../engine/physics/motionEngine';
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
      let robot = { ...scenario.initialRobot };
      let human = { ...scenario.initialHuman };
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

      for (let step = 0; step < totalSteps; step++) {
        const time = Math.round(step * dt * 10) / 10;
        robot = updateRobotMotion(robot, dt);
        human = updateHumanMotion(human, dt);

        const evalResult = evaluateSafetyState(rules, robot, human);
        if (evalResult.currentDistance < minDistance) {
          minDistance = evalResult.currentDistance;
        }
        if (evalResult.requiredDynamicDistance > maxRequiredDistance) {
          maxRequiredDistance = evalResult.requiredDynamicDistance;
        }

        if (evalResult.riskLevel === 'WARNING' && firstWarningTime === null) {
          firstWarningTime = time;
        }
        if ((evalResult.riskLevel === 'UNSAFE' || evalResult.riskLevel === 'EMERGENCY')) {
          if (firstUnsafeTime === null) firstUnsafeTime = time;
          violationCount++;
        }

        if (evalResult.riskLevel === 'EMERGENCY') maxRiskLevel = 'EMERGENCY';
        else if (evalResult.riskLevel === 'UNSAFE' && maxRiskLevel !== 'EMERGENCY') maxRiskLevel = 'UNSAFE';
        else if (evalResult.riskLevel === 'WARNING' && maxRiskLevel === 'SAFE') maxRiskLevel = 'WARNING';

        if (evalResult.baselineRiskLevel === 'UNSAFE' || evalResult.baselineRiskLevel === 'EMERGENCY') {
          baselineViolations++;
        }
        if (evalResult.baselineRiskLevel === 'UNSAFE' && evalResult.riskLevel === 'SAFE') {
          dynamicStopsAvoided++;
        }
      }

      newResults.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        initialRobotSpeed: scenario.initialRobot.currentSpeed,
        initialHumanSpeed: scenario.initialHuman.currentSpeed,
        minDistance: Math.round(minDistance * 100) / 100,
        maxRequiredDistance: Math.round(maxRequiredDistance * 100) / 100,
        firstWarningTime,
        firstUnsafeTime,
        violationCount,
        maxRiskLevel,
        finalDecision: maxRiskLevel,
        dynamicUnnecessaryStopsAvoided: Math.round(dynamicStopsAvoided * dt * 10) / 10,
        baselineViolations,
        timestamp: new Date().toLocaleTimeString(),
      });
    });

    setResults(newResults);
    storageService.saveExperimentResults(newResults);
    setIsRunning(false);
  };

  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('No experiment history records to export. Run simulations or benchmarks first.');
      return;
    }
    const csv = storageService.exportExperimentsToCSV(history);
    storageService.downloadCSV(csv, `plant_safety_experiments_${Date.now()}.csv`);
  };

  const handleDeleteHistoryItem = (id: string) => {
    storageService.deleteExperimentRecord(id);
    setHistory(storageService.getExperimentHistory());
    if (selectedRecord?.id === id) setSelectedRecord(null);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all saved experiment history?')) {
      storageService.clearExperimentHistory();
      setHistory([]);
      setSelectedRecord(null);
    }
  };

  const getBadge = (level: RiskLevel) => {
    switch (level) {
      case 'SAFE':
        return <span className="text-emerald-400 font-bold">SAFE</span>;
      case 'WARNING':
        return <span className="text-amber-400 font-bold">WARNING</span>;
      case 'UNSAFE':
        return <span className="text-rose-400 font-bold">UNSAFE</span>;
      case 'EMERGENCY':
        return <span className="text-red-400 font-bold">EMERGENCY</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
            {t.experiments.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            {t.experiments.subtitle}
          </p>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'benchmarks' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Batch Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'history' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Saved History ({history.length})
            </button>
          </div>

          <button
            onClick={runAllExperiments}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow transition"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running Batch...' : t.experiments.runBatch}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.experiments.exportCSV}</span>
          </button>
        </div>
      </div>

      {activeTab === 'benchmarks' && (
        <>
          {/* Results Table */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>{t.experiments.batchResults} ({results.length} Scenarios Executed)</span>
              <span className="text-xs font-normal text-slate-400">Deterministic Simulation Engine</span>
            </h2>

            {results.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No benchmark run yet. Click "{t.experiments.runBatch}" to execute batch simulations.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-3">Scenario</th>
                      <th className="py-2.5 px-3">Robot Spd</th>
                      <th className="py-2.5 px-3">Min Dist</th>
                      <th className="py-2.5 px-3">Max Req Dist</th>
                      <th className="py-2.5 px-3">1st Warning</th>
                      <th className="py-2.5 px-3">1st Unsafe</th>
                      <th className="py-2.5 px-3">Decision</th>
                      <th className="py-2.5 px-3 text-cyan-400">Stops Avoided</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {results.map((res, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-sans font-medium text-slate-200">{res.scenarioName}</td>
                        <td className="py-3 px-3 text-slate-300">{res.initialRobotSpeed} m/s</td>
                        <td className="py-3 px-3 font-bold text-amber-300">{res.minDistance} m</td>
                        <td className="py-3 px-3 text-slate-300">{res.maxRequiredDistance} m</td>
                        <td className="py-3 px-3 text-slate-400">{res.firstWarningTime !== null ? `${res.firstWarningTime}s` : 'None'}</td>
                        <td className="py-3 px-3 text-slate-400">{res.firstUnsafeTime !== null ? `${res.firstUnsafeTime}s` : 'None'}</td>
                        <td className="py-3 px-3">{getBadge(res.finalDecision)}</td>
                        <td className="py-3 px-3 text-cyan-400 font-bold">+{res.dynamicUnnecessaryStopsAvoided}s saved</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Explicit Definition of Unnecessary Restriction Metric */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              {t.experiments.baselineComparison}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>{t.experiments.unnecessaryRestrictionsDesc}</strong>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              In Scenario 1 (Normal Operation), the fixed static 4.5m circular envelope would enforce emergency deceleration even though human inspection workers are on a safe parallel aisle. The dynamic model reduced these false restrictions while maintaining strict zero-tolerance separation integrity in converging scenarios.
            </p>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              {t.experiments.history} ({history.length} Runs Persisted)
            </h2>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.experiments.clearHistory}</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No saved experiment runs yet. Run a simulation and click "Save to Experiment History" in the Simulator.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Scenario</th>
                    <th className="py-2.5 px-3">Robot Spd</th>
                    <th className="py-2.5 px-3">Min Dist</th>
                    <th className="py-2.5 px-3">Max State</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-300">{rec.id}</td>
                      <td className="py-2.5 px-3 text-slate-400">{rec.timestamp}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{rec.scenarioName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{rec.config.robotSpeed} m/s</td>
                      <td className="py-2.5 px-3 font-bold text-amber-300">{rec.summary.minDistance} m</td>
                      <td className="py-2.5 px-3">{getBadge(rec.summary.maxRiskLevel)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition"
                            title="View reproducibility parameters"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHistoryItem(rec.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950 rounded transition"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reproducibility Detail Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Experiment Reproducibility Dossier: {selectedRecord.id}
                </h3>
                <span className="text-[11px] text-slate-400">{selectedRecord.scenarioName} — {selectedRecord.timestamp}</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config & Outcome Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-blue-400 font-bold block mb-1">Configuration Parameters</span>
                <div>Robot Speed: {selectedRecord.config.robotSpeed} m/s</div>
                <div>Human Speed: {selectedRecord.config.humanSpeed} m/s</div>
                <div>Reaction Time: {selectedRecord.config.reactionTime} s</div>
                <div>Stopping Time: {selectedRecord.config.stoppingTime} s</div>
                <div>Safety Margin: {selectedRecord.config.safetyMargin} m</div>
                <div>Human Task: {selectedRecord.config.humanTask}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold block mb-1">Recorded Simulation Outcomes</span>
                <div>Min Separation: {selectedRecord.summary.minDistance} m</div>
                <div>Min Safety Margin: {selectedRecord.summary.minSafetyMargin} m</div>
                <div>1st Warning Time: {selectedRecord.summary.firstWarningTime ?? 'None'}</div>
                <div>1st Unsafe Time: {selectedRecord.summary.firstUnsafeTime ?? 'None'}</div>
                <div>Unsafe Duration: {selectedRecord.summary.totalUnsafeDuration} s</div>
                <div>Max Risk State: {selectedRecord.summary.maxRiskLevel}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
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
