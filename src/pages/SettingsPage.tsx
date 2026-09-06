import React, { useState } from 'react';
import { Settings, Globe, BookOpen, AlertCircle, FileText, CheckCircle2, RotateCcw, ShieldCheck, Clock } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface SettingsPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ language, onLanguageChange }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'settings' | 'evidence' | 'docs' | 'review1' | 'limitations'>('evidence');

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to reset all stored local data and restore defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-300" />
            {t.nav.settings} & Review 1 Evidence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System configuration, bilingual localization, mathematical methodology, and Review 1 audit evidence.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center flex-wrap gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'evidence' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Review 1 Evidence
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'settings' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'docs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture Docs
          </button>
          <button
            onClick={() => setActiveTab('review1')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'review1' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Milestone Report
          </button>
          <button
            onClick={() => setActiveTab('limitations')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'limitations' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Limitations
          </button>
        </div>
      </div>

      {/* Review 1 Evidence Panel (Section 14) */}
      {activeTab === 'evidence' && (
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Review 1 Deliverable Evidence Checklist
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                College Review 1 requires approximately 35% prototype completion. The project has verified all fundamental modules.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Review 1 Status: READY (~35%+ Target Achieved)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <h3 className="font-bold text-slate-200 font-sans flex items-center justify-between">
                <span>Core Functional Components</span>
                <span className="text-[11px] text-emerald-400">Status</span>
              </h3>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Core 2D Simulation Engine</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Interactive Waypoint Editor</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">3 Operating Scenarios</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">6 Failure & Edge Cases</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <h3 className="font-bold text-slate-200 font-sans flex items-center justify-between">
                <span>Experimental & Data Tooling</span>
                <span className="text-[11px] text-emerald-400">Status</span>
              </h3>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Experiment Benchmark Harness</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Sensitivity & Transition Detection</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Offline Field Data Capture & CSV</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Bilingual English + Tamil Support</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">External Stakeholder Cohort Trials</span>
                <span className="text-amber-400 font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> PENDING</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 font-sans">
            <strong className="text-slate-200">Evaluator Note:</strong> Complete technical evidence files, FMEA tables, experiment logs, and reproducible synthetic dataset scripts are stored in the project's <code className="text-cyan-300 font-mono">docs/</code> directory.
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selector */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Language & Localization (பன்மொழி அமைப்பு)
            </h2>
            <p className="text-xs text-slate-400">
              Select your interface display language. All navigation, buttons, metrics, and safety states switch instantly.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onLanguageChange('en')}
                className={`flex-1 p-3 rounded-lg border text-xs font-semibold text-left transition ${
                  language === 'en'
                    ? 'bg-blue-950/80 border-blue-600 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-sm">English</div>
                <div className="text-[11px] text-slate-400">Default International English</div>
              </button>

              <button
                onClick={() => onLanguageChange('ta')}
                className={`flex-1 p-3 rounded-lg border text-xs font-semibold text-left transition ${
                  language === 'ta'
                    ? 'bg-blue-950/80 border-blue-600 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-sm">தமிழ் (Tamil)</div>
                <div className="text-[11px] text-slate-400">முழு தமிழ் இடைமுகம்</div>
              </button>
            </div>
          </div>

          {/* Local Data Storage Reset */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Local Storage & State
            </h2>
            <p className="text-xs text-slate-400">
              Clear local cached layouts, recorded field observations, experiment history, and reset safety rules to original system parameters.
            </p>

            <div className="pt-2">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-rose-400 border border-slate-700 hover:border-rose-800 text-xs font-semibold rounded-lg transition"
              >
                Reset All Local Storage Data
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            System Architecture & Mathematical Safety Formulation
          </h2>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-100 text-sm">1. Core Objective</h3>
            <p>
              Traditional process plants often utilize static physical barriers or oversized fixed radial exclusion zones around Automated Guided Vehicles (AGVs) and Autonomous Mobile Robots (AMRs). While safe, fixed zones trigger frequent false-positive halts during benign parallel workflows. This simulator introduces a dynamic safety decision engine that dynamically scales the safety boundary as a continuous function of entity velocities, human task complexity, stopping distance, and approach angle.
            </p>

            <h3 className="font-semibold text-slate-100 text-sm">2. Mathematical Kinematic Model</h3>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
              D_req = [ D_base + (v_r * t_stop * w_r) + (v_h * t_react * w_h) + (0.5 * t_react * f_react) ] * TaskFactor * DirFactor + SafetyMargin
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-slate-200">D_base:</strong> Minimum physical separation (1.2m default).</li>
              <li><strong className="text-slate-200">v_r, v_h:</strong> Instantaneous velocities of robot and human.</li>
              <li><strong className="text-slate-200">t_stop, t_react:</strong> Deceleration time constant and worker perception-reaction latency.</li>
              <li><strong className="text-slate-200">DirFactor:</strong> Dynamic directional scalar expanding zone along the relative approach vector.</li>
            </ul>

            <h3 className="font-semibold text-slate-100 text-sm">3. Metric Definition: Prototype Unnecessary-Restriction Metric</h3>
            <p className="p-3 rounded bg-slate-950 border border-slate-800 text-cyan-300">
              <strong>Definition:</strong> An unnecessary restriction is recorded whenever the fixed static baseline zone (e.g. 4.5m) triggers an alert or halt, while the dynamic safety model simultaneously proves that current kinematic separation is mathematically safe under active velocities and trajectory directions.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'review1' && (
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-6 space-y-5 text-xs text-slate-300">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Review 1 Milestone Report (~35% Target Completion)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
              <h3 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Completed & Working Functionality
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Functional React + TypeScript + Tailwind application shell</li>
                <li>Interactive 2D Plant Layout Simulator with coordinate grid</li>
                <li>Interactive Waypoint Path Editor for Robot and Human paths</li>
                <li>Dynamic Safety Zone calculation mathematical engine</li>
                <li>Explainable decision engine (SAFE, WARNING, UNSAFE, EMERGENCY)</li>
                <li>Three distinct industrial operating scenarios</li>
                <li>Automated experiment test harness & baseline comparison</li>
                <li>Single-parameter sensitivity analysis with transition detection</li>
                <li>Six edge and failure cases with automated validation</li>
                <li>Offline field observation data capture & CSV/JSON export</li>
                <li>Full bilingual internationalization (English & Tamil)</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
              <h3 className="font-bold text-blue-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Upcoming Implementation (Post-Review 1)
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Multi-robot fleet traffic interaction and intersection priorities</li>
                <li>Dynamic equipment moving obstacles (e.g. overhead cranes)</li>
                <li>Formal external stakeholder testing and questionnaire evaluation</li>
                <li>Expanded multi-language support and audio siren alerts</li>
                <li>Automated high-resolution PDF compliance audit report generator</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'limitations' && (
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-6 space-y-3 text-xs leading-relaxed text-slate-300">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Project Assumptions & Safety Model Limitations
          </h2>
          <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-lg space-y-2">
            <p className="font-semibold text-amber-200">
              "This simulator is a research/prototype decision-support tool and is NOT a certified industrial safety system."
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>All simulation scenarios and telemetry use synthetic demonstration data.</li>
              <li>Safety rules and kinematic coefficients are prototype research assumptions.</li>
              <li>Real industrial deployment requires formal ISO 10218-1/2, ISO/TS 15066 certification, hardware-level failsafe relays, and certified safety laser scanners.</li>
              <li>Ground-truth industrial safety labels are not available in this prototype; therefore, the experiments evaluate consistency against configured decision rules rather than claiming certified real-world prediction accuracy.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
