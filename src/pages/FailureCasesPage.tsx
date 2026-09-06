import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { FAILURE_EDGE_CASES } from '../engine/scenarios/scenarioData';
import { evaluateSafetyState, validateSafetyParameters, DEFAULT_SAFETY_RULES } from '../engine/safety/safetyEngine';
import type { NavPage } from '../types';

interface FailureCasesPageProps {
  onNavigate?: (page: NavPage) => void;
  language: Language;
}

export const FailureCasesPage: React.FC<FailureCasesPageProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          {t.nav.failureCases} & Edge Boundary Verification Suite
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive regression harness assessing system resilience against mathematical singularities, zero-speed conditions, negative sensor telemetry, boundary overflows, and extreme parameter buffers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FAILURE_EDGE_CASES.map((edgeCase, index) => {
          const evalResult = evaluateSafetyState(
            edgeCase.safetyRules || DEFAULT_SAFETY_RULES,
            edgeCase.initialRobot,
            edgeCase.initialHuman
          );
          const validation = validateSafetyParameters(
            edgeCase.safetyRules || DEFAULT_SAFETY_RULES,
            edgeCase.initialRobot,
            edgeCase.initialHuman
          );
          const isPassed = evalResult.riskLevel === edgeCase.expectedOutcome;

          return (
            <div
              key={edgeCase.id}
              className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    Edge Case {index + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    isPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {isPassed ? '✓ PASS (Expected Result)' : '✗ FAILED'}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white mb-1">{edgeCase.name}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{edgeCase.description}</p>
              </div>

              {/* Technical Execution Evaluation */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs font-mono">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Separation:</span>
                    <span className="text-slate-200 font-bold">{evalResult.currentDistance.toFixed(2)} m</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Required Dyn:</span>
                    <span className="text-cyan-400 font-bold">{evalResult.requiredDynamicDistance.toFixed(2)} m</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Decision:</span>
                    <span className={`font-bold ${
                      evalResult.riskLevel === 'EMERGENCY' ? 'text-red-400' :
                      evalResult.riskLevel === 'UNSAFE' ? 'text-rose-400' :
                      evalResult.riskLevel === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {evalResult.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Validation Warnings */}
                {!validation.isValid && (
                  <div className="p-2 rounded bg-amber-950/60 border border-amber-800/80 text-[11px] text-amber-300">
                    <span className="font-bold">Input Validation Warning: </span>
                    {validation.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
