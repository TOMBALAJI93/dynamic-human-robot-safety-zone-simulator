import React from 'react';
import { Layers, ArrowRight, CheckCircle2, AlertTriangle, AlertOctagon, Bot, User } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import type { NavPage, RiskLevel } from '../types';

interface ScenariosPageProps {
  onNavigate: (page: NavPage) => void;
  language: Language;
}

export const ScenariosPage: React.FC<ScenariosPageProps> = ({ onNavigate, language }) => {
  const t = translations[language];

  const getBadge = (level: RiskLevel) => {
    switch (level) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> SAFE
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> WARNING
          </span>
        );
      case 'UNSAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
            <AlertOctagon className="w-3.5 h-3.5" /> UNSAFE
          </span>
        );
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-red-900 text-white">
            <AlertOctagon className="w-3.5 h-3.5" /> EMERGENCY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          {t.nav.scenarios} Definition & Benchmark Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Preset industrial operating scenarios designed to evaluate normal operations, converging worker proximity, and high-speed material handling.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {PREDEFINED_SCENARIOS.map((scenario, index) => (
          <div
            key={scenario.id}
            className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-6 shadow-md hover:border-slate-600 transition"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                    Scenario {index + 1}
                  </span>
                  <h2 className="text-lg font-bold text-white">{scenario.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl">{scenario.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {getBadge(scenario.expectedOutcome)}
                <button
                  onClick={() => onNavigate('simulator')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                >
                  <span>Launch in Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Entity parameters split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700/60 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-blue-400">
                  <Bot className="w-4 h-4" />
                  <span>Robot Configuration</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                  <div>Model: {scenario.initialRobot.name}</div>
                  <div>Speed: {scenario.initialRobot.currentSpeed} m/s</div>
                  <div>Stopping Time: {scenario.initialRobot.stoppingTime}s</div>
                  <div>Waypoints: {scenario.initialRobot.path.length} nodes</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <User className="w-4 h-4" />
                  <span>Human Configuration</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                  <div>Role: {scenario.initialHuman.name}</div>
                  <div>Task: {scenario.initialHuman.task}</div>
                  <div>Walk Speed: {scenario.initialHuman.currentSpeed} m/s</div>
                  <div>Reaction Time: {scenario.initialHuman.reactionTime}s</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
