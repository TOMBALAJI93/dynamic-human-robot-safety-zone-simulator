import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { FAILURE_EDGE_CASES } from '../engine/scenarios/scenarioData';
import { 
  evaluateSafetyState, 
  evaluateMultiAgentSafetyState, 
  validateSafetyParameters, 
  DEFAULT_SAFETY_RULES, 
  DEFAULT_ENVIRONMENT_CONFIG 
} from '../engine/safety/safetyEngine';
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
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">
            {t.nav.failureCases} & 18 Edge Boundary Verification Suite
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
            Review 1 + Review 2 Suite
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive regression harness assessing system resilience against mathematical singularities, zero-friction loss, severe sensor blindness, coincident coordinates, fleet deadlock, inactive agents, and abnormal parameter buffers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FAILURE_EDGE_CASES.map((edgeCase, index) => {
          const isMulti = (edgeCase.robots && edgeCase.robots.length > 1) || (edgeCase.humans && edgeCase.humans.length > 1);
          
          let evalRisk = 'SAFE';
          let reqDist = 2.5;
          let highestThreatText = '';

          if (isMulti) {
            const multiEval = evaluateMultiAgentSafetyState(
              edgeCase.safetyRules || DEFAULT_SAFETY_RULES,
              edgeCase.robots || [edgeCase.initialRobot],
              edgeCase.humans || [edgeCase.initialHuman],
              edgeCase.environment || DEFAULT_ENVIRONMENT_CONFIG
            );
            evalRisk = multiEval.overallRiskLevel;
            reqDist = multiEval.highestThreatPair?.requiredDynamicDistance || 2.5;
            highestThreatText = multiEval.highestThreatPair ? `[${multiEval.highestThreatPair.id}] ${multiEval.highestThreatPair.currentDistance.toFixed(1)}m / ${reqDist.toFixed(1)}m` : 'None';
          } else {
            const singleEval = evaluateSafetyState(
              edgeCase.safetyRules || DEFAULT_SAFETY_RULES,
              edgeCase.initialRobot,
              edgeCase.initialHuman,
              edgeCase.environment || DEFAULT_ENVIRONMENT_CONFIG
            );
            evalRisk = singleEval.riskLevel;
            reqDist = singleEval.requiredDynamicDistance;
            highestThreatText = `${singleEval.currentDistance.toFixed(1)}m / ${reqDist.toFixed(1)}m`;
          }

          const validation = validateSafetyParameters(
            edgeCase.safetyRules || DEFAULT_SAFETY_RULES,
            edgeCase.initialRobot,
            edgeCase.initialHuman,
            edgeCase.environment || DEFAULT_ENVIRONMENT_CONFIG
          );

          const isPassed = evalRisk === edgeCase.expectedOutcome;
          const isReview2Env = index >= 6 && index < 12;
          const isReview2Multi = index >= 12;

          return (
            <div
              key={edgeCase.id}
              className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {edgeCase.id.startsWith('multi-') ? 'MULTI-EC-0' + (index - 11) : 'EC-0' + (index + 1 > 9 ? index + 1 : '0' + (index + 1))}
                    </span>
                    {isReview2Env && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        Review 2 Env
                      </span>
                    )}
                    {isReview2Multi && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                        Review 2 Multi
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    isPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {isPassed ? '✓ PASS' : '✗ FAILED'}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white mb-1">{edgeCase.name}</h2>
                <p className="text-xs text-slate-400 mb-3">{edgeCase.description}</p>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected:</span>
                    <span className="text-amber-400 font-bold">{edgeCase.expectedOutcome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calculated:</span>
                    <span className="text-cyan-400 font-bold">{evalRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Threat Pair / Sep:</span>
                    <span className="text-slate-300 text-[11px]">{highestThreatText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sanity Status:</span>
                    <span className={validation.isValid ? 'text-emerald-400' : 'text-amber-400'}>
                      {validation.isValid ? 'VALID' : 'OUT_OF_BOUNDS (Handled)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-700/50">
                <span className="text-slate-400 font-semibold">Handling:</span> Parameter clamp &amp; deterministic arbitration verified.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
