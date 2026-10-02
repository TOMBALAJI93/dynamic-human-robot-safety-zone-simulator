import React, { useState } from 'react';
import { ShieldAlert, Save, RotateCcw, Calculator, Thermometer, Layers } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import type { SafetyRuleConfig, EnvironmentalContext, FloorConditionType } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_SAFETY_RULES, DEFAULT_ENVIRONMENT_CONFIG, FLOOR_FRICTION_PRESETS } from '../engine/safety/safetyEngine';

interface SafetyRulesPageProps {
  language: Language;
}

export const SafetyRulesPage: React.FC<SafetyRulesPageProps> = ({ language }) => {
  const t = translations[language];
  const [rules, setRules] = useState<SafetyRuleConfig>(storageService.getSafetyRules());
  const [env, setEnv] = useState<EnvironmentalContext>(() => storageService.getEnvironmentConfig?.() || { ...DEFAULT_ENVIRONMENT_CONFIG });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    storageService.saveSafetyRules(rules);
    if (storageService.saveEnvironmentConfig) {
      storageService.saveEnvironmentConfig(env);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setRules({ ...DEFAULT_SAFETY_RULES });
    setEnv({ ...DEFAULT_ENVIRONMENT_CONFIG });
    storageService.saveSafetyRules(DEFAULT_SAFETY_RULES);
    if (storageService.saveEnvironmentConfig) {
      storageService.saveEnvironmentConfig(DEFAULT_ENVIRONMENT_CONFIG);
    }
  };

  const handleFloorChange = (cond: FloorConditionType) => {
    const preset = FLOOR_FRICTION_PRESETS[cond];
    setEnv(prev => ({
      ...prev,
      floorCondition: cond,
      frictionCoefficient: preset.friction,
      ambientNotes: preset.label + ' (' + preset.description + ')'
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              {t.nav.safetyRules} Configuration &amp; Environmental Physics Model
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Review 2 ISO/TS 15066 Calibration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Configure dynamic safety zone calculation parameters and plant ambient physics constraints. Changes immediately calibrate the multi-agent real-time simulation decision engine.
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
            <span>{saved ? 'Rules & Physics Saved!' : t.common.save}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Calculator className="w-4 h-4" />
            <span>REVIEW 2 EXPANDED DYNAMIC SAFETY FORMULA (ISO/TS 15066 + Plant Environmental Physics)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            &mu;={env.frictionCoefficient} &bull; T={env.temperature}&deg;C &bull; &eta;={(env.sensorDegradationFactor * 100).toFixed(0)}%
          </span>
        </div>
        <div className="p-3.5 rounded bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
          S = (v_r &bull; t_r) + [ (v_r &bull; t_stop &bull; w_r) / &mu;_floor ] + (v_h &bull; t_react &bull; w_h) + [ C_nominal &bull; &lambda;_ambient(T, P) ] + (C_sensor &bull; &eta;_degradation)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Kinematic &amp; Baseline Buffer Parameters</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Base Separation Distance (C_nominal)</span>
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
                <span>Safety Margin Padding</span>
                <span className="font-mono text-cyan-400">{rules.safetyMargin.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={rules.safetyMargin}
                onChange={(e) => setRules({ ...rules, safetyMargin: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>Environmental Physics Calibration</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Floor Traction Preset (&mu;_floor)</label>
              <select
                value={env.floorCondition}
                onChange={(e) => handleFloorChange(e.target.value as FloorConditionType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                <option value="DRY_CLEAN">Dry Clean Concrete (&mu; = 1.0)</option>
                <option value="WET_WASHDOWN">Wet Washdown Corridor (&mu; = 0.65)</option>
                <option value="OIL_CHEMICAL_SLICK">Oil / Chemical Slick (&mu; = 0.35)</option>
                <option value="COLD_FROST">Cold Storage Frost / Ice (&mu; = 0.20)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Process Ambient Temperature</span>
                <span className="font-mono text-cyan-400">{env.temperature}&deg;C</span>
              </div>
              <input
                type="range"
                min="-20"
                max="60"
                step="1"
                value={env.temperature}
                onChange={(e) => setEnv({ ...env, temperature: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Optical / LiDAR Sensor Degradation (&eta;)</span>
                <span className="font-mono text-amber-400">{(env.sensorDegradationFactor * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.05"
                value={env.sensorDegradationFactor}
                onChange={(e) => setEnv({ ...env, sensorDegradationFactor: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Atmospheric Barometric Pressure</span>
                <span className="font-mono text-cyan-400">{env.pressure.toFixed(2)} bar</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.01"
                value={env.pressure}
                onChange={(e) => setEnv({ ...env, pressure: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
