import type { 
  FieldObservation, 
  ExperimentSummary, 
  ExperimentRecord, 
  PlantLayout, 
  SafetyRuleConfig, 
  EnvironmentalContext,
  StakeholderEvaluation,
  StakeholderValidationSummary,
  StakeholderRole,
  StakeholderLikertResponses
} from '../types';
import { DEFAULT_PLANT_LAYOUT } from '../engine/scenarios/scenarioData';
import { DEFAULT_SAFETY_RULES, DEFAULT_ENVIRONMENT_CONFIG } from '../engine/safety/safetyEngine';
import type { Language } from '../i18n/translations';

const STORAGE_KEYS = {
  FIELD_OBSERVATIONS: 'safety_simulator_field_obs_v2',
  EXPERIMENT_RESULTS: 'safety_simulator_exp_results_v2',
  EXPERIMENT_HISTORY: 'safety_simulator_exp_history_v2',
  SAVED_LAYOUT: 'safety_simulator_plant_layout_v2',
  SAFETY_RULES: 'safety_simulator_safety_rules_v2',
  ENVIRONMENT_CONFIG: 'safety_simulator_environment_v2',
  LANGUAGE: 'safety_simulator_language_v2',
  SIMULATION_STATS: 'safety_simulator_stats_v2',
  STAKEHOLDER_EVALUATIONS: 'safety_simulator_stakeholder_evals_v2',
};

export interface AppStats {
  totalSimulationsRun: number;
  safeDetections: number;
  warningDetections: number;
  unsafeDetections: number;
  emergencyDetections: number;
  unnecessaryStopsAvoided: number;
  minDistanceRecorded: number;
}

const DEFAULT_STATS: AppStats = {
  totalSimulationsRun: 16,
  safeDetections: 9,
  warningDetections: 4,
  unsafeDetections: 3,
  emergencyDetections: 0,
  unnecessaryStopsAvoided: 7,
  minDistanceRecorded: 1.85,
};

export const storageService = {
  getLanguage(): Language {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (lang === 'ta' || lang === 'en') ? lang : 'en';
  },

  setLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getStats(): AppStats {
    const raw = localStorage.getItem(STORAGE_KEYS.SIMULATION_STATS);
    if (!raw) return DEFAULT_STATS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: AppStats): void {
    localStorage.setItem(STORAGE_KEYS.SIMULATION_STATS, JSON.stringify(stats));
  },

  getFieldObservations(): FieldObservation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FIELD_OBSERVATIONS);
    if (!raw) {
      return [
        {
          id: 'OBS-2026-001',
          scenarioId: 'sc-1-normal',
          timestamp: '2026-09-06T10:15:00Z',
          location: 'Bay 4 - Distillation Corridor',
          robotId: 'amr-01',
          humanTask: 'Inspection',
          robotSpeed: 1.2,
          humanSpeed: 1.1,
          observedProximity: 8.4,
          safetyCondition: 'SAFE',
          notes: 'Standard parallel routine inspection. Dynamic envelope remained well within green band.',
          capturedBy: 'S. Ramanathan (Field Eng)',
          synced: true,
        },
        {
          id: 'OBS-2026-002',
          scenarioId: 'sc-2-approach',
          timestamp: '2026-09-06T11:40:00Z',
          location: 'Aisle 2 - Reactor Crossway',
          robotId: 'amr-01',
          humanTask: 'Material handling',
          robotSpeed: 1.4,
          humanSpeed: 1.3,
          observedProximity: 3.2,
          safetyCondition: 'WARNING',
          notes: 'Worker moved with parts trolley across robot aisle. Dynamic warning alert flashed appropriately.',
          capturedBy: 'Plant Safety Supervisor',
          synced: true,
        },
      ];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveFieldObservation(obs: FieldObservation): void {
    const current = this.getFieldObservations();
    const updated = [obs, ...current];
    localStorage.setItem(STORAGE_KEYS.FIELD_OBSERVATIONS, JSON.stringify(updated));
  },

  getExperimentHistory(): ExperimentRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIMENT_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveExperimentRecord(record: ExperimentRecord): void {
    const current = this.getExperimentHistory();
    const updated = [record, ...current.filter((r) => r.id !== record.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.EXPERIMENT_HISTORY, JSON.stringify(updated));
  },

  deleteExperimentRecord(id: string): void {
    const current = this.getExperimentHistory();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPERIMENT_HISTORY, JSON.stringify(updated));
  },

  clearExperimentHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.EXPERIMENT_HISTORY);
  },

  getExperimentResults(): ExperimentSummary[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIMENT_RESULTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveExperimentResults(results: ExperimentSummary[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPERIMENT_RESULTS, JSON.stringify(results));
  },

  getPlantLayout(): PlantLayout {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_LAYOUT);
    if (!raw) return DEFAULT_PLANT_LAYOUT;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PLANT_LAYOUT;
    }
  },

  savePlantLayout(layout: PlantLayout): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_LAYOUT, JSON.stringify(layout));
  },

  getSafetyRules(): SafetyRuleConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_RULES);
    if (!raw) return DEFAULT_SAFETY_RULES;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SAFETY_RULES;
    }
  },

  saveSafetyRules(rules: SafetyRuleConfig): void {
    localStorage.setItem(STORAGE_KEYS.SAFETY_RULES, JSON.stringify(rules));
  },

  getEnvironmentConfig(): EnvironmentalContext {
    const raw = localStorage.getItem(STORAGE_KEYS.ENVIRONMENT_CONFIG);
    if (!raw) return DEFAULT_ENVIRONMENT_CONFIG;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ENVIRONMENT_CONFIG;
    }
  },

  saveEnvironmentConfig(env: EnvironmentalContext): void {
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENT_CONFIG, JSON.stringify(env));
  },

  clearAllStorage(): void {
    localStorage.clear();
  },

  /* ---------------- CSV & JSON Export Helpers ---------------- */

  exportExperimentsToCSV(records: ExperimentRecord[]): string {
    const headers = [
      'Experiment ID',
      'Timestamp',
      'Scenario',
      'Robot Speed (m/s)',
      'Human Speed (m/s)',
      'Reaction Time (s)',
      'Stopping Time (s)',
      'Safety Margin (m)',
      'Base Distance (m)',
      'Duration (s)',
      'Min Distance (m)',
      'Max Risk Level',
      'Events Count',
      'Unnecessary Stops Avoided (s)',
    ];

    const rows = records.map((r) => [
      r.id,
      r.timestamp,
      `"${r.scenarioName}"`,
      r.config.robotSpeed,
      r.config.humanSpeed,
      r.config.reactionTime,
      r.config.stoppingTime,
      r.config.safetyMargin,
      r.config.baseDistance,
      r.summary.duration,
      r.summary.minDistance,
      r.summary.maxRiskLevel,
      r.summary.eventCount,
      r.summary.unnecessaryRestrictionsAvoidedDuration,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  exportFieldObservationsToCSV(obs: FieldObservation[]): string {
    const headers = [
      'Observation ID',
      'Scenario',
      'Timestamp',
      'Location',
      'Robot ID',
      'Human Task',
      'Robot Speed (m/s)',
      'Human Speed (m/s)',
      'Observed Proximity (m)',
      'Safety Condition',
      'Notes',
      'Captured By',
    ];

    const rows = obs.map((o) => [
      o.id,
      o.scenarioId,
      o.timestamp,
      `"${o.location}"`,
      o.robotId,
      o.humanTask,
      o.robotSpeed,
      o.humanSpeed,
      o.observedProximity,
      o.safetyCondition,
      `"${o.notes.replace(/"/g, '""')}"`,
      o.capturedBy || 'Anonymous',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },


  // --- Stakeholder Evaluation Module ---

  getStakeholderEvaluations(): StakeholderEvaluation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_EVALUATIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load stakeholder evaluations:', e);
      return [];
    }
  },

  saveStakeholderEvaluation(evaluation: StakeholderEvaluation): boolean {
    try {
      const existing = this.getStakeholderEvaluations();
      const updated = [evaluation, ...existing.filter(e => e.id !== evaluation.id)];
      localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_EVALUATIONS, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to save stakeholder evaluation:', e);
      return false;
    }
  },

  clearStakeholderEvaluations(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.STAKEHOLDER_EVALUATIONS);
    } catch (e) {
      console.error('Failed to clear stakeholder evaluations:', e);
    }
  },

  getStakeholderSummary(evals?: StakeholderEvaluation[]): StakeholderValidationSummary {
    const list = evals || this.getStakeholderEvaluations();
    const total = list.length;
    const completed = list.filter(e => e.isComplete).length;

    const roleDistribution: Record<StakeholderRole, number> = {
      EHS_MANAGER: 0,
      PLANT_OPERATOR: 0,
      MAINTENANCE_ENGINEER: 0,
      OTHER: 0,
    };

    list.forEach(e => {
      if (roleDistribution[e.role] !== undefined) {
        roleDistribution[e.role]++;
      } else {
        roleDistribution.OTHER++;
      }
    });

    if (completed === 0) {
      return {
        status: total > 0 ? 'IN_PROGRESS' : 'PENDING_ACTUAL_TRIALS',
        totalResponses: total,
        completedEvaluations: 0,
        roleDistribution,
      };
    }

    const questionKeys: (keyof StakeholderLikertResponses)[] = [
      'q1_clarity',
      'q2_warning_reasons',
      'q3_environmental_controls',
      'q4_multi_agent_threat',
      'q5_static_vs_dynamic',
      'q6_ui_usability',
      'q7_process_plant_usefulness',
      'q8_configurability',
      'q9_bilingual_support',
      'q10_overall_utility',
    ];

    const sums: Record<keyof StakeholderLikertResponses, number> = {
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

    const completedList = list.filter(e => e.isComplete);
    completedList.forEach(e => {
      questionKeys.forEach(k => {
        sums[k] += Number(e.likertScores[k]) || 0;
      });
    });

    const averageScores: Record<keyof StakeholderLikertResponses, number> = {} as any;
    let totalAllQuestions = 0;

    questionKeys.forEach(k => {
      const avg = Number((sums[k] / completedList.length).toFixed(2));
      averageScores[k] = avg;
      totalAllQuestions += avg;
    });

    const overallAverageScore = Number((totalAllQuestions / questionKeys.length).toFixed(2));

    return {
      status: 'RESPONSES_AVAILABLE',
      totalResponses: total,
      completedEvaluations: completed,
      roleDistribution,
      averageScores,
      overallAverageScore,
    };
  },

  exportStakeholderToCSV(evals?: StakeholderEvaluation[]): string {
    const list = evals || this.getStakeholderEvaluations();
    const headers = [
      'Evaluation_ID',
      'Timestamp',
      'Role',
      'Role_Custom',
      'Scenario',
      'Simulation_Mode',
      'Environment_Condition',
      'Duration_Seconds',
      'Is_Complete',
      'Q1_Clarity',
      'Q2_Warning_Reasons',
      'Q3_Environmental_Controls',
      'Q4_Multi_Agent_Threat',
      'Q5_Static_vs_Dynamic',
      'Q6_UI_Usability',
      'Q7_Plant_Usefulness',
      'Q8_Configurability',
      'Q9_Bilingual_Support',
      'Q10_Overall_Utility',
      'Easy_To_Understand',
      'Difficult_To_Understand',
      'Most_Useful_Feature',
      'Feature_Needing_Improvement',
      'Additional_Info_Needed',
      'Additional_Comments'
    ];

    const rows = list.map(e => [
      e.id,
      e.timestamp,
      e.role,
      '"' + (e.roleOtherText || '').replace(/"/g, '""') + '"',
      '"' + (e.scenarioEvaluated || 'None').replace(/"/g, '""') + '"',
      e.simulationMode || 'N/A',
      '"' + (e.environmentalCondition || 'N/A').replace(/"/g, '""') + '"',
      e.durationSeconds || 0,
      e.isComplete ? 'TRUE' : 'FALSE',
      e.likertScores.q1_clarity,
      e.likertScores.q2_warning_reasons,
      e.likertScores.q3_environmental_controls,
      e.likertScores.q4_multi_agent_threat,
      e.likertScores.q5_static_vs_dynamic,
      e.likertScores.q6_ui_usability,
      e.likertScores.q7_process_plant_usefulness,
      e.likertScores.q8_configurability,
      e.likertScores.q9_bilingual_support,
      e.likertScores.q10_overall_utility,
      '"' + (e.qualitative.easyToUnderstand || '').replace(/"/g, '""') + '"',
      '"' + (e.qualitative.difficultToUnderstand || '').replace(/"/g, '""') + '"',
      '"' + (e.qualitative.mostUsefulFeature || '').replace(/"/g, '""') + '"',
      '"' + (e.qualitative.featureNeedingImprovement || '').replace(/"/g, '""') + '"',
      '"' + (e.qualitative.additionalInfoNeeded || '').replace(/"/g, '""') + '"',
      '"' + (e.qualitative.additionalComments || '').replace(/"/g, '""') + '"'
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportStakeholderToJSON(evals?: StakeholderEvaluation[]): string {
    const list = evals || this.getStakeholderEvaluations();
    return JSON.stringify(list, null, 2);
  },

  downloadJSON(data: unknown, filename: string): void {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
