import React from 'react';
import { 
  PlayCircle, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Ruler, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  FlaskConical,
  Grid,
  ClipboardList,
  SlidersHorizontal
} from 'lucide-react';
import type { NavPage, RiskLevel } from '../types';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import type { AppStats } from '../services/storageService';
import { storageService } from '../services/storageService';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
  language: Language;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, language }) => {
  const t = translations[language];
  const stats: AppStats = storageService.getStats();
  const observations = storageService.getFieldObservations();
  const activeScenario = PREDEFINED_SCENARIOS[0];

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.safetyStates.SAFE}
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.safetyStates.WARNING}
          </span>
        );
      case 'UNSAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800">
            <AlertOctagon className="w-3.5 h-3.5" />
            {t.safetyStates.UNSAFE}
          </span>
        );
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900 text-white animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" />
            {t.safetyStates.EMERGENCY}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & System Summary */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              {t.dashboard.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Research prototype evaluating adaptive, mathematical dynamic safety envelopes for human-robot co-working in high-hazard industrial environments. Avoids unnecessary production downtime while ensuring strict separation integrity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition hover:scale-105 active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{t.simulator.play}</span>
            </button>
            <button
              onClick={() => onNavigate('experiments')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm border border-slate-600 transition"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{t.common.runAll}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Simulations */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.dashboard.totalSimulations}</span>
            <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-900/40">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.totalSimulationsRun}</span>
            <span className="text-xs text-emerald-400 font-medium">+3 today</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Full scenario runs executed</p>
        </div>

        {/* Safe vs Restricted Ratio */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.dashboard.safeScenarios}</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.safeDetections}</span>
            <span className="text-xs text-slate-400">/ {stats.totalSimulationsRun} total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Normal operating clearance</p>
        </div>

        {/* Unnecessary Restrictions Saved */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.dashboard.unnecessaryRestrictionsSaved}</span>
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-900/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{stats.unnecessaryStopsAvoided}</span>
            <span className="text-xs text-cyan-300 font-medium">vs Static Zone</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Productive uptime preserved</p>
        </div>

        {/* Minimum Distance Recorded */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.dashboard.minDistance}</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-900/40">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{stats.minDistanceRecorded} m</span>
            <span className="text-xs text-amber-300">Min observed</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Closest proximity encounter</p>
        </div>
      </div>

      {/* Center 2-Column: Active Status & Quick Access Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Operating Scenario Details */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              {t.dashboard.operatingScenario}
            </h2>
            {getRiskBadge(activeScenario.expectedOutcome)}
          </div>

          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-slate-200 text-sm">{activeScenario.name}</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Duration: {activeScenario.duration}s
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeScenario.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Robot:</span>
                <span className="font-mono text-slate-200">{activeScenario.initialRobot.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Robot Speed:</span>
                <span className="font-mono text-slate-200">{activeScenario.initialRobot.currentSpeed} m/s</span>
              </div>
              <div>
                <span className="text-slate-500 block">Human Task:</span>
                <span className="font-mono text-slate-200">{activeScenario.initialHuman.task}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Human Speed:</span>
                <span className="font-mono text-slate-200">{activeScenario.initialHuman.currentSpeed} m/s</span>
              </div>
            </div>
          </div>

          {/* Core Workflow Steps */}
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Standard Evaluation Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 mx-auto mb-1 flex items-center justify-center font-bold text-[10px]">1</div>
                <span className="font-medium text-slate-300">Layout & Path</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 mx-auto mb-1 flex items-center justify-center font-bold text-[10px]">2</div>
                <span className="font-medium text-slate-300">Dynamic Model</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-amber-900/80 text-amber-300 mx-auto mb-1 flex items-center justify-center font-bold text-[10px]">3</div>
                <span className="font-medium text-slate-300">Risk Decision</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                <div className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 mx-auto mb-1 flex items-center justify-center font-bold text-[10px]">4</div>
                <span className="font-medium text-slate-300">Explain & Log</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigation Tools */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              {t.dashboard.quickLaunch}
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('simulator')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/60 border border-slate-700 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{t.nav.simulator}</span>
                    <span className="text-[10px] text-slate-400">Interactive 2D canvas simulation</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
              </button>

              <button
                onClick={() => onNavigate('layout')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/60 border border-slate-700 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{t.nav.layout}</span>
                    <span className="text-[10px] text-slate-400">Plant floor equipment & zones</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
              </button>

              <button
                onClick={() => onNavigate('experiments')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/60 border border-slate-700 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{t.nav.experiments}</span>
                    <span className="text-[10px] text-slate-400">Automated scenario test harness</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
              </button>

              <button
                onClick={() => onNavigate('sensitivity')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/60 border border-slate-700 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{t.nav.sensitivity}</span>
                    <span className="text-[10px] text-slate-400">Parameter influence & speed sweep</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
              </button>

              <button
                onClick={() => onNavigate('data_capture')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-700/60 border border-slate-700 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{t.nav.dataCapture}</span>
                    <span className="text-[10px] text-slate-400">Field-friendly offline records</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Field Observations Snapshot Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-purple-400" />
            {t.dashboard.recentEvents} / Observations
          </h2>
          <button
            onClick={() => onNavigate('data_capture')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            View All Records ({observations.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700/80 text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-2 px-3">Record ID</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Human Task</th>
                <th className="py-2 px-3">Robot Speed</th>
                <th className="py-2 px-3">Observed Proximity</th>
                <th className="py-2 px-3">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {observations.slice(0, 3).map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-300">{obs.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{obs.location}</td>
                  <td className="py-2.5 px-3 text-slate-300">{obs.humanTask}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{obs.robotSpeed} m/s</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">{obs.observedProximity} m</td>
                  <td className="py-2.5 px-3">{getRiskBadge((obs.safetyCondition as RiskLevel) || 'SAFE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
