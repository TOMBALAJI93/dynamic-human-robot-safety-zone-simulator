import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Clock, 
  HelpCircle,
  FileText,
  Sparkles,
  BarChart3,
  Layers,
  Thermometer,
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import { storageService } from '../services/storageService';
import type { 
  StakeholderEvaluation, 
  StakeholderRole, 
  StakeholderLikertResponses, 
  StakeholderQualitativeFeedback,
  StakeholderValidationSummary
} from '../types';

interface StakeholderFeedbackPageProps {
  language: Language;
}

const DEFAULT_LIKERT: StakeholderLikertResponses = {
  q1_clarity: 0,
  q2_warning_reasons: 0,
  q3_environmental_controls: 0,
  q4_multi_agent_threat: 0,
  q5_static_vs_dynamic: 0,
  q6_ui_usability: 0,
  q7_process_plant_usefulness: 0,
  q8_configurability: 0,
  q9_bilingual_support: 0,
  q10_overall_utility: 0,
};

const DEFAULT_QUALITATIVE: StakeholderQualitativeFeedback = {
  easyToUnderstand: '',
  difficultToUnderstand: '',
  mostUsefulFeature: '',
  featureNeedingImprovement: '',
  additionalInfoNeeded: '',
  additionalComments: '',
};

export const StakeholderFeedbackPage: React.FC<StakeholderFeedbackPageProps> = ({ language }) => {
  const t = translations[language];

  // Form State
  const [role, setRole] = useState<StakeholderRole>('EHS_MANAGER');
  const [roleOtherText, setRoleOtherText] = useState<string>('');
  const [scenarioEvaluated, setScenarioEvaluated] = useState<string>(PREDEFINED_SCENARIOS[0]?.id || 'sc-01-crossing');
  const [simulationMode, setSimulationMode] = useState<'SINGLE_AGENT' | 'MULTI_AGENT'>('MULTI_AGENT');
  const [environmentalCondition, setEnvironmentalCondition] = useState<string>('Dry Concrete (μ=1.0)');
  const [likertScores, setLikertScores] = useState<StakeholderLikertResponses>({ ...DEFAULT_LIKERT });
  const [qualitative, setQualitative] = useState<StakeholderQualitativeFeedback>({ ...DEFAULT_QUALITATIVE });
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Storage State
  const [evaluations, setEvaluations] = useState<StakeholderEvaluation[]>([]);
  const [summary, setSummary] = useState<StakeholderValidationSummary>(storageService.getStakeholderSummary([]));

  useEffect(() => {
    loadEvaluations();
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const loadEvaluations = () => {
    const loaded = storageService.getStakeholderEvaluations();
    setEvaluations(loaded);
    setSummary(storageService.getStakeholderSummary(loaded));
  };

  const handleLikertChange = (key: keyof StakeholderLikertResponses, value: number) => {
    setLikertScores(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleQualitativeChange = (key: keyof StakeholderQualitativeFeedback, value: string) => {
    setQualitative(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isFormComplete = () => {
    // Complete if all 10 questions have valid 1-5 ratings
    const scores = Object.values(likertScores);
    return scores.every(score => score >= 1 && score <= 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scores = Object.values(likertScores);
    const answeredCount = scores.filter(s => s >= 1 && s <= 5).length;

    if (answeredCount === 0) {
      alert('Please answer at least one evaluation question before submitting.');
      return;
    }

    const newEvaluation: StakeholderEvaluation = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      role,
      roleOtherText: role === 'OTHER' ? roleOtherText : undefined,
      scenarioEvaluated,
      simulationMode,
      environmentalCondition,
      durationSeconds: sessionDuration,
      likertScores: { ...likertScores },
      qualitative: { ...qualitative },
      isComplete: isFormComplete(),
    };

    storageService.saveStakeholderEvaluation(newEvaluation);
    loadEvaluations();
    setSubmissionFeedback(t.stakeholder.submittedSuccess);
    setTimeout(() => setSubmissionFeedback(null), 4000);

    // Reset Form to fresh state
    setLikertScores({ ...DEFAULT_LIKERT });
    setQualitative({ ...DEFAULT_QUALITATIVE });
    setRoleOtherText('');
  };

  const handleResetForm = () => {
    if (window.confirm('Reset all form fields to default?')) {
      setLikertScores({ ...DEFAULT_LIKERT });
      setQualitative({ ...DEFAULT_QUALITATIVE });
      setRoleOtherText('');
    }
  };

  const handleClearEvaluations = () => {
    if (window.confirm('Are you sure you want to delete all stored stakeholder evaluations? This cannot be undone.')) {
      storageService.clearStakeholderEvaluations();
      loadEvaluations();
    }
  };

  const handleExportCSV = () => {
    const csv = storageService.exportStakeholderToCSV(evaluations);
    storageService.downloadCSV(csv, `stakeholder_evaluations_${Date.now()}.csv`);
  };

  const handleExportJSON = () => {
    const json = storageService.exportStakeholderToJSON(evaluations);
    storageService.downloadJSON(JSON.parse(json), `stakeholder_evaluations_${Date.now()}.json`);
  };

  const questionsList: { key: keyof StakeholderLikertResponses; text: string }[] = [
    { key: 'q1_clarity', text: t.stakeholder.questions.q1 },
    { key: 'q2_warning_reasons', text: t.stakeholder.questions.q2 },
    { key: 'q3_environmental_controls', text: t.stakeholder.questions.q3 },
    { key: 'q4_multi_agent_threat', text: t.stakeholder.questions.q4 },
    { key: 'q5_static_vs_dynamic', text: t.stakeholder.questions.q5 },
    { key: 'q6_ui_usability', text: t.stakeholder.questions.q6 },
    { key: 'q7_process_plant_usefulness', text: t.stakeholder.questions.q7 },
    { key: 'q8_configurability', text: t.stakeholder.questions.q8 },
    { key: 'q9_bilingual_support', text: t.stakeholder.questions.q9 },
    { key: 'q10_overall_utility', text: t.stakeholder.questions.q10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                {t.stakeholder.title}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                Review 2 Phase 3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {t.stakeholder.subtitle}
            </p>
          </div>

          {/* Validation Status Badge */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-right">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.stakeholder.validationStatus}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {summary.status === 'PENDING_ACTUAL_TRIALS' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  {t.stakeholder.statusPending}
                </span>
              ) : summary.status === 'IN_PROGRESS' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-800/80">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {t.stakeholder.statusInProgress}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {t.stakeholder.statusAvailable} ({summary.completedEvaluations})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Prototype Purpose Notice */}
        <div className="mt-4 p-3.5 rounded-lg bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200/90 leading-relaxed">
            <span className="font-semibold text-white mr-1">Evaluation Objective:</span>
            {t.stakeholder.purposeNotice}
          </div>
        </div>
      </div>

      {/* Actual Data Summary Panel */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">{t.stakeholder.summaryTitle}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={evaluations.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              {t.stakeholder.exportCSV}
            </button>
            <button
              onClick={handleExportJSON}
              disabled={evaluations.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              {t.stakeholder.exportJSON}
            </button>
            {evaluations.length > 0 && (
              <button
                onClick={handleClearEvaluations}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800 hover:bg-rose-900/60 text-xs text-rose-300 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                {t.stakeholder.clearAll}
              </button>
            )}
          </div>
        </div>

        {summary.completedEvaluations === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-amber-300/90 font-medium">
              {t.stakeholder.noFabricatedDataNotice}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
              {t.stakeholder.noResponsesYet}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3">
                <div className="text-[11px] text-slate-400">{t.stakeholder.totalResponses}</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{summary.totalResponses}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3">
                <div className="text-[11px] text-slate-400">{t.stakeholder.completedEvaluations}</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{summary.completedEvaluations}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3">
                <div className="text-[11px] text-slate-400">{t.stakeholder.overallAverage}</div>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                  {summary.overallAverageScore?.toFixed(2)} / 5.00
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3">
                <div className="text-[11px] text-slate-400">Role Representation</div>
                <div className="text-xs text-slate-300 font-mono mt-1 space-y-0.5">
                  <div>EHS: {summary.roleDistribution.EHS_MANAGER}</div>
                  <div>Operator: {summary.roleDistribution.PLANT_OPERATOR}</div>
                  <div>Maintenance: {summary.roleDistribution.MAINTENANCE_ENGINEER}</div>
                </div>
              </div>
            </div>

            {/* Question Breakdown Bars */}
            {summary.averageScores && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  {t.stakeholder.questionAverages}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {questionsList.map((q, idx) => {
                    const avg = summary.averageScores ? summary.averageScores[q.key] : 0;
                    const pct = (avg / 5) * 100;
                    return (
                      <div key={q.key} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span className="truncate max-w-[280px]">Q{idx + 1}: {q.text.split(':')[1] || q.text}</span>
                          <span className="font-mono font-bold text-cyan-400 ml-2">{avg.toFixed(2)} / 5</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Feedback Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Record Evaluator Response</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Session: {Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s</span>
          </div>
        </div>

        {submissionFeedback && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{submissionFeedback}</span>
          </div>
        )}

        {/* Section 1: Role & Session Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {t.stakeholder.roleSelect} <span className="text-rose-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StakeholderRole)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="EHS_MANAGER">{t.stakeholder.roles.EHS_MANAGER}</option>
              <option value="PLANT_OPERATOR">{t.stakeholder.roles.PLANT_OPERATOR}</option>
              <option value="MAINTENANCE_ENGINEER">{t.stakeholder.roles.MAINTENANCE_ENGINEER}</option>
              <option value="OTHER">{t.stakeholder.roles.OTHER}</option>
            </select>

            {role === 'OTHER' && (
              <input
                type="text"
                value={roleOtherText}
                onChange={(e) => setRoleOtherText(e.target.value)}
                placeholder={t.stakeholder.otherRolePlaceholder}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mt-2"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                {t.stakeholder.scenarioEvaluated}
              </label>
              <select
                value={scenarioEvaluated}
                onChange={(e) => setScenarioEvaluated(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {PREDEFINED_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                {t.stakeholder.simulationMode}
              </label>
              <select
                value={simulationMode}
                onChange={(e) => setSimulationMode(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="SINGLE_AGENT">Single-Agent (Baseline)</option>
                <option value="MULTI_AGENT">Multi-Agent Swarm (Review 2)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                {t.stakeholder.environmentalCondition}
              </label>
              <select
                value={environmentalCondition}
                onChange={(e) => setEnvironmentalCondition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Dry Concrete (μ=1.0)">Dry Concrete (μ=1.0)</option>
                <option value="Wet Washdown Tile (μ=0.65)">Wet Washdown Tile (μ=0.65)</option>
                <option value="Oil Slick Leakage (μ=0.35)">Oil Slick Leakage (μ=0.35)</option>
                <option value="Cold Storage Frost (μ=0.25)">Cold Storage Frost (μ=0.25)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: 10-Question 5-Point Likert Evaluation */}
        <div className="space-y-4 pt-2 border-t border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                10-question stakeholder questionnaire using a 5-point Likert scale
              </h3>
              <p className="text-[11px] text-slate-400">
                1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Completed: {Object.values(likertScores).filter(s => s > 0).length} / 10
            </div>
          </div>

          <div className="space-y-3">
            {questionsList.map((q, idx) => {
              const currentVal = likertScores[q.key];
              return (
                <div 
                  key={q.key} 
                  className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label 
                      htmlFor={`likert-${q.key}`} 
                      className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl"
                    >
                      <span className="font-bold text-cyan-300 mr-1.5">Q{idx + 1}.</span>
                      {q.text.split(':')[1] || q.text}
                    </label>

                    {/* 1-5 Radio Buttons */}
                    <div 
                      role="radiogroup" 
                      aria-label={q.text}
                      className="flex items-center gap-1.5 shrink-0"
                    >
                      {[1, 2, 3, 4, 5].map((score) => {
                        const isSelected = currentVal === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleLikertChange(q.key, score)}
                            className={`w-9 h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Qualitative Field Observations */}
        <div className="space-y-4 pt-2 border-t border-slate-700/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            {t.stakeholder.qualitativeTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.stakeholder.qualitative.easyToUnderstand}
              </label>
              <textarea
                rows={2}
                value={qualitative.easyToUnderstand}
                onChange={(e) => handleQualitativeChange('easyToUnderstand', e.target.value)}
                placeholder="e.g., Dynamic envelope color transitions, stopping formula breakdown..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.stakeholder.qualitative.difficultToUnderstand}
              </label>
              <textarea
                rows={2}
                value={qualitative.difficultToUnderstand}
                onChange={(e) => handleQualitativeChange('difficultToUnderstand', e.target.value)}
                placeholder="e.g., Directional vector scaling in 3-agent pinch..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.stakeholder.qualitative.mostUsefulFeature}
              </label>
              <textarea
                rows={2}
                value={qualitative.mostUsefulFeature}
                onChange={(e) => handleQualitativeChange('mostUsefulFeature', e.target.value)}
                placeholder="e.g., Highest-threat arbitration matrix, wet-floor friction scaling..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.stakeholder.qualitative.featureNeedingImprovement}
              </label>
              <textarea
                rows={2}
                value={qualitative.featureNeedingImprovement}
                onChange={(e) => handleQualitativeChange('featureNeedingImprovement', e.target.value)}
                placeholder="e.g., Trajectory prediction line visualization..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-slate-300">
                {t.stakeholder.qualitative.additionalComments}
              </label>
              <textarea
                rows={2}
                value={qualitative.additionalComments}
                onChange={(e) => handleQualitativeChange('additionalComments', e.target.value)}
                placeholder="Additional feedback for process plant deployment readiness..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            {t.stakeholder.resetForm}
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            {t.stakeholder.submitEvaluation}
          </button>
        </div>
      </form>

      {/* Response Records History Table */}
      {evaluations.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">{t.stakeholder.responsesList}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/40">
                  <th className="py-2.5 px-3 font-semibold">Evaluation ID</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Mode</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Avg Likert</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {evaluations.map((e) => {
                  const scores = Object.values(e.likertScores).filter(s => s > 0);
                  const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 'N/A';
                  return (
                    <tr key={e.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-300">{e.id}</td>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(e.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-medium">
                        {e.role === 'OTHER' ? (e.roleOtherText || 'Other') : t.stakeholder.roles[e.role]}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{e.simulationMode || 'MULTI_AGENT'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-center text-cyan-400">{avg} / 5</td>
                      <td className="py-2.5 px-3 text-center">
                        {e.isComplete ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Complete
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                            Partial
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
