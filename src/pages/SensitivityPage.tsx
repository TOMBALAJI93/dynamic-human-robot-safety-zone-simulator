import React, { useState } from 'react';
import { SlidersHorizontal, BarChart2, ArrowRight } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { DEFAULT_SAFETY_RULES, DEFAULT_ENVIRONMENT_CONFIG, calculateDynamicSafetyDistance, evaluateSafetyState } from '../engine/safety/safetyEngine';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import type { RiskLevel, DecisionTransition, EnvironmentalContext } from '../types';

interface SensitivityPageProps {
  language: Language;
}

type SensitivityParam = 'robotSpeed' | 'humanSpeed' | 'frictionCoefficient' | 'sensorDegradation' | 'temperature' | 'safetyMargin' | 'reactionTime';

export const SensitivityPage: React.FC<SensitivityPageProps> = ({ language }) => {
  const t = translations[language];
  const [targetParam, setTargetParam] = useState<SensitivityParam>('robotSpeed');

  const baseScenario = PREDEFINED_SCENARIOS[1]; // Scenario 2
  const testRules = { ...DEFAULT_SAFETY_RULES };
  const baseEnv: EnvironmentalContext = { ...DEFAULT_ENVIRONMENT_CONFIG };

  const sweepConfig: Record<SensitivityParam, { values: number[]; unit: string; name: string; description: string }> = {
    robotSpeed: { values: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5], unit: 'm/s', name: 'Robot Speed', description: 'Impact of AMR linear velocity on dynamic braking boundary' },
    humanSpeed: { values: [0.2, 0.6, 1.0, 1.4, 1.8, 2.2, 2.6], unit: 'm/s', name: 'Human Speed', description: 'Impact of worker walking velocity on intrusion safety buffer' },
    frictionCoefficient: { values: [1.0, 0.8, 0.65, 0.5, 0.35, 0.25, 0.20], unit: '\u03bc', name: 'Floor Friction (\u03bc)', description: 'Traction loss effects from dry concrete down to freezer frost' },
    sensorDegradation: { values: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], unit: '\u03b7', name: 'Sensor Degradation (\u03b7)', description: 'LiDAR/optical noise, particulate, and lens misting penalty' },
    temperature: { values: [-20, -5, 10, 25, 35, 45, 60], unit: '\u00b0C', name: 'Ambient Temperature', description: 'Thermal stress envelope modulating base clearance' },
    safetyMargin: { values: [0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.5], unit: 'm', name: 'Safety Margin', description: 'Static buffer cushion' },
    reactionTime: { values: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5], unit: 's', name: 'Human Reaction Time', description: 'Worker perception latency' },
  };

  const currentConfig = sweepConfig[targetParam];

  const sweepData = currentConfig.values.map((val) => {
    const dummyRobot = { ...baseScenario.initialRobot };
    const dummyHuman = { ...baseScenario.initialHuman };
    const customRules = { ...testRules };
    const customEnv = { ...baseEnv };

    if (targetParam === 'robotSpeed') dummyRobot.currentSpeed = val;
    else if (targetParam === 'humanSpeed') dummyHuman.currentSpeed = val;
    else if (targetParam === 'frictionCoefficient') customEnv.frictionCoefficient = val;
    else if (targetParam === 'sensorDegradation') customEnv.sensorDegradationFactor = val;
    else if (targetParam === 'temperature') customEnv.temperature = val;
    else if (targetParam === 'safetyMargin') customRules.safetyMargin = val;
    else if (targetParam === 'reactionTime') dummyHuman.reactionTime = val;

    const calc = calculateDynamicSafetyDistance(customRules, dummyRobot, dummyHuman, customEnv);
    const evalState = evaluateSafetyState(customRules, dummyRobot, dummyHuman, customEnv);

    return {
      paramValue: val,
      requiredDistance: calc.requiredDistance,
      minDistance: evalState.currentDistance,
      riskLevel: evalState.riskLevel,
    };
  });

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
        description: 'Decision transitioned from ' + curr.riskLevel + ' to ' + next.riskLevel + ' when ' + currentConfig.name + ' shifted from ' + curr.paramValue + currentConfig.unit + ' to ' + next.paramValue + currentConfig.unit + '.',
      });
    }
  }

  const maxDist = Math.max(...sweepData.map((d) => d.requiredDistance), 6.0);
  const minRequiredDist = Math.min(...sweepData.map((d) => d.requiredDistance));
  const maxRequiredDist = Math.max(...sweepData.map((d) => d.requiredDistance));
  const rangeRequiredDist = Math.round((maxRequiredDist - minRequiredDist) * 100) / 100;
  const paramRange = Math.round(Math.abs(currentConfig.values[currentConfig.values.length - 1] - currentConfig.values[0]) * 100) / 100;
  const influenceGradient = Math.round((rangeRequiredDist / Math.max(0.01, paramRange)) * 100) / 100;

  const getBadge = (level: RiskLevel) => {
    switch (level) {
      case 'EMERGENCY':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'UNSAFE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'WARNING':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            {t.nav.sensitivity} &amp; Environmental Parameter Sweeps
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
            Review 2 Extended
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Perform single-parameter sweeps to evaluate sensitivity gradients, safety zone expansion curves, and discrete decision boundary transitions under varying kinematic and environmental conditions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(sweepConfig) as SensitivityParam[]).map((pKey) => {
          const cfg = sweepConfig[pKey];
          const isSelected = targetParam === pKey;
          return (
            <button
              key={pKey}
              onClick={() => setTargetParam(pKey)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <span>{cfg.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4">
          <span className="text-slate-400 text-xs font-semibold">Evaluated Parameter</span>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">{currentConfig.name}</div>
          <p className="text-[11px] text-slate-500 mt-1">{currentConfig.description}</p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4">
          <span className="text-slate-400 text-xs font-semibold">Dynamic Zone Range (&Delta;S)</span>
          <div className="text-lg font-bold text-amber-300 mt-0.5">{minRequiredDist.toFixed(2)}m &rarr; {maxRequiredDist.toFixed(2)}m</div>
          <p className="text-[11px] text-slate-500 mt-1">Range span: {rangeRequiredDist.toFixed(2)} m</p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4">
          <span className="text-slate-400 text-xs font-semibold">Sensitivity Gradient</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{influenceGradient.toFixed(2)} m / {currentConfig.unit}</div>
          <p className="text-[11px] text-slate-500 mt-1">Zone expansion rate per unit increase</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Safety Distance &amp; Decision State Sweep Curve</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {sweepData.map((d, idx) => {
            const barWidthPct = Math.min(100, Math.max(10, (d.requiredDistance / maxDist) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">
                    {currentConfig.name} = <strong className="text-cyan-400">{d.paramValue}{currentConfig.unit}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Required: <strong className="text-slate-200">{d.requiredDistance.toFixed(2)}m</strong></span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getBadge(d.riskLevel)}`}>
                      {d.riskLevel}
                    </span>
                  </div>
                </div>
                <div className="h-4 bg-slate-950 rounded overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 via-amber-500 to-rose-600 rounded transition-all duration-300"
                    style={{ width: `${barWidthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>Decision State Transitions Detected ({decisionTransitions.length})</span>
        </div>

        {decisionTransitions.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            No state boundary flips detected within this range. Decision remains constant across tested sweep domain.
          </div>
        ) : (
          <div className="space-y-2">
            {decisionTransitions.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-700/60 rounded-lg p-3 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{t.description}</div>
                  <div className="text-[11px] text-slate-500">
                    Boundary crossing threshold &asymp; {((t.fromValue + t.toValue) / 2).toFixed(2)} {currentConfig.unit}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadge(t.fromState)}`}>{t.fromState}</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadge(t.toState)}`}>{t.toState}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
