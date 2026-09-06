import type { 
  FieldObservation, 
  ExperimentSummary, 
  ExperimentRecord, 
  PlantLayout, 
  SafetyRuleConfig, 
  TelemetrySample 
} from '../types';
import { DEFAULT_PLANT_LAYOUT } from '../engine/scenarios/scenarioData';
import { DEFAULT_SAFETY_RULES } from '../engine/safety/safetyEngine';
import type { Language } from '../i18n/translations';

const STORAGE_KEYS = {
  FIELD_OBSERVATIONS: 'safety_simulator_field_obs_v2',
  EXPERIMENT_RESULTS: 'safety_simulator_exp_results_v2',
  EXPERIMENT_HISTORY: 'safety_simulator_exp_history_v2',
  SAVED_LAYOUT: 'safety_simulator_plant_layout_v2',
  SAFETY_RULES: 'safety_simulator_safety_rules_v2',
  LANGUAGE: 'safety_simulator_language_v2',
  SIMULATION_STATS: 'safety_simulator_stats_v2',
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

  /* ---------------- CSV Export Helpers ---------------- */

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
      'Human Task',
      'Min Distance (m)',
      'Min Safety Margin (m)',
      '1st Warning Time (s)',
      '1st Unsafe Time (s)',
      'Unsafe Duration (s)',
      'Max Risk Level',
      'Unnecessary Stops Avoided Duration (s)',
      'Event Count',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.timestamp}"`,
      `"${r.scenarioName}"`,
      r.config.robotSpeed,
      r.config.humanSpeed,
      r.config.reactionTime,
      r.config.stoppingTime,
      r.config.safetyMargin,
      r.config.baseDistance,
      `"${r.config.humanTask}"`,
      r.summary.minDistance,
      r.summary.minSafetyMargin,
      r.summary.firstWarningTime ?? 'None',
      r.summary.firstUnsafeTime ?? 'None',
      r.summary.totalUnsafeDuration,
      `"${r.summary.maxRiskLevel}"`,
      r.summary.unnecessaryRestrictionsAvoidedDuration,
      r.summary.eventCount,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  exportTelemetryToCSV(telemetry: TelemetrySample[], scenarioName: string = 'Simulation'): string {
    const headers = [
      'Simulation Time (s)',
      'Robot X (m)',
      'Robot Y (m)',
      'Human X (m)',
      'Human Y (m)',
      'Robot Speed (m/s)',
      'Human Speed (m/s)',
      'Current Distance (m)',
      'Required Dynamic Distance (m)',
      'Static Baseline Distance (m)',
      'Safety Margin (m)',
      'Risk Level',
      'Baseline Risk Level',
    ];

    const rows = telemetry.map((t) => [
      t.time,
      t.robotX,
      t.robotY,
      t.humanX,
      t.humanY,
      t.robotSpeed,
      t.humanSpeed,
      t.distance,
      t.requiredDistance,
      t.staticBaselineDistance,
      t.safetyMargin,
      `"${t.riskLevel}"`,
      `"${t.baselineRiskLevel}"`,
    ]);

    return [`# Telemetry Export for ${scenarioName}`, headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  exportFieldObservationsToCSV(observations: FieldObservation[]): string {
    const headers = [
      'Observation ID',
      'Timestamp',
      'Location',
      'Robot ID',
      'Human Task',
      'Robot Speed (m/s)',
      'Human Speed (m/s)',
      'Observed Proximity (m)',
      'Safety Condition',
      'Captured By',
      'Notes',
    ];

    const rows = observations.map((o) => [
      `"${o.id}"`,
      `"${o.timestamp}"`,
      `"${o.location}"`,
      `"${o.robotId}"`,
      `"${o.humanTask}"`,
      o.robotSpeed,
      o.humanSpeed,
      o.observedProximity,
      `"${o.safetyCondition}"`,
      `"${o.capturedBy ?? ''}"`,
      `"${(o.notes ?? '').replace(/"/g, '""')}"`,
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
};
