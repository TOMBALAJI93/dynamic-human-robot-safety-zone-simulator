import React, { useState } from 'react';
import { Grid, Plus, Trash2, Save, Box } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';
import type { PlantLayout, PlantObject } from '../types';

interface LayoutPageProps {
  language: Language;
}

export const LayoutPage: React.FC<LayoutPageProps> = ({ language }) => {
  const t = translations[language];
  const [layout, setLayout] = useState<PlantLayout>(storageService.getPlantLayout());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const [newObjName, setNewObjName] = useState('');
  const [newObjType, setNewObjType] = useState<PlantObject['type']>('equipment');
  const [newObjX, setNewObjX] = useState(30);
  const [newObjY, setNewObjY] = useState(30);
  const [newObjW, setNewObjW] = useState(15);
  const [newObjH, setNewObjH] = useState(15);

  const handleAddObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjName) return;

    const newObj: PlantObject = {
      id: `obj-${Date.now().toString().slice(-4)}`,
      name: newObjName,
      type: newObjType,
      x: Number(newObjX),
      y: Number(newObjY),
      width: Number(newObjW),
      height: Number(newObjH),
      color: newObjType === 'restricted_zone' ? '#ef4444' : '#3b82f6',
    };

    setLayout((prev) => ({
      ...prev,
      objects: [...prev.objects, newObj],
    }));
    setNewObjName('');
  };

  const handleDeleteObject = (id: string) => {
    setLayout((prev) => ({
      ...prev,
      objects: prev.objects.filter((o) => o.id !== id),
    }));
  };

  const handleSaveLayout = () => {
    storageService.savePlantLayout(layout);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-400" />
            {t.nav.layout} Editor (100m x 100m Coordinate Grid)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure plant spatial elements, process equipment, robot docking stations, worker stations, and restricted hazard zones.
          </p>
        </div>

        <button
          onClick={handleSaveLayout}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition"
        >
          <Save className="w-4 h-4" />
          <span>{savedNotice ? 'Layout Saved!' : t.common.save}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Object Form */}
        <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Add Plant Object
          </h2>

          <form onSubmit={handleAddObject} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Object Name</label>
              <input
                type="text"
                value={newObjName}
                onChange={(e) => setNewObjName(e.target.value)}
                placeholder="e.g. Mixing Tank #3"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Type</label>
              <select
                value={newObjType}
                onChange={(e) => setNewObjType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="equipment">Process Equipment</option>
                <option value="robot_station">Robot Docking Station</option>
                <option value="workstation">Human Workstation</option>
                <option value="restricted_zone">Restricted Hazard Zone</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">X Coord (0-100m)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newObjX}
                  onChange={(e) => setNewObjX(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Y Coord (0-100m)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newObjY}
                  onChange={(e) => setNewObjY(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Width (m)</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={newObjW}
                  onChange={(e) => setNewObjW(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height (m)</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={newObjH}
                  onChange={(e) => setNewObjH(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white rounded-lg transition"
            >
              Add to Layout
            </button>
          </form>
        </div>

        {/* Right: Layout Objects Table */}
        <div className="lg:col-span-8 bg-slate-800/70 border border-slate-700/70 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-400" />
            Configured Layout Entities ({layout.objects.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Position (X, Y)</th>
                  <th className="py-2 px-3">Size (W x H)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {layout.objects.map((obj) => (
                  <tr key={obj.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{obj.name}</td>
                    <td className="py-2.5 px-3 text-slate-400 capitalize">{obj.type.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">({obj.x}m, {obj.y}m)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{obj.width}m x {obj.height}m</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteObject(obj.id)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-950 hover:text-rose-300 transition"
                        title="Delete object"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
