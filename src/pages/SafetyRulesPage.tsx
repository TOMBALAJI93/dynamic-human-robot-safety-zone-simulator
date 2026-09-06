import React, { useState } from 'react';
import { ShieldAlert, Save, RotateCcw, Calculator } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import type { SafetyRuleConfig } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_SAFETY_RULES } from '../engine/safety/safetyEngine';

interface SafetyRulesPageProps {
  language: Language;
}

export const SafetyRulesPage: React.FC<SafetyRulesPageProps> = ({ language }) => {
  const t = translations[language];
  const [rules, setRules] = useState<SafetyRuleConfig>(storageService.getSafetyRules());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    storageService.saveSafetyRules(rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setRules({ ...DEFAULT_SAFETY_RULES });
    storageService.saveSafetyRules(DEFAULT_SAFETY_RULES);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            {t.nav.safetyRules} Configuration & Mathematical Model
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Configure dynamic safety calculation parameters. Changes immediately calibrate the real-time simulation decision engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Rules Saved!' : t.common.save}</span>
          </button>
        </div>
      </div>

      {/* Model Formula Explanation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
          <Calculator className="w-4 h-4" />
          <span>PROTOTYPE SAFETY DECISION FORMULA</span>
        </div>
        <div className="p-3 rounded bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800/80">
          D_required = [ D_base + (v_robot * t_stop * w_r) + (v_human * t_react * w_h) + (t_react * f_r * 0.5) ] * TaskFactor * DirFactor + SafetyMargin
        </div>
        <p className="text-[11px] text-slate-400 italic">
          * Note: This is an explainable research prototype formula and does not claim legal industrial standard certification.
        </p>
      </div>

      {/* Config Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Parameters */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Kinematic & Buffer Parameters</h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Base Separation Distance (D_base)</span>
                <span className="font-mono text-cyan-400">{rules.baseDistance.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={rules.baseDistance}
                onChange={(e) => setRules({ ...rules, baseDistance: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Robot Speed Weight (w_r)</span>
                <span className="font-mono text-cyan-400">{rules.robotSpeedWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={rules.robotSpeedWeight}
                onChange={(e) => setRules({ ...rules, robotSpeedWeight: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Human Speed Weight (w_h)</span>
                <span className="font-mono text-cyan-400">{rules.humanSpeedWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={rules.humanSpeedWeight}
                onChange={(e) => setRules({ ...rules, humanSpeedWeight: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Safety Buffer Margin (SafetyMargin)</span>
                <span className="font-mono text-cyan-400">{rules.safetyMargin.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={rules.safetyMargin}
                onChange={(e) => setRules({ ...rules, safetyMargin: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Emergency Threshold (Immediate Stop)</span>
                <span className="font-mono text-rose-400">{rules.emergencyThreshold.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={rules.emergencyThreshold}
                onChange={(e) => setRules({ ...rules, emergencyThreshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Task Multipliers */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Human Task Hazard Multipliers</h2>

          <div className="space-y-2.5 text-xs">
            {Object.entries(rules.taskMultipliers).map(([taskName, mult]) => (
              <div key={taskName} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-700/60">
                <span className="text-slate-300 font-medium">{taskName}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.8"
                    max="2.5"
                    value={mult}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        taskMultipliers: {
                          ...rules.taskMultipliers,
                          [taskName]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-center font-mono text-cyan-400 font-bold"
                  />
                  <span className="text-slate-500">x</span>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-700/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rules.useDirectionalFactor}
                  onChange={(e) => setRules({ ...rules, useDirectionalFactor: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-slate-300 font-medium">Enable Dynamic Vector Directionality Expansion</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
