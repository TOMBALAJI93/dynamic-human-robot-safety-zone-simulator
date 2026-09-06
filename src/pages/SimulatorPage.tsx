import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Info,
  Layers,
  Edit3,
  Check,
  Trash2,
  Download,
  BookmarkPlus,
  Compass,
  Activity
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import { evaluateSafetyState, DEFAULT_SAFETY_RULES } from '../engine/safety/safetyEngine';
import { updateRobotMotion, updateHumanMotion } from '../engine/physics/motionEngine';
import type { 
  ScenarioDefinition, 
  RobotEntity, 
  HumanEntity, 
  SafetyEvaluation, 
  SafetyEvent,
  PathWaypoint,
  TelemetrySample,
  SimulationRunSummary,
  ExperimentRecord
} from '../types';
import { storageService } from '../services/storageService';

interface SimulatorPageProps {
  language: Language;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ language }) => {
  const t = translations[language];
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const currentScenario: ScenarioDefinition = PREDEFINED_SCENARIOS[selectedScenarioIndex] || PREDEFINED_SCENARIOS[0];

  // Entities & Simulation State
  const [robot, setRobot] = useState<RobotEntity>({ ...currentScenario.initialRobot });
  const [human, setHuman] = useState<HumanEntity>({ ...currentScenario.initialHuman });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySample[]>([]);

  // Edit Path State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<'robot' | 'human'>('robot');
  const [draggedWaypointIndex, setDraggedWaypointIndex] = useState<number | null>(null);
  const [pathValidationMsg, setPathValidationMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Simulation Summary Modal / Card State
  const [runSummary, setRunSummary] = useState<SimulationRunSummary | null>(null);
  const [savedExpNotice, setSavedExpNotice] = useState<boolean>(false);

  const plantLayout = storageService.getPlantLayout();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetryChartRef = useRef<HTMLCanvasElement | null>(null);

  // Active safety evaluation
  const safetyEval: SafetyEvaluation = evaluateSafetyState(
    currentScenario.safetyRules || DEFAULT_SAFETY_RULES,
    robot,
    human
  );

  // Reset simulation when scenario changes
  useEffect(() => {
    setRobot({ ...currentScenario.initialRobot });
    setHuman({ ...currentScenario.initialHuman });
    setSimTime(0);
    setIsRunning(false);
    setEvents([]);
    setTelemetry([]);
    setRunSummary(null);
    setIsEditMode(false);
    setPathValidationMsg(null);
  }, [selectedScenarioIndex]);

  // Coordinate Conversion Helpers (Plant 0-100m <-> Canvas Pixels)
  const getCanvasCoords = useCallback((plantX: number, plantY: number, width: number, height: number) => {
    return {
      x: (plantX / plantLayout.width) * width,
      y: (plantY / plantLayout.height) * height,
    };
  }, [plantLayout.width, plantLayout.height]);

  const getPlantCoords = useCallback((canvasX: number, canvasY: number, width: number, height: number): PathWaypoint => {
    const px = Math.max(0, Math.min(100, (canvasX / width) * plantLayout.width));
    const py = Math.max(0, Math.min(100, (canvasY / height) * plantLayout.height));
    return {
      x: Math.round(px * 10) / 10,
      y: Math.round(py * 10) / 10,
    };
  }, [plantLayout.width, plantLayout.height]);

  // Simulation step update
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const dt = 0.1 * timeScale;
      const nextTime = Math.round((simTime + dt) * 10) / 10;
      setSimTime(nextTime);

      const nextRobot = updateRobotMotion(robot, dt);
      const nextHuman = updateHumanMotion(human, dt);
      setRobot(nextRobot);
      setHuman(nextHuman);

      // Evaluate new safety state
      const currentEval = evaluateSafetyState(
        currentScenario.safetyRules || DEFAULT_SAFETY_RULES,
        nextRobot,
        nextHuman
      );

      // Record Telemetry Sample every 0.1s
      const sample: TelemetrySample = {
        time: nextTime,
        robotX: nextRobot.position.x,
        robotY: nextRobot.position.y,
        humanX: nextHuman.position.x,
        humanY: nextHuman.position.y,
        robotSpeed: nextRobot.currentSpeed,
        humanSpeed: nextHuman.currentSpeed,
        distance: currentEval.currentDistance,
        requiredDistance: currentEval.requiredDynamicDistance,
        staticBaselineDistance: currentEval.staticBaselineDistance,
        safetyMargin: currentEval.safetyMarginRemaining,
        riskLevel: currentEval.riskLevel,
        baselineRiskLevel: currentEval.baselineRiskLevel,
      };

      setTelemetry((prev) => [...prev, sample]);

      // Handle Event Logging & State Transitions
      if (currentEval.riskLevel !== 'SAFE') {
        const newEvent: SafetyEvent = {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          timestamp: Date.now(),
          simulationTime: nextTime,
          scenarioId: currentScenario.id,
          scenarioName: currentScenario.name,
          riskLevel: currentEval.riskLevel,
          distance: currentEval.currentDistance,
          requiredDistance: currentEval.requiredDynamicDistance,
          robotSpeed: nextRobot.currentSpeed,
          humanSpeed: nextHuman.currentSpeed,
          humanTask: nextHuman.task,
          message: currentEval.explanation,
        };

        setEvents((prev) => {
          if (prev.length > 0 && Math.abs(prev[0].simulationTime - nextTime) < 0.5) return prev;
          return [newEvent, ...prev.slice(0, 24)];
        });
      }

      // Check scenario completion
      if (nextTime >= currentScenario.duration) {
        setIsRunning(false);
        generateSimulationSummary();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, simTime, timeScale, robot, human, currentScenario]);

  // Generate Simulation Run Summary
  const generateSimulationSummary = useCallback(() => {
    if (telemetry.length === 0) return;

    let minDistance = 999;
    let minSafetyMargin = 999;
    let firstWarningTime: number | null = null;
    let firstUnsafeTime: number | null = null;
    let warningDuration = 0;
    let unsafeDuration = 0;
    let maxRiskLevel: SafetyEvaluation['riskLevel'] = 'SAFE';
    let baselineTimeInZone = 0;
    let dynamicTimeInZone = 0;
    let unnecessaryStopsAvoidedDuration = 0;

    const dt = 0.1;

    telemetry.forEach((pt) => {
      if (pt.distance < minDistance) minDistance = pt.distance;
      if (pt.safetyMargin < minSafetyMargin) minSafetyMargin = pt.safetyMargin;

      if (pt.riskLevel === 'WARNING') {
        if (firstWarningTime === null) firstWarningTime = pt.time;
        warningDuration += dt;
      }
      if (pt.riskLevel === 'UNSAFE' || pt.riskLevel === 'EMERGENCY') {
        if (firstUnsafeTime === null) firstUnsafeTime = pt.time;
        unsafeDuration += dt;
      }

      if (pt.riskLevel === 'EMERGENCY') maxRiskLevel = 'EMERGENCY';
      else if (pt.riskLevel === 'UNSAFE' && maxRiskLevel !== 'EMERGENCY') maxRiskLevel = 'UNSAFE';
      else if (pt.riskLevel === 'WARNING' && maxRiskLevel === 'SAFE') maxRiskLevel = 'WARNING';

      if (pt.baselineRiskLevel === 'UNSAFE' || pt.baselineRiskLevel === 'EMERGENCY') {
        baselineTimeInZone += dt;
      }
      if (pt.riskLevel === 'UNSAFE' || pt.riskLevel === 'EMERGENCY') {
        dynamicTimeInZone += dt;
      }
      if ((pt.baselineRiskLevel === 'UNSAFE' || pt.baselineRiskLevel === 'EMERGENCY') && pt.riskLevel === 'SAFE') {
        unnecessaryStopsAvoidedDuration += dt;
      }
    });

    const summary: SimulationRunSummary = {
      scenarioId: currentScenario.id,
      scenarioName: currentScenario.name,
      robotName: robot.name,
      humanName: human.name,
      duration: simTime,
      minDistance: Math.round(minDistance * 100) / 100,
      minSafetyMargin: Math.round(minSafetyMargin * 100) / 100,
      firstWarningTime: firstWarningTime !== null ? Math.round(firstWarningTime * 10) / 10 : null,
      firstUnsafeTime: firstUnsafeTime !== null ? Math.round(firstUnsafeTime * 10) / 10 : null,
      totalWarningDuration: Math.round(warningDuration * 10) / 10,
      totalUnsafeDuration: Math.round(unsafeDuration * 10) / 10,
      maxRiskLevel,
      eventCount: events.length,
      events,
      baselineTimeInZone: Math.round(baselineTimeInZone * 10) / 10,
      dynamicTimeInZone: Math.round(dynamicTimeInZone * 10) / 10,
      unnecessaryRestrictionsAvoidedDuration: Math.round(unnecessaryStopsAvoidedDuration * 10) / 10,
    };

    setRunSummary(summary);
  }, [telemetry, currentScenario, robot.name, human.name, simTime, events]);

  // Save current simulation run to Experiment History in LocalStorage
  const handleSaveToExperimentHistory = () => {
    if (!runSummary) return;

    const record: ExperimentRecord = {
      id: `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      scenarioId: currentScenario.id,
      scenarioName: currentScenario.name,
      config: {
        robotSpeed: robot.currentSpeed,
        humanSpeed: human.currentSpeed,
        reactionTime: human.reactionTime,
        stoppingTime: robot.stoppingTime,
        safetyMargin: currentScenario.safetyRules.safetyMargin,
        baseDistance: currentScenario.safetyRules.baseDistance,
        humanTask: human.task,
        useDirectionalFactor: currentScenario.safetyRules.useDirectionalFactor,
        staticBaselineDistance: currentScenario.safetyRules.staticBaselineDistance,
      },
      summary: runSummary,
    };

    storageService.saveExperimentRecord(record);
    setSavedExpNotice(true);
    setTimeout(() => setSavedExpNotice(false), 2500);
  };

  // Export Telemetry to CSV
  const handleExportTelemetryCSV = () => {
    if (telemetry.length === 0) return;
    const csvData = storageService.exportTelemetryToCSV(telemetry, currentScenario.name);
    storageService.downloadCSV(csvData, `telemetry_${currentScenario.id}_${Date.now()}.csv`);
  };

  /* ---------------- Interactive Waypoint Canvas Handlers ---------------- */

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const activePath = editTarget === 'robot' ? robot.path : human.path;
    const hitRadius = 14;

    // Check if clicked near an existing waypoint
    for (let i = 0; i < activePath.length; i++) {
      const screenPt = getCanvasCoords(activePath[i].x, activePath[i].y, canvas.width, canvas.height);
      const dist = Math.hypot(screenPt.x - mouseX, screenPt.y - mouseY);
      if (dist <= hitRadius) {
        if (e.button === 2) {
          // Right click: Delete waypoint
          handleDeleteWaypoint(i);
          return;
        }
        setDraggedWaypointIndex(i);
        return;
      }
    }

    // Otherwise, add new waypoint at clicked coordinate
    if (e.button === 0) {
      const newPlantPoint = getPlantCoords(mouseX, mouseY, canvas.width, canvas.height);
      const updatedPath = [...activePath, newPlantPoint];
      if (editTarget === 'robot') {
        setRobot((prev) => ({ ...prev, path: updatedPath, position: updatedPath[0] }));
      } else {
        setHuman((prev) => ({ ...prev, path: updatedPath, position: updatedPath[0] }));
      }
      setPathValidationMsg({ text: `Waypoint ${updatedPath.length} added at (${newPlantPoint.x}m, ${newPlantPoint.y}m)`, isError: false });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || draggedWaypointIndex === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const updatedPoint = getPlantCoords(mouseX, mouseY, canvas.width, canvas.height);
    const activePath = editTarget === 'robot' ? [...robot.path] : [...human.path];

    activePath[draggedWaypointIndex] = updatedPoint;

    if (editTarget === 'robot') {
      setRobot((prev) => ({
        ...prev,
        path: activePath,
        position: draggedWaypointIndex === 0 ? updatedPoint : prev.position,
      }));
    } else {
      setHuman((prev) => ({
        ...prev,
        path: activePath,
        position: draggedWaypointIndex === 0 ? updatedPoint : prev.position,
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedWaypointIndex(null);
  };

  const handleDeleteWaypoint = (index: number) => {
    const activePath = editTarget === 'robot' ? [...robot.path] : [...human.path];
    if (activePath.length <= 2) {
      setPathValidationMsg({ text: 'Path requires at least 2 waypoints. Cannot delete.', isError: true });
      return;
    }
    activePath.splice(index, 1);
    if (editTarget === 'robot') {
      setRobot((prev) => ({ ...prev, path: activePath, position: activePath[0], currentWaypointIndex: 0 }));
    } else {
      setHuman((prev) => ({ ...prev, path: activePath, position: activePath[0], currentWaypointIndex: 0 }));
    }
    setPathValidationMsg({ text: `Deleted waypoint ${index + 1}.`, isError: false });
  };

  const handleClearPath = () => {
    if (editTarget === 'robot') {
      setRobot((prev) => ({ ...prev, path: [], position: { x: 50, y: 50 }, currentWaypointIndex: 0 }));
    } else {
      setHuman((prev) => ({ ...prev, path: [], position: { x: 50, y: 50 }, currentWaypointIndex: 0 }));
    }
    setPathValidationMsg({ text: 'Path cleared. Click on the canvas to place waypoints.', isError: false });
  };

  const handleResetPath = () => {
    if (editTarget === 'robot') {
      setRobot((prev) => ({
        ...prev,
        path: [...currentScenario.initialRobot.path],
        position: { ...currentScenario.initialRobot.position },
        currentWaypointIndex: 0,
      }));
    } else {
      setHuman((prev) => ({
        ...prev,
        path: [...currentScenario.initialHuman.path],
        position: { ...currentScenario.initialHuman.position },
        currentWaypointIndex: 0,
      }));
    }
    setPathValidationMsg({ text: 'Reset to default scenario path.', isError: false });
  };

  const handleSaveCustomPath = () => {
    const activePath = editTarget === 'robot' ? robot.path : human.path;
    if (!activePath || activePath.length < 2) {
      setPathValidationMsg({ text: 'Validation error: Path requires at least 2 connected waypoints.', isError: true });
      return;
    }
    setPathValidationMsg({ text: `✓ Validated and saved ${editTarget.toUpperCase()} path with ${activePath.length} nodes.`, isError: false });
  };

  /* ---------------- Canvas Rendering ---------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scaleX = width / plantLayout.width;
    const scaleY = height / plantLayout.height;

    // Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    // Plant Coordinate Grid (100m x 100m)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= plantLayout.width; x += plantLayout.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x * scaleX, 0);
      ctx.lineTo(x * scaleX, height);
      ctx.stroke();
    }
    for (let y = 0; y <= plantLayout.height; y += plantLayout.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y * scaleY);
      ctx.lineTo(width, y * scaleY);
      ctx.stroke();
    }

    // Coordinate Numbers
    ctx.fillStyle = '#475569';
    ctx.font = '9px monospace';
    ctx.fillText('0m,0m', 4, 12);
    ctx.fillText('100m,100m', width - 54, height - 6);

    // Plant Objects / Equipment
    plantLayout.objects.forEach((obj) => {
      ctx.fillStyle = obj.type === 'restricted_zone' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 41, 59, 0.7)';
      ctx.strokeStyle = obj.type === 'restricted_zone' ? '#ef4444' : '#3b82f6';
      ctx.lineWidth = 1.5;

      ctx.fillRect(obj.x * scaleX, obj.y * scaleY, obj.width * scaleX, obj.height * scaleY);
      ctx.strokeRect(obj.x * scaleX, obj.y * scaleY, obj.width * scaleX, obj.height * scaleY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(obj.name, obj.x * scaleX + 4, obj.y * scaleY + 14);
    });

    // Draw Robot Path Lines
    if (robot.path.length > 1) {
      ctx.strokeStyle = isEditMode && editTarget === 'robot' ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = isEditMode && editTarget === 'robot' ? 2.5 : 1.8;
      ctx.setLineDash(isEditMode && editTarget === 'robot' ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(robot.path[0].x * scaleX, robot.path[0].y * scaleY);
      for (let i = 1; i < robot.path.length; i++) {
        ctx.lineTo(robot.path[i].x * scaleX, robot.path[i].y * scaleY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Human Path Lines
    if (human.path.length > 1) {
      ctx.strokeStyle = isEditMode && editTarget === 'human' ? '#10b981' : 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = isEditMode && editTarget === 'human' ? 2.5 : 1.8;
      ctx.setLineDash(isEditMode && editTarget === 'human' ? [] : [3, 3]);
      ctx.beginPath();
      ctx.moveTo(human.path[0].x * scaleX, human.path[0].y * scaleY);
      for (let i = 1; i < human.path.length; i++) {
        ctx.lineTo(human.path[i].x * scaleX, human.path[i].y * scaleY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Waypoint Handles in Edit Mode
    if (isEditMode) {
      const activePath = editTarget === 'robot' ? robot.path : human.path;
      const pointColor = editTarget === 'robot' ? '#3b82f6' : '#10b981';

      activePath.forEach((pt, index) => {
        const sx = pt.x * scaleX;
        const sy = pt.y * scaleY;

        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${index + 1}`, sx, sy);
      });
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // Draw Proximity Connecting Line (During simulation)
    if (!isEditMode) {
      ctx.strokeStyle = safetyEval.riskLevel === 'SAFE' 
        ? 'rgba(16, 185, 129, 0.6)' 
        : safetyEval.riskLevel === 'WARNING' 
        ? 'rgba(245, 158, 11, 0.85)' 
        : 'rgba(239, 68, 68, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(robot.position.x * scaleX, robot.position.y * scaleY);
      ctx.lineTo(human.position.x * scaleX, human.position.y * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Dynamic Safety Envelope around Robot
      const dynamicRadiusPixels = safetyEval.requiredDynamicDistance * scaleX;
      ctx.fillStyle = safetyEval.riskLevel === 'SAFE' 
        ? 'rgba(6, 182, 212, 0.12)' 
        : safetyEval.riskLevel === 'WARNING' 
        ? 'rgba(245, 158, 11, 0.22)' 
        : 'rgba(239, 68, 68, 0.28)';
      ctx.strokeStyle = safetyEval.riskLevel === 'SAFE' 
        ? '#06b6d4' 
        : safetyEval.riskLevel === 'WARNING' 
        ? '#f59e0b' 
        : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(robot.position.x * scaleX, robot.position.y * scaleY, dynamicRadiusPixels, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Static Baseline Reference (Gray dashed circle)
      const staticRadiusPixels = safetyEval.staticBaselineDistance * scaleX;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(robot.position.x * scaleX, robot.position.y * scaleY, staticRadiusPixels, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Robot Entity
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(robot.position.x * scaleX, robot.position.y * scaleY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Robot Pointer
    const dirX = robot.position.x * scaleX + Math.cos(robot.direction) * 15;
    const dirY = robot.position.y * scaleY + Math.sin(robot.direction) * 15;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(robot.position.x * scaleX, robot.position.y * scaleY);
    ctx.lineTo(dirX, dirY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🤖 ' + robot.name.split(' ')[0], robot.position.x * scaleX - 16, robot.position.y * scaleY - 14);

    // Draw Human Entity
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(human.position.x * scaleX, human.position.y * scaleY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Human Pointer
    const hdirX = human.position.x * scaleX + Math.cos(human.direction) * 13;
    const hdirY = human.position.y * scaleY + Math.sin(human.direction) * 13;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(human.position.x * scaleX, human.position.y * scaleY);
    ctx.lineTo(hdirX, hdirY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('👷 ' + human.name.split(' ')[0], human.position.x * scaleX - 16, human.position.y * scaleY - 12);

  }, [robot, human, safetyEval, plantLayout, isEditMode, editTarget]);

  /* ---------------- Real-Time Telemetry Distance Chart ---------------- */

  useEffect(() => {
    const canvas = telemetryChartRef.current;
    if (!canvas || telemetry.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const padding = { top: 20, right: 20, bottom: 25, left: 35 };

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const maxT = Math.max(currentScenario.duration, simTime, 10);
    const maxDist = Math.max(
      ...telemetry.map((d) => Math.max(d.distance, d.requiredDistance, d.staticBaselineDistance)),
      8
    );

    const mapX = (tVal: number) => padding.left + (tVal / maxT) * (w - padding.left - padding.right);
    const mapY = (dVal: number) => h - padding.bottom - (dVal / maxDist) * (h - padding.top - padding.bottom);

    // Grid lines & labels
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';

    // Y-Axis Ticks
    for (let d = 0; d <= maxDist; d += 2) {
      const y = mapY(d);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${d}m`, 6, y + 3);
    }

    // Static baseline line (Gray dashed)
    const baseLineY = mapY(currentScenario.safetyRules.staticBaselineDistance);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, baseLineY);
    ctx.lineTo(w - padding.right, baseLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Required Dynamic Safety Distance Line (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    telemetry.forEach((pt, idx) => {
      const x = mapX(pt.time);
      const y = mapY(pt.requiredDistance);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current Separation Distance Line (Emerald / Amber / Red when breaching)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    telemetry.forEach((pt, idx) => {
      const x = mapX(pt.time);
      const y = mapY(pt.distance);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Red highlight when Distance < Required Distance
    telemetry.forEach((pt) => {
      if (pt.distance < pt.requiredDistance) {
        const x = mapX(pt.time);
        const yCur = mapY(pt.distance);
        const yReq = mapY(pt.requiredDistance);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.fillRect(x - 2, yReq, 4, yCur - yReq);
      }
    });

  }, [telemetry, currentScenario, simTime]);

  const handleStep = () => {
    const dt = 0.5;
    const nextTime = Math.round((simTime + dt) * 10) / 10;
    setSimTime(nextTime);
    setRobot((prev) => updateRobotMotion(prev, dt));
    setHuman((prev) => updateHumanMotion(prev, dt));
  };

  const handleReset = () => {
    setRobot({ ...currentScenario.initialRobot });
    setHuman({ ...currentScenario.initialHuman });
    setSimTime(0);
    setIsRunning(false);
    setTelemetry([]);
    setEvents([]);
    setRunSummary(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Mode Switcher */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-blue-400" />
          <div>
            <span className="text-xs text-slate-400 block">{t.simulator.scenario}</span>
            <select
              value={selectedScenarioIndex}
              onChange={(e) => setSelectedScenarioIndex(Number(e.target.value))}
              disabled={isRunning || isEditMode}
              className="bg-slate-900 text-slate-100 text-sm font-semibold rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 disabled:opacity-60"
            >
              {PREDEFINED_SCENARIOS.map((sc, idx) => (
                <option key={sc.id} value={idx}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action & Mode Switchers */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Toggle Edit Path Mode */}
          <button
            onClick={() => {
              setIsRunning(false);
              setIsEditMode(!isEditMode);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs border transition ${
              isEditMode
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? t.simulator.viewMode : t.simulator.editPath}</span>
          </button>

          {!isEditMode && (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs shadow transition ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? t.simulator.pause : t.simulator.play}</span>
              </button>

              <button
                onClick={handleStep}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 font-medium text-xs border border-slate-600 transition"
              >
                <StepForward className="w-4 h-4" />
                <span>{t.simulator.step}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs border border-slate-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.simulator.reset}</span>
              </button>

              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
                {[1, 2, 4].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setTimeScale(scale)}
                    className={`px-2 py-1 rounded font-mono ${
                      timeScale === scale ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-700 font-mono text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{simTime.toFixed(1)}s / {currentScenario.duration}s</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Path Editor Toolbar (when Edit Mode is Active) */}
      {isEditMode && (
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-300">Target Path:</span>
            <button
              onClick={() => setEditTarget('robot')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                editTarget === 'robot' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🤖 {t.simulator.robotPath} ({robot.path.length} nodes)
            </button>
            <button
              onClick={() => setEditTarget('human')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                editTarget === 'human' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              👷 {t.simulator.humanPath} ({human.path.length} nodes)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveCustomPath}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.simulator.savePath}</span>
            </button>
            <button
              onClick={handleResetPath}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.simulator.resetPath}</span>
            </button>
            <button
              onClick={handleClearPath}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.simulator.clearPath}</span>
            </button>
          </div>

          {pathValidationMsg && (
            <div className={`w-full mt-1 p-2 rounded text-[11px] font-mono ${
              pathValidationMsg.isError ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {pathValidationMsg.text}
            </div>
          )}
        </div>
      )}

      {/* Main Simulation Viewport (Canvas + Telemetry) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Kinematic Controls */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>🤖 Robot State</span>
              <span className="font-mono text-blue-400 text-[11px]">{robot.status}</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Velocity</span>
                <span className="font-mono text-slate-200">{robot.currentSpeed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="3.5"
                step="0.1"
                value={robot.currentSpeed}
                onChange={(e) => setRobot({ ...robot, currentSpeed: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-700/60 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Position:</span>
                <span>({robot.position.x.toFixed(1)}, {robot.position.y.toFixed(1)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stopping Time:</span>
                <span>{robot.stoppingTime}s</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>👷 Human State</span>
              <span className="font-mono text-emerald-400 text-[11px]">{human.status}</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Task Activity</span>
                <span className="font-semibold text-slate-200">{human.task}</span>
              </div>
              <select
                value={human.task}
                onChange={(e) => setHuman({ ...human, task: e.target.value as any })}
                className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700"
              >
                <option value="Inspection">Inspection (1.0x)</option>
                <option value="Maintenance">Maintenance (1.4x)</option>
                <option value="Material handling">Material handling (1.3x)</option>
                <option value="Quality checking">Quality checking (1.1x)</option>
                <option value="Cleaning">Cleaning (1.2x)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Walk Speed</span>
                <span className="font-mono text-slate-200">{human.currentSpeed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={human.currentSpeed}
                onChange={(e) => setHuman({ ...human, currentSpeed: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-700/60 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Position:</span>
                <span>({human.position.x.toFixed(1)}, {human.position.y.toFixed(1)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reaction Time:</span>
                <span>{human.reactionTime}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div className="xl:col-span-6 flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-inner relative">
          <canvas
            ref={canvasRef}
            width={580}
            height={480}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`rounded-lg shadow-md max-w-full h-auto ${isEditMode ? 'cursor-crosshair border border-purple-500/50' : ''}`}
          />

          {/* Canvas Legend */}
          <div className="w-full flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-3 pt-3 border-t border-slate-800/80 gap-2 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span>Robot AMR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Plant Human</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
              <span>Dynamic Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border border-slate-400 border-dashed inline-block"></span>
              <span>Static Baseline</span>
            </div>
            {isEditMode && (
              <span className="text-purple-400 font-bold">● Click to add | Drag to move | Right-click to delete</span>
            )}
          </div>
        </div>

        {/* Right Column: Live Safety Engine Decision Telemetry */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {t.simulator.riskAssessment}
            </h3>

            {/* Risk Badge */}
            <div className={`p-3 rounded-lg border text-center font-bold text-base flex items-center justify-center gap-2 ${
              safetyEval.riskLevel === 'SAFE'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                : safetyEval.riskLevel === 'WARNING'
                ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                : 'bg-rose-950/70 text-rose-300 border-rose-800 animate-pulse'
            }`}>
              {safetyEval.riskLevel === 'SAFE' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              {safetyEval.riskLevel === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {safetyEval.riskLevel === 'UNSAFE' && <AlertOctagon className="w-5 h-5 text-rose-400" />}
              {safetyEval.riskLevel === 'EMERGENCY' && <AlertOctagon className="w-5 h-5 text-red-400" />}
              <span>{t.safetyStates[safetyEval.riskLevel]}</span>
            </div>

            {/* Distance Metrics */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-700/60">
                <span className="text-slate-400">Current Separation:</span>
                <span className="text-sm font-bold text-white">{safetyEval.currentDistance.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-700/60">
                <span className="text-slate-400">Required Dynamic:</span>
                <span className="text-sm font-bold text-cyan-400">{safetyEval.requiredDynamicDistance.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-700/60">
                <span className="text-slate-400">Static Baseline:</span>
                <span className="text-sm font-bold text-slate-400">{safetyEval.staticBaselineDistance.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-700/60">
                <span className="text-slate-400">Remaining Margin:</span>
                <span className={`text-sm font-bold ${safetyEval.safetyMarginRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {safetyEval.safetyMarginRemaining.toFixed(2)} m
                </span>
              </div>
            </div>

            {/* Explainable Decision Box */}
            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Explainable Decision</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {safetyEval.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Distance Chart & Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Distance Over Time Chart */}
        <div className="lg:col-span-8 bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              {t.simulator.liveChart}
            </h3>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-emerald-500 inline-block"></span>
                <span>Current Dist</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-cyan-400 inline-block"></span>
                <span>Required Dynamic</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border border-slate-400 border-dashed inline-block"></span>
                <span>Static (4.5m)</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
            <canvas
              ref={telemetryChartRef}
              width={700}
              height={180}
              className="w-full h-auto rounded"
            />
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Note: Red shaded areas visually indicate time intervals where Current Separation Distance &lt; Required Dynamic Distance (safety violation).
          </div>
        </div>

        {/* Right: Telemetry Action Tools & Summary Export */}
        <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700/70 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              Telemetry Export & Actions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time telemetry records instantaneous entity coordinates, velocities, and margin clearances at 10Hz sampling.
            </p>

            <div className="mt-3 space-y-2">
              <button
                onClick={handleExportTelemetryCSV}
                disabled={telemetry.length === 0}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>{t.simulator.exportTelemetryCSV} ({telemetry.length} pts)</span>
              </button>

              <button
                onClick={handleSaveToExperimentHistory}
                disabled={!runSummary}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{savedExpNotice ? '✓ Saved to History!' : t.simulator.saveAsExperiment}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Snapshot */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Telemetry Samples:</span>
              <span className="text-slate-200 font-bold">{telemetry.length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Min Distance:</span>
              <span className="text-amber-400 font-bold">
                {telemetry.length > 0 ? `${Math.min(...telemetry.map(t => t.distance)).toFixed(2)}m` : '--'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Max Required:</span>
              <span className="text-cyan-400 font-bold">
                {telemetry.length > 0 ? `${Math.max(...telemetry.map(t => t.requiredDistance)).toFixed(2)}m` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Run Summary Card (When available) */}
      {runSummary && (
        <div className="bg-slate-900/90 border border-blue-900/60 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {t.simulator.simulationSummary}: {runSummary.scenarioName}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              runSummary.maxRiskLevel === 'SAFE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              runSummary.maxRiskLevel === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              Max State: {runSummary.maxRiskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Min Distance:</span>
              <span className="text-amber-300 font-bold text-sm">{runSummary.minDistance} m</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Min Safety Margin:</span>
              <span className={`font-bold text-sm ${runSummary.minSafetyMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {runSummary.minSafetyMargin} m
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">1st Warning Time:</span>
              <span className="text-slate-200 font-bold">{runSummary.firstWarningTime !== null ? `${runSummary.firstWarningTime}s` : 'None'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">1st Unsafe Time:</span>
              <span className="text-slate-200 font-bold">{runSummary.firstUnsafeTime !== null ? `${runSummary.firstUnsafeTime}s` : 'None'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Total Unsafe Time:</span>
              <span className="text-rose-400 font-bold">{runSummary.totalUnsafeDuration}s</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Stops Avoided:</span>
              <span className="text-cyan-400 font-bold">+{runSummary.unnecessaryRestrictionsAvoidedDuration}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Safety Event Stream Log */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          {t.simulator.timeline} ({events.length} records)
        </h3>
        <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-slate-500 py-3 text-center font-sans">
              No proximity warnings or threshold breaches recorded yet. Run simulation to stream real-time events.
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">[{evt.simulationTime.toFixed(1)}s]</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    evt.riskLevel === 'WARNING' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                  }`}>
                    {evt.riskLevel}
                  </span>
                  <span className="text-slate-300 font-sans">{evt.message}</span>
                </div>
                <span className="text-slate-400">Dist: {evt.distance.toFixed(2)}m</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
