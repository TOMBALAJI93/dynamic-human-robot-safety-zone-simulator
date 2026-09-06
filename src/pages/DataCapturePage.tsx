import React, { useState } from 'react';
import { ClipboardList, Plus, Download, FileSpreadsheet } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';
import type { FieldObservation, HumanTaskType, RiskLevel } from '../types';

interface DataCapturePageProps {
  language: Language;
}

export const DataCapturePage: React.FC<DataCapturePageProps> = ({ language }) => {
  const t = translations[language];
  const [observations, setObservations] = useState<FieldObservation[]>(storageService.getFieldObservations());
  const [savedNotice, setSavedNotice] = useState(false);

  // Field Form State
  const [location, setLocation] = useState('Unit 4B - Main Transfer Bay');
  const [robotId, setRobotId] = useState('amr-01');
  const [humanTask, setHumanTask] = useState<HumanTaskType>('Inspection');
  const [robotSpeed, setRobotSpeed] = useState(1.2);
  const [humanSpeed, setHumanSpeed] = useState(1.0);
  const [observedProximity, setObservedProximity] = useState(4.5);
  const [safetyCondition, setSafetyCondition] = useState<RiskLevel>('SAFE');
  const [notes, setNotes] = useState('');
  const [capturedBy, setCapturedBy] = useState('Field Safety Officer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newObs: FieldObservation = {
      id: `OBS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      scenarioId: 'custom-field-entry',
      timestamp: new Date().toISOString(),
      location,
      robotId,
      humanTask,
      robotSpeed: Number(robotSpeed),
      humanSpeed: Number(humanSpeed),
      observedProximity: Number(observedProximity),
      safetyCondition,
      notes: notes || 'Standard site inspection walkthrough',
      capturedBy,
      synced: false,
    };

    storageService.saveFieldObservation(newObs);
    setObservations(storageService.getFieldObservations());
    setNotes('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(observations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `plant_safety_observations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (observations.length === 0) return;
    const csvData = storageService.exportFieldObservationsToCSV(observations);
    storageService.downloadCSV(csvData, `plant_safety_observations_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            {t.nav.dataCapture} (Field-Friendly Offline Log)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture on-site observations of human-robot proximity. Works 100% offline with local browser storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.common.exportCSV}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.common.export}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Entry Form */}
        <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Record Proximity Observation
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Plant Location / Unit</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Robot ID</label>
                <input
                  type="text"
                  value={robotId}
                  onChange={(e) => setRobotId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Inspector / Officer</label>
                <input
                  type="text"
                  value={capturedBy}
                  onChange={(e) => setCapturedBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Human Task</label>
                <select
                  value={humanTask}
                  onChange={(e) => setHumanTask(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="Inspection">Inspection</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Material handling">Material handling</option>
                  <option value="Quality checking">Quality checking</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observed Risk State</label>
                <select
                  value={safetyCondition}
                  onChange={(e) => setSafetyCondition(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                >
                  <option value="SAFE">SAFE</option>
                  <option value="WARNING">WARNING</option>
                  <option value="UNSAFE">UNSAFE</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Robot Spd (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={robotSpeed}
                  onChange={(e) => setRobotSpeed(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Human Spd (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={humanSpeed}
                  onChange={(e) => setHumanSpeed(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Distance (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={observedProximity}
                  onChange={(e) => setObservedProximity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Notes & Context</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observed trajectory, worker attentiveness, equipment status..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 h-16"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 font-semibold text-white rounded-lg transition"
            >
              {savedNotice ? '✓ Saved to Local Storage!' : 'Save Observation'}
            </button>
          </form>
        </div>

        {/* Right: Captured Records History */}
        <div className="lg:col-span-7 bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
            <span>Observation Log ({observations.length} Entries)</span>
            <span className="text-[11px] text-slate-400 font-normal">Offline Local Storage</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Task</th>
                  <th className="py-2 px-3">Distance</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{obs.id}</td>
                    <td className="py-2.5 px-3 text-slate-200">{obs.location}</td>
                    <td className="py-2.5 px-3 text-slate-300">{obs.humanTask}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{obs.observedProximity} m</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        obs.safetyCondition === 'SAFE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        obs.safetyCondition === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {obs.safetyCondition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
