import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Info,
  Edit3,
  Download,
  BookmarkPlus,
  Activity,
  CloudRain,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Users,
  Bot,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { PREDEFINED_SCENARIOS } from '../engine/scenarios/scenarioData';
import { 
  evaluateMultiAgentSafetyState,
  DEFAULT_SAFETY_RULES,
  DEFAULT_ENVIRONMENT_CONFIG,
  FLOOR_FRICTION_PRESETS
} from '../engine/safety/safetyEngine';
import { updateMultiAgentMotion } from '../engine/physics/motionEngine';
import type { 
  ScenarioDefinition, 
  RobotEntity, 
  HumanEntity, 
  SafetyEvent, 
  PathWaypoint, 
  TelemetrySample, 
  SimulationRunSummary,
  ExperimentRecord,
  EnvironmentalContext,
  FloorConditionType,
  RiskLevel,
  PairwiseEvaluation,
  MultiAgentEvaluationResult
} from '../types';
import { storageService } from '../services/storageService';

interface SimulatorPageProps {
  language: Language;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ language }) => {
  const t = translations[language];
  const [simMode, setSimMode] = useState<'single' | 'multi'>('single');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const currentScenario: ScenarioDefinition = PREDEFINED_SCENARIOS[selectedScenarioIndex] || PREDEFINED_SCENARIOS[0];

  // Environmental Context State
  const [envConfig, setEnvConfig] = useState<EnvironmentalContext>(() => {
    if (currentScenario.environment) return { ...currentScenario.environment };
    return storageService.getEnvironmentConfig?.() || { ...DEFAULT_ENVIRONMENT_CONFIG };
  });
  const [showEnvDrawer, setShowEnvDrawer] = useState<boolean>(false);

  // Entities State (Single + Multi-Agent Support)
  const [robots, setRobots] = useState<RobotEntity[]>(() => {
    if (currentScenario.robots && currentScenario.robots.length > 0) {
      return currentScenario.robots.map(r => ({ ...r, isActive: r.isActive !== false }));
    }
    return [{ ...currentScenario.initialRobot, isActive: true }];
  });

  const [humans, setHumans] = useState<HumanEntity[]>(() => {
    if (currentScenario.humans && currentScenario.humans.length > 0) {
      return currentScenario.humans.map(h => ({ ...h, isActive: h.isActive !== false }));
    }
    return [{ ...currentScenario.initialHuman, isActive: true }];
  });

  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySample[]>([]);

  // Edit Path State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editEntityType, setEditEntityType] = useState<'robot' | 'human'>('robot');
  const [editEntityIndex, setEditEntityIndex] = useState<number>(0);
  const [draggedWaypointIndex, setDraggedWaypointIndex] = useState<number | null>(null);

  // Simulation Summary Modal / Card State
  const [runSummary, setRunSummary] = useState<SimulationRunSummary | null>(null);
  const [savedExpNotice, setSavedExpNotice] = useState<boolean>(false);

  const plantLayout = storageService.getPlantLayout();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetryChartRef = useRef<HTMLCanvasElement | null>(null);

  // Multi-Agent Safety Evaluation (arbitrates highest risk across all entity pairs)
  const multiEval: MultiAgentEvaluationResult = evaluateMultiAgentSafetyState(
    currentScenario.safetyRules || DEFAULT_SAFETY_RULES,
    robots,
    humans,
    envConfig
  );

  const overallRisk: RiskLevel = multiEval.overallRiskLevel;
  const highestPair = multiEval.highestThreatPair;
  const inspectedPair: PairwiseEvaluation | null = 
    (selectedPairId ? multiEval.pairwiseEvaluations.find(p => p.id === selectedPairId) : null) || highestPair;

  const currentSepDistance = inspectedPair ? inspectedPair.currentDistance : 10.0;
  const currentReqDistance = inspectedPair ? inspectedPair.requiredDynamicDistance : 2.5;

  // Reset simulation when scenario changes
  useEffect(() => {
    if (currentScenario.robots && currentScenario.robots.length > 0) {
      setRobots(currentScenario.robots.map(r => ({ ...r, isActive: r.isActive !== false })));
      setSimMode(currentScenario.robots.length > 1 ? 'multi' : 'single');
    } else {
      setRobots([{ ...currentScenario.initialRobot, isActive: true }]);
    }

    if (currentScenario.humans && currentScenario.humans.length > 0) {
      setHumans(currentScenario.humans.map(h => ({ ...h, isActive: h.isActive !== false })));
    } else {
      setHumans([{ ...currentScenario.initialHuman, isActive: true }]);
    }

    if (currentScenario.environment) {
      setEnvConfig({ ...currentScenario.environment });
    } else {
      setEnvConfig({ ...DEFAULT_ENVIRONMENT_CONFIG });
    }

    setSimTime(0);
    setIsRunning(false);
    setEvents([]);
    setTelemetry([]);
    setRunSummary(null);
    setIsEditMode(false);
    setSelectedPairId(null);
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
    return { x: Number(px.toFixed(2)), y: Number(py.toFixed(2)) };
  }, [plantLayout.width, plantLayout.height]);

  // Handle floor condition change
  const handleFloorChange = (condition: FloorConditionType) => {
    const preset = FLOOR_FRICTION_PRESETS[condition];
    setEnvConfig(prev => ({
      ...prev,
      floorCondition: condition,
      frictionCoefficient: preset.friction,
      ambientNotes: preset.label + ' (' + preset.description + ')'
    }));
  };

  // Toggle active state for an entity
  const toggleRobotActive = (idx: number) => {
    setRobots(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], isActive: !next[idx].isActive };
      return next;
    });
  };

  const toggleHumanActive = (idx: number) => {
    setHumans(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], isActive: !next[idx].isActive };
      return next;
    });
  };

  // Step simulation logic
  const stepSimulation = useCallback((dt: number) => {
    const timeStep = dt * timeScale;
    
    // Update motion for all agents
    const { robots: nextRobots, humans: nextHumans } = updateMultiAgentMotion(robots, humans, timeStep);
    setRobots(nextRobots);
    setHumans(nextHumans);

    const nextTime = Number((simTime + timeStep).toFixed(2));
    setSimTime(nextTime);

    // Evaluate current safety state
    const currentMultiEval = evaluateMultiAgentSafetyState(
      currentScenario.safetyRules || DEFAULT_SAFETY_RULES,
      nextRobots,
      nextHumans,
      envConfig
    );

    // Log safety events if state triggers
    const activeThreat = currentMultiEval.highestThreatPair;
    if (activeThreat && activeThreat.riskLevel !== 'SAFE') {
      setEvents(prev => {
        const lastEvt = prev[prev.length - 1];
        if (!lastEvt || lastEvt.riskLevel !== activeThreat.riskLevel || (nextTime - lastEvt.simulationTime > 1.5)) {
          return [
            ...prev.slice(-49),
            {
              id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              timestamp: Date.now(),
              simulationTime: nextTime,
              scenarioId: currentScenario.id,
              scenarioName: currentScenario.name,
              riskLevel: activeThreat.riskLevel,
              distance: activeThreat.currentDistance,
              requiredDistance: activeThreat.requiredDynamicDistance,
              robotSpeed: nextRobots[0]?.currentSpeed || 0,
              humanSpeed: nextHumans[0]?.currentSpeed || 0,
              humanTask: nextHumans[0]?.task || 'Inspection',
              message: `[${activeThreat.id}] ${activeThreat.explanation} (Floor μ=${envConfig.frictionCoefficient})`
            }
          ];
        }
        return prev;
      });
    }

    // Record Telemetry
    setTelemetry(prev => {
      const primaryRob = nextRobots[0] || currentScenario.initialRobot;
      const primaryHum = nextHumans[0] || currentScenario.initialHuman;
      const sepDist = activeThreat ? activeThreat.currentDistance : 10.0;
      const reqDist = activeThreat ? activeThreat.requiredDynamicDistance : 2.5;

      const sample: TelemetrySample = {
        time: nextTime,
        robotX: primaryRob.position.x,
        robotY: primaryRob.position.y,
        humanX: primaryHum.position.x,
        humanY: primaryHum.position.y,
        robotSpeed: primaryRob.currentSpeed,
        humanSpeed: primaryHum.currentSpeed,
        distance: sepDist,
        requiredDistance: reqDist,
        staticBaselineDistance: currentScenario.safetyRules?.staticBaselineDistance || 3.0,
        safetyMargin: currentScenario.safetyRules?.safetyMargin || 0.5,
        riskLevel: currentMultiEval.overallRiskLevel,
        baselineRiskLevel: sepDist < 3.0 ? 'UNSAFE' : 'SAFE'
      };
      return [...prev.slice(-299), sample];
    });

    // Check completion if all primary paths are finished
    const allRobotsDone = nextRobots.every((r: RobotEntity) => r.currentWaypointIndex >= r.path.length - 1);
    const allHumansDone = nextHumans.every((h: HumanEntity) => h.currentWaypointIndex >= h.path.length - 1);
    if (allRobotsDone && allHumansDone && nextTime > 2) {
      setIsRunning(false);
      generateRunSummary(nextTime, currentMultiEval);
    }
  }, [robots, humans, simTime, timeScale, currentScenario, envConfig]);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (isRunning) {
        const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        stepSimulation(delta);
      }
      lastTimestamp = timestamp;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, stepSimulation]);

  // Generate Run Summary
  const generateRunSummary = useCallback((finalTime: number, evalResult: MultiAgentEvaluationResult) => {
    if (telemetry.length === 0) return;
    
    let minDist = 999;
    let minMargin = 999;
    let warningTimeTotal = 0;
    let unsafeTimeTotal = 0;
    let staticViolationsTotal = 0;
    let dynamicAvoidedTotal = 0;
    let firstWarn: number | null = null;
    let firstUnsafe: number | null = null;
    let maxRisk: RiskLevel = 'SAFE';

    const riskRank: Record<RiskLevel, number> = { SAFE: 0, WARNING: 1, UNSAFE: 2, EMERGENCY: 3 };

    telemetry.forEach(t => {
      if (t.distance < minDist) minDist = t.distance;
      const margin = t.distance - t.requiredDistance;
      if (margin < minMargin) minMargin = margin;

      if (t.riskLevel === 'WARNING') {
        warningTimeTotal += 0.1;
        if (firstWarn === null) firstWarn = t.time;
      }
      if (t.riskLevel === 'UNSAFE' || t.riskLevel === 'EMERGENCY') {
        unsafeTimeTotal += 0.1;
        if (firstUnsafe === null) firstUnsafe = t.time;
      }
      if (t.baselineRiskLevel === 'UNSAFE') {
        staticViolationsTotal += 0.1;
      }
      if (t.distance >= t.requiredDistance && t.distance < 3.0) {
        dynamicAvoidedTotal += 0.1;
      }
      if (riskRank[t.riskLevel] > riskRank[maxRisk]) {
        maxRisk = t.riskLevel;
      }
    });

    const summary: SimulationRunSummary = {
      scenarioId: currentScenario.id,
      scenarioName: currentScenario.name,
      robotName: robots.map(r => r.name).join(', '),
      humanName: humans.map(h => h.name).join(', '),
      duration: Number(finalTime.toFixed(1)),
      minDistance: Number(minDist.toFixed(2)),
      minSafetyMargin: Number(minMargin.toFixed(2)),
      firstWarningTime: firstWarn,
      firstUnsafeTime: firstUnsafe,
      totalWarningDuration: Number(warningTimeTotal.toFixed(1)),
      totalUnsafeDuration: Number(unsafeTimeTotal.toFixed(1)),
      maxRiskLevel: maxRisk,
      eventCount: events.length,
      events: [...events],
      baselineTimeInZone: Number(staticViolationsTotal.toFixed(1)),
      dynamicTimeInZone: Number(unsafeTimeTotal.toFixed(1)),
      unnecessaryRestrictionsAvoidedDuration: Number(dynamicAvoidedTotal.toFixed(1)),
      environmentalContext: { ...envConfig },
      multiAgentSummary: {
        totalRobots: robots.length,
        totalHumans: humans.length,
        totalPairsEvaluated: evalResult.totalPairsEvaluated,
        highestThreatPairId: evalResult.highestThreatPair?.id || 'None',
        meanEvaluationTimeMicroseconds: Math.round(evalResult.evaluationTimeMs * 1000)
      }
    };

    setRunSummary(summary);
  }, [telemetry, currentScenario, robots, humans, events, envConfig]);

  // Reset Simulation Handler
  const handleReset = () => {
    setIsRunning(false);
    if (currentScenario.robots && currentScenario.robots.length > 0) {
      setRobots(currentScenario.robots.map(r => ({ ...r, isActive: r.isActive !== false })));
    } else {
      setRobots([{ ...currentScenario.initialRobot, isActive: true }]);
    }

    if (currentScenario.humans && currentScenario.humans.length > 0) {
      setHumans(currentScenario.humans.map(h => ({ ...h, isActive: h.isActive !== false })));
    } else {
      setHumans([{ ...currentScenario.initialHuman, isActive: true }]);
    }

    setSimTime(0);
    setEvents([]);
    setTelemetry([]);
    setRunSummary(null);
    setSelectedPairId(null);
  };

  // Save experiment record
  const handleSaveExperiment = () => {
    if (!runSummary) return;
    const record: ExperimentRecord = {
      id: 'exp-' + Date.now(),
      timestamp: new Date().toISOString(),
      scenarioId: currentScenario.id,
      scenarioName: currentScenario.name,
      config: {
        robotSpeed: robots[0]?.currentSpeed || 1.5,
        humanSpeed: humans[0]?.currentSpeed || 1.2,
        reactionTime: humans[0]?.reactionTime || 0.5,
        stoppingTime: robots[0]?.stoppingTime || 0.8,
        safetyMargin: currentScenario.safetyRules.safetyMargin,
        baseDistance: currentScenario.safetyRules.baseDistance,
        humanTask: humans[0]?.task || 'Inspection',
        useDirectionalFactor: currentScenario.safetyRules.useDirectionalFactor,
        staticBaselineDistance: currentScenario.safetyRules.staticBaselineDistance,
        environmentalContext: { ...envConfig }
      },
      summary: runSummary
    };
    storageService.saveExperimentRecord(record);
    setSavedExpNotice(true);
    setTimeout(() => setSavedExpNotice(false), 3000);
  };

  // Export Telemetry CSV
  const handleExportCSV = () => {
    if (telemetry.length === 0) return;
    const headers = ['Time(s)', 'RobotX(m)', 'RobotY(m)', 'RobotSpeed(m/s)', 'HumanX(m)', 'HumanY(m)', 'HumanSpeed(m/s)', 'Distance(m)', 'RequiredDistance(m)', 'RiskLevel', 'StaticBaselineViolation'];
    const rows = telemetry.map(t => [
      t.time,
      t.robotX.toFixed(2),
      t.robotY.toFixed(2),
      t.robotSpeed.toFixed(2),
      t.humanX.toFixed(2),
      t.humanY.toFixed(2),
      t.humanSpeed.toFixed(2),
      t.distance.toFixed(2),
      t.requiredDistance.toFixed(2),
      t.riskLevel,
      t.baselineRiskLevel === 'UNSAFE' ? 'YES' : 'NO'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    storageService.downloadCSV(csvContent, `telemetry-${currentScenario.id}-${Date.now()}.csv`);
  };

  // Canvas Drawing for Multi-Agent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Floor environmental tint
    if (envConfig.floorCondition === 'WET_WASHDOWN') {
      ctx.fillStyle = 'rgba(14, 116, 144, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (envConfig.floorCondition === 'OIL_CHEMICAL_SLICK') {
      ctx.fillStyle = 'rgba(161, 98, 7, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (envConfig.floorCondition === 'COLD_FROST') {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);
    }

    // Grid lines (every 10m in plant space)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= plantLayout.width; x += 10) {
      const c = getCanvasCoords(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(c.x, 0);
      ctx.lineTo(c.x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= plantLayout.height; y += 10) {
      const c = getCanvasCoords(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, c.y);
      ctx.lineTo(width, c.y);
      ctx.stroke();
    }

    // Draw Plant Objects (Zones & Obstacles)
    plantLayout.objects.forEach(obj => {
      const p1 = getCanvasCoords(obj.x, obj.y, width, height);
      const ow = (obj.width / plantLayout.width) * width;
      const oh = (obj.height / plantLayout.height) * height;

      if (obj.type === 'restricted_zone') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(p1.x, p1.y, ow, oh);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(p1.x, p1.y, ow, oh);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#334155';
        ctx.fillRect(p1.x, p1.y, ow, oh);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(p1.x, p1.y, ow, oh);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(obj.name, p1.x + 4, p1.y + 12);
    });

    // Color palettes for entities
    const robotColors = [
      { fill: '#0284c7', stroke: '#38bdf8', text: '#38bdf8', name: 'R1' },
      { fill: '#0891b2', stroke: '#22d3ee', text: '#22d3ee', name: 'R2' },
      { fill: '#4f46e5', stroke: '#818cf8', text: '#818cf8', name: 'R3' }
    ];

    const humanColors = [
      { fill: '#9333ea', stroke: '#c084fc', text: '#d8b4fe', name: 'H1' },
      { fill: '#db2777', stroke: '#f472b6', text: '#fbcfe8', name: 'H2' },
      { fill: '#ea580c', stroke: '#fb923c', text: '#fed7aa', name: 'H3' }
    ];

    // Draw Robot Paths & Envelopes
    robots.forEach((r, idx) => {
      if (r.isActive === false) return;
      const rCol = robotColors[idx % robotColors.length];
      const rPos = getCanvasCoords(r.position.x, r.position.y, width, height);

      // Path
      if (r.path.length > 1) {
        ctx.strokeStyle = rCol.stroke + '66';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        r.path.forEach((pt, i) => {
          const c = getCanvasCoords(pt.x, pt.y, width, height);
          if (i === 0) ctx.moveTo(c.x, c.y);
          else ctx.lineTo(c.x, c.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Dynamic Required Safety Envelope
      const reqDist = inspectedPair && (inspectedPair.entityAId === r.id || inspectedPair.entityBId === r.id)
        ? inspectedPair.requiredDynamicDistance
        : 2.5;
      const reqRadiusPx = (reqDist / plantLayout.width) * width;

      ctx.strokeStyle = overallRisk === 'EMERGENCY' ? 'rgba(244, 63, 94, 0.8)' :
                        overallRisk === 'UNSAFE' ? 'rgba(245, 158, 11, 0.7)' :
                        overallRisk === 'WARNING' ? 'rgba(234, 179, 8, 0.6)' :
                        'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(rPos.x, rPos.y, reqRadiusPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = overallRisk === 'EMERGENCY' ? 'rgba(244, 63, 94, 0.10)' :
                      overallRisk === 'UNSAFE' ? 'rgba(245, 158, 11, 0.08)' :
                      overallRisk === 'WARNING' ? 'rgba(234, 179, 8, 0.05)' :
                      'rgba(16, 185, 129, 0.03)';
      ctx.fill();

      // Draw Robot Body
      ctx.save();
      ctx.translate(rPos.x, rPos.y);
      ctx.rotate(r.direction || 0);

      ctx.fillStyle = rCol.fill;
      ctx.fillRect(-10, -7, 20, 14);
      ctx.strokeStyle = rCol.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-10, -7, 20, 14);

      // Heading pointer
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(4, -4);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Robot Label
      ctx.fillStyle = rCol.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${rCol.name}: ${r.name} (${r.currentSpeed.toFixed(1)}m/s)`, rPos.x + 14, rPos.y - 6);
    });

    // Draw Human Paths & Entities
    humans.forEach((h, idx) => {
      if (h.isActive === false) return;
      const hCol = humanColors[idx % humanColors.length];
      const hPos = getCanvasCoords(h.position.x, h.position.y, width, height);

      // Path
      if (h.path.length > 1) {
        ctx.strokeStyle = hCol.stroke + '66';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        h.path.forEach((pt, i) => {
          const c = getCanvasCoords(pt.x, pt.y, width, height);
          if (i === 0) ctx.moveTo(c.x, c.y);
          else ctx.lineTo(c.x, c.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Human Circle
      ctx.fillStyle = hCol.fill;
      ctx.beginPath();
      ctx.arc(hPos.x, hPos.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hCol.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = hCol.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${hCol.name}: ${h.name} [${h.task}]`, hPos.x + 12, hPos.y - 6);
    });

    // Draw Active Threat Connection Line
    if (inspectedPair) {
      const entA = robots.find(r => r.id === inspectedPair.entityAId) || humans.find(h => h.id === inspectedPair.entityAId);
      const entB = robots.find(r => r.id === inspectedPair.entityBId) || humans.find(h => h.id === inspectedPair.entityBId);

      if (entA && entB && entA.isActive !== false && entB.isActive !== false) {
        const pA = getCanvasCoords(entA.position.x, entA.position.y, width, height);
        const pB = getCanvasCoords(entB.position.x, entB.position.y, width, height);

        ctx.strokeStyle = inspectedPair.riskLevel === 'EMERGENCY' ? '#f43f5e' :
                          inspectedPair.riskLevel === 'UNSAFE' ? '#f59e0b' :
                          inspectedPair.riskLevel === 'WARNING' ? '#eab308' :
                          '#10b981';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Midpoint Separation Label
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;
        ctx.fillStyle = '#020617';
        ctx.fillRect(midX - 32, midY - 11, 64, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(midX - 32, midY - 11, 64, 20);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${inspectedPair.currentDistance.toFixed(2)}m (${inspectedPair.riskLevel})`, midX, midY + 4);
        ctx.textAlign = 'left';
      }
    }

  }, [robots, humans, plantLayout, overallRisk, inspectedPair, envConfig, getCanvasCoords]);

  // Telemetry Mini-Graph Canvas
  useEffect(() => {
    const canvas = telemetryChartRef.current;
    if (!canvas || telemetry.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const maxD = Math.max(...telemetry.map(t => Math.max(t.distance, t.requiredDistance)), 6);
    const maxT = Math.max(telemetry[telemetry.length - 1].time, 1);

    // Plot Separation Distance
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    telemetry.forEach((pt, i) => {
      const px = (pt.time / maxT) * (w - 20) + 10;
      const py = h - 10 - (pt.distance / maxD) * (h - 20);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Plot Required Distance
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    telemetry.forEach((pt, i) => {
      const px = (pt.time / maxT) * (w - 20) + 10;
      const py = h - 10 - (pt.requiredDistance / maxD) * (h - 20);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }, [telemetry]);

  // Canvas Mouse Click for Waypoint Editing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const activeEntity = editEntityType === 'robot' ? robots[editEntityIndex] : humans[editEntityIndex];
    if (!activeEntity) return;

    const w = canvas.width;
    const h = canvas.height;

    let foundIdx: number | null = null;
    activeEntity.path.forEach((wp, idx) => {
      const c = getCanvasCoords(wp.x, wp.y, w, h);
      const dist = Math.hypot(c.x - x, c.y - y);
      if (dist < 12) foundIdx = idx;
    });

    if (foundIdx !== null) {
      setDraggedWaypointIndex(foundIdx);
    } else {
      const newPt = getPlantCoords(x, y, w, h);
      if (editEntityType === 'robot') {
        setRobots(prev => {
          const next = [...prev];
          next[editEntityIndex] = { ...next[editEntityIndex], path: [...next[editEntityIndex].path, newPt] };
          return next;
        });
      } else {
        setHumans(prev => {
          const next = [...prev];
          next[editEntityIndex] = { ...next[editEntityIndex], path: [...next[editEntityIndex].path, newPt] };
          return next;
        });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || draggedWaypointIndex === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pt = getPlantCoords(x, y, canvas.width, canvas.height);

    if (editEntityType === 'robot') {
      setRobots(prev => {
        const next = [...prev];
        const nextPath = [...next[editEntityIndex].path];
        nextPath[draggedWaypointIndex] = pt;
        next[editEntityIndex] = { ...next[editEntityIndex], path: nextPath, position: draggedWaypointIndex === 0 ? pt : next[editEntityIndex].position };
        return next;
      });
    } else {
      setHumans(prev => {
        const next = [...prev];
        const nextPath = [...next[editEntityIndex].path];
        nextPath[draggedWaypointIndex] = pt;
        next[editEntityIndex] = { ...next[editEntityIndex], path: nextPath, position: draggedWaypointIndex === 0 ? pt : next[editEntityIndex].position };
        return next;
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedWaypointIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner, Mode Switcher & Scenario Selector */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSimMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                simMode === 'single'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t.multiAgent.modeSingle}</span>
            </button>
            <button
              onClick={() => setSimMode('multi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                simMode === 'multi'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.multiAgent.modeMulti}</span>
            </button>
          </div>

          {/* Scenario Selector */}
          <div className="flex flex-col">
            <select
              value={selectedScenarioIndex}
              onChange={(e) => setSelectedScenarioIndex(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white font-semibold text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {PREDEFINED_SCENARIOS.map((sc, idx) => (
                <option key={sc.id} value={idx}>
                  {sc.id}: {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Environmental Drawer Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnvDrawer(!showEnvDrawer)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showEnvDrawer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <CloudRain className="w-4 h-4 text-amber-400" />
            <span>Environmental Conditions</span>
            {showEnvDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Multi-Agent Active Entities Chips Bar */}
      {simMode === 'multi' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1">Active Agents:</span>
            
            {/* Robot Toggles */}
            {robots.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => toggleRobotActive(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono transition border ${
                  r.isActive !== false
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-sm'
                    : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>R{idx + 1}: {r.name}</span>
                {r.isActive !== false ? <CheckCircle2 className="w-3 h-3 text-cyan-400" /> : <span className="text-[10px]">OFF</span>}
              </button>
            ))}

            {/* Human Toggles */}
            {humans.map((h, idx) => (
              <button
                key={h.id}
                onClick={() => toggleHumanActive(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono transition border ${
                  h.isActive !== false
                    ? 'bg-purple-950/80 text-purple-300 border-purple-700 shadow-sm'
                    : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>H{idx + 1}: {h.name}</span>
                {h.isActive !== false ? <CheckCircle2 className="w-3 h-3 text-purple-400" /> : <span className="text-[10px]">OFF</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Pairs Evaluated: <strong className="text-cyan-400">{multiEval.totalPairsEvaluated}</strong></span>
            <span>Eval Time: <strong className="text-emerald-400">{multiEval.evaluationTimeMs}ms</strong></span>
          </div>
        </div>
      )}

      {/* Environmental Conditions Drawer */}
      {showEnvDrawer && (
        <div className="bg-slate-900/95 border border-amber-500/30 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Environmental Physics Calibration
              </h3>
            </div>
            <button
              onClick={() => setEnvConfig({ ...DEFAULT_ENVIRONMENT_CONFIG })}
              className="text-[11px] text-cyan-400 hover:underline font-mono"
            >
              Reset to Nominal (25°C, 1.013 bar, μ=1.0, η=0.0)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Floor Condition */}
            <div className="space-y-1.5">
              <label className="text-slate-400 flex items-center gap-1 font-semibold">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                Floor Traction Preset
              </label>
              <select
                value={envConfig.floorCondition}
                onChange={(e) => handleFloorChange(e.target.value as FloorConditionType)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="DRY_CLEAN">Dry Clean Concrete (μ=1.0)</option>
                <option value="WET_WASHDOWN">Wet Washdown Area (μ=0.65)</option>
                <option value="OIL_CHEMICAL_SLICK">Oil / Chemical Spill (μ=0.35)</option>
                <option value="COLD_FROST">Cold Storage Frost (μ=0.20)</option>
              </select>
            </div>

            {/* Custom Friction Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-400 font-semibold">Friction Coeff (μ):</label>
                <span className="text-cyan-400 font-mono font-bold">{envConfig.frictionCoefficient.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={envConfig.frictionCoefficient}
                onChange={(e) => setEnvConfig(prev => ({ ...prev, frictionCoefficient: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Ambient Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-400 font-semibold">Temperature (T):</label>
                <span className="text-amber-400 font-mono font-bold">{envConfig.temperature}°C</span>
              </div>
              <input
                type="range"
                min="-20"
                max="60"
                step="1"
                value={envConfig.temperature}
                onChange={(e) => setEnvConfig(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Sensor Degradation */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-400 font-semibold">Sensor Degradation (η):</label>
                <span className="text-rose-400 font-mono font-bold">{(envConfig.sensorDegradationFactor * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={envConfig.sensorDegradationFactor}
                onChange={(e) => setEnvConfig(prev => ({ ...prev, sensorDegradationFactor: parseFloat(e.target.value) }))}
                className="w-full accent-rose-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Simulation Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Canvas & Live Formula Overlay */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Top Canvas Status Bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg shadow">
                <span className="text-[11px] font-mono text-slate-400">Sim Time:</span>
                <span className="font-mono font-bold text-white text-xs">{simTime.toFixed(1)}s</span>
              </div>

              {/* Live Safety Status Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs shadow ${
                overallRisk === 'EMERGENCY' ? 'bg-rose-950/90 text-rose-300 border-rose-700 animate-pulse' :
                overallRisk === 'UNSAFE' ? 'bg-amber-950/90 text-amber-300 border-amber-700' :
                overallRisk === 'WARNING' ? 'bg-yellow-950/90 text-yellow-300 border-yellow-700' :
                'bg-emerald-950/90 text-emerald-300 border-emerald-700'
              }`}>
                {overallRisk === 'EMERGENCY' && <AlertOctagon className="w-4 h-4 text-rose-400" />}
                {overallRisk === 'UNSAFE' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {overallRisk === 'WARNING' && <Info className="w-4 h-4 text-yellow-400" />}
                {overallRisk === 'SAFE' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                <span>{overallRisk}</span>
              </div>
            </div>

            {/* The Simulation Canvas */}
            <canvas
              ref={canvasRef}
              width={760}
              height={440}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className={`w-full h-auto block cursor-${isEditMode ? 'crosshair' : 'default'}`}
            />

            {/* Bottom In-Canvas Dynamic Safety Bar */}
            <div className="bg-slate-950/95 border-t border-slate-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">Inspected Pair:</span>
                <span className="text-sm font-bold text-white">{inspectedPair?.id || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Current Separation:</span>
                <span className="text-sm font-bold text-cyan-400">{currentSepDistance.toFixed(2)} m</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Required Distance:</span>
                <span className="text-sm text-slate-200">{currentReqDistance.toFixed(2)} m</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Margin Remaining:</span>
                <span className={`text-sm font-bold ${(inspectedPair?.safetyMarginRemaining || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(inspectedPair?.safetyMarginRemaining || 0) > 0 ? '+' : ''}{(inspectedPair?.safetyMarginRemaining || 0).toFixed(2)} m
                </span>
              </div>
            </div>
          </div>

          {/* Simulation Playback & Speed Controls */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow transition ${
                  isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => stepSimulation(0.1)}
                disabled={isRunning}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                <StepForward className="w-4 h-4" />
                <span>Step</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
              {[0.5, 1, 2, 5].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTimeScale(scale)}
                  className={`px-2 py-1 rounded font-mono font-semibold transition ${
                    timeScale === scale ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>

            {/* Interactive Waypoint Editor Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isEditMode ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Finish Editing' : 'Edit Path'}</span>
              </button>

              {isEditMode && (
                <div className="flex bg-slate-900 rounded border border-slate-700 p-0.5 text-xs">
                  <select
                    value={`${editEntityType}-${editEntityIndex}`}
                    onChange={(e) => {
                      const [type, idxStr] = e.target.value.split('-');
                      setEditEntityType(type as 'robot' | 'human');
                      setEditEntityIndex(parseInt(idxStr, 10));
                    }}
                    className="bg-slate-900 text-xs text-slate-200 rounded px-2 py-1 border-0"
                  >
                    {robots.map((r, i) => (
                      <option key={`r-${i}`} value={`robot-${i}`}>Robot: {r.name}</option>
                    ))}
                    {humans.map((h, i) => (
                      <option key={`h-${i}`} value={`human-${i}`}>Worker: {h.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pairwise Safety Matrix Panel */}
        <div className="space-y-4">
          {/* Pairwise Safety Status Matrix */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                {t.multiAgent.pairwiseMatrix}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {multiEval.totalPairsEvaluated} Pairs
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {multiEval.pairwiseEvaluations.map((pair) => {
                const isHighest = highestPair?.id === pair.id;
                const isInspected = inspectedPair?.id === pair.id;

                return (
                  <button
                    key={pair.id}
                    onClick={() => setSelectedPairId(pair.id)}
                    className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition flex items-center justify-between gap-2 ${
                      isHighest
                        ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-400'
                        : isInspected
                        ? 'bg-slate-900 border-cyan-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{pair.id}</span>
                      {isHighest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          HIGHEST THREAT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">
                        {pair.currentDistance.toFixed(1)}m / <span className="text-slate-400">{pair.requiredDynamicDistance.toFixed(1)}m</span>
                      </span>

                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        pair.riskLevel === 'EMERGENCY' ? 'bg-rose-950 text-rose-300' :
                        pair.riskLevel === 'UNSAFE' ? 'bg-amber-950 text-amber-300' :
                        pair.riskLevel === 'WARNING' ? 'bg-yellow-950 text-yellow-300' :
                        'bg-emerald-950 text-emerald-300'
                      }`}>
                        {pair.riskLevel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {inspectedPair && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-cyan-400 flex justify-between">
                  <span>Selected: {inspectedPair.id} ({inspectedPair.pairType})</span>
                  <span>Margin: {inspectedPair.safetyMarginRemaining.toFixed(2)}m</span>
                </div>
                <p className="text-slate-400 leading-tight">{inspectedPair.explanation}</p>
              </div>
            )}
          </div>

          {/* Telemetry Mini Chart */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Separation Telemetry
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-cyan-400">― Dist</span>
                <span className="text-amber-400">┄ Req</span>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-800">
              <canvas ref={telemetryChartRef} width={340} height={100} className="w-full h-auto block" />
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
              <span>Samples: {telemetry.length}</span>
              <button
                onClick={handleExportCSV}
                disabled={telemetry.length === 0}
                className="text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-40"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Run Summary Modal / Notification */}
      {runSummary && (
        <div className="bg-slate-800/90 border border-cyan-500/40 rounded-xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Simulation Run Completed - Performance Summary</h3>
            </div>
            <button
              onClick={handleSaveExperiment}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow transition"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save Experiment Record</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs font-mono">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Min Distance</span>
              <span className="text-sm font-bold text-cyan-400">{runSummary.minDistance.toFixed(2)} m</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Min Safety Margin</span>
              <span className="text-sm font-bold text-slate-200">{runSummary.minSafetyMargin.toFixed(2)} m</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Peak Risk</span>
              <span className="text-sm font-bold text-amber-400">{runSummary.maxRiskLevel}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Unsafe Duration</span>
              <span className="text-sm font-bold text-rose-400">{runSummary.totalUnsafeDuration.toFixed(1)} s</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Pairs Evaluated</span>
              <span className="text-sm font-bold text-cyan-400">{runSummary.multiAgentSummary?.totalPairsEvaluated || 1}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Run Time</span>
              <span className="text-sm font-bold text-slate-300">{runSummary.duration} s</span>
            </div>
          </div>

          {savedExpNotice && (
            <div className="text-xs text-emerald-400 font-semibold animate-pulse">
              ✓ Run successfully saved to Experiment History database.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
