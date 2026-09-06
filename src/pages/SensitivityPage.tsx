import React, { useState } from 'react';
import { SlidersHorizontal, BarChart2, Info, ArrowRight, AlertTriangle } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { DEFAULT_SAFETY_RULES, calculateDynamicSafetyDistance, evaluateSafetyState } from '../engine/safety/safetyEngine';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import type { RiskLevel, DecisionTransition } from '../types';

interface SensitivityPageProps {
  language: Language;
}

type SensitivityParam = 'robotSpeed' | 'humanSpeed' | 'safetyMargin' | 'reactionTime' | 'baseDistance';

export const SensitivityPage: React.FC<SensitivityPageProps> = ({ language }) => {
  const t = translations[language];
  const [targetParam, setTargetParam] = useState<SensitivityParam>('robotSpeed');

  const baseScenario = PREDEFINED_SCENARIOS[1]; // Use Scenario 2 (Converging) for decision transitions
  const testRules = { ...DEFAULT_SAFETY_RULES };

  // Sweep configurations
  const sweepConfig: Record<SensitivityParam, { values: number[]; unit: string; name: string }> = {
    robotSpeed: { values: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5], unit: 'm/s', name: 'Robot Speed' },
    humanSpeed: { values: [0.2, 0.6, 1.0, 1.4, 1.8, 2.2, 2.6], unit: 'm/s', name: 'Human Speed' },
    safetyMargin: { values: [0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.5], unit: 'm', name: 'Safety Margin' },
    reactionTime: { values: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5], unit: 's', name: 'Reaction Time' },
    baseDistance: { values: [0.5, 0.8, 1.2, 1.6, 2.0, 2.5, 3.0], unit: 'm', name: 'Base Distance' },
  };

  const currentConfig = sweepConfig[targetParam];

  // Calculate sweep outputs, required distance, and risk levels
  const sweepData = currentConfig.values.map((val) => {
    const dummyRobot = { ...baseScenario.initialRobot };
    const dummyHuman = { ...baseScenario.initialHuman };
    const customRules = { ...testRules };

    if (targetParam === 'robotSpeed') dummyRobot.currentSpeed = val;
    else if (targetParam === 'humanSpeed') dummyHuman.currentSpeed = val;
    else if (targetParam === 'safetyMargin') customRules.safetyMargin = val;
    else if (targetParam === 'reactionTime') dummyHuman.reactionTime = val;
    else if (targetParam === 'baseDistance') customRules.baseDistance = val;

    const calc = calculateDynamicSafetyDistance(customRules, dummyRobot, dummyHuman);
    const evalState = evaluateSafetyState(customRules, dummyRobot, dummyHuman);

    return {
      paramValue: val,
      requiredDistance: calc.requiredDistance,
      minDistance: evalState.currentDistance,
      riskLevel: evalState.riskLevel,
    };
  });

  // Decision Change Detection Algorithm
  const decisionTransitions: DecisionTransition[] = [];
  for (let i = 0; i < sweepData.length - 1; i++) {
    const curr = sweepData[i];
    const next = sweepData[i + 1];
    if (curr.riskLevel !== next.riskLevel) {
      decisionTransitions.push({
        fromState: curr.riskLevel,
        toState: next.riskLevel,
        fromValue: curr.paramValue,
        toValue: next.paramValue,
        description: `Decision transitioned from ${curr.riskLevel} to ${next.riskLevel} when ${currentConfig.name} increased from ${curr.paramValue}${currentConfig.unit} to ${next.paramValue}${currentConfig.unit}.`,
      });
    }
  }

  const maxDist = Math.max(...sweepData.map((d) => d.requiredDistance), 6.0);
  const minRequiredDist = Math.min(...sweepData.map((d) => d.requiredDistance));
  const maxRequiredDist = Math.max(...sweepData.map((d) => d.requiredDistance));
  const rangeRequiredDist = Math.round((maxRequiredDist - minRequiredDist) * 100) / 100;
  const paramRange = Math.round((currentConfig.values[currentConfig.values.length - 1] - currentConfig.values[0]) * 100) / 100;
  const influenceGradient = Math.round((rangeRequiredDist / paramRange) * 100) / 100;

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
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            {t.sensitivity.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.sensitivity.subtitle}
          </p>
        </div>

        {/* Parameter Selector Buttons */}
        <div className="flex items-center flex-wrap gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
          {(Object.keys(sweepConfig) as SensitivityParam[]).map((paramKey) => (
            <button
              key={paramKey}
              onClick={() => setTargetParam(paramKey)}
              className={`px-3 py-1.5 rounded font-medium transition ${
                targetParam === paramKey ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sweepConfig[paramKey].name}
            </button>
          ))}
        </div>
      </div>

      {/* Decision-Change Detection Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          {t.sensitivity.decisionTransitions} ({decisionTransitions.length} Identified)
        </h2>

        {decisionTransitions.length === 0 ? (
          <div className="text-xs text-slate-400 font-sans p-2 rounded bg-slate-950 border border-slate-800">
            {t.sensitivity.noTransitions}
          </div>
        ) : (
          <div className="space-y-2">
            {decisionTransitions.map((dt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-amber-900/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <span>{dt.description}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  {getBadge(dt.fromState)}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  {getBadge(dt.toState)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Sensitivity Bar Chart */}
      <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            {currentConfig.name} Sweep vs. Required Dynamic Safety Distance
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Tested Range: {currentConfig.values[0]}{currentConfig.unit} → {currentConfig.values[currentConfig.values.length - 1]}{currentConfig.unit}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {sweepData.map((pt, idx) => {
            const widthPercent = (pt.requiredDistance / maxDist) * 100;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>
                    {currentConfig.name}: <strong className="text-slate-100">{pt.paramValue} {currentConfig.unit}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span>State: {getBadge(pt.riskLevel)}</span>
                    <span className="font-bold text-cyan-400">{pt.requiredDistance.toFixed(2)} m</span>
                  </div>
                </div>
                <div className="h-4 bg-slate-900 rounded-md overflow-hidden border border-slate-800 flex">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded transition-all duration-300 flex items-center justify-end pr-2 text-[10px] text-slate-950 font-bold"
                  >
                    {pt.requiredDistance}m
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sensitivity Summary & Quantitative Metric Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Lowest Tested Value:</span>
          <span className="text-slate-200 font-bold text-sm">{currentConfig.values[0]} {currentConfig.unit}</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Highest Tested Value:</span>
          <span className="text-slate-200 font-bold text-sm">{currentConfig.values[currentConfig.values.length - 1]} {currentConfig.unit}</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Required Distance Range:</span>
          <span className="text-cyan-400 font-bold text-sm">{minRequiredDist}m → {maxRequiredDist}m (Δ {rangeRequiredDist}m)</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Sensitivity Gradient (ΔD/ΔP):</span>
          <span className="text-amber-400 font-bold text-sm">{influenceGradient} m/{currentConfig.unit}</span>
        </div>
      </div>

      {/* Technical Methodology Note */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
          <Info className="w-4 h-4" />
          <span>METHODOLOGY & INFLUENCE RANKING DEFINITION</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          The Sensitivity Gradient metric (delta required distance / delta parameter) quantitatively measures how steeply the safety envelope responds to parameter variation. In high-speed scenarios, <strong>Robot Speed</strong> exerts the highest first-order derivative impact due to the compound deceleration product (v_r * t_stop * w_r).
        </p>
      </div>
    </div>
  );
};
