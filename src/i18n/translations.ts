export type Language = 'en' | 'ta';

export interface TranslationDict {
  appName: string;
  appSubtitle: string;
  prototypeNotice: string;
  nav: {
    dashboard: string;
    simulator: string;
    layout: string;
    scenarios: string;
    safetyRules: string;
    experiments: string;
    sensitivity: string;
    failureCases: string;
    dataCapture: string;
    stakeholderFeedback: string;
    settings: string;
  };
  safetyStates: {
    SAFE: string;
    WARNING: string;
    UNSAFE: string;
    EMERGENCY: string;
  };
  dashboard: {
    title: string;
    totalSimulations: string;
    safeScenarios: string;
    warningScenarios: string;
    unsafeScenarios: string;
    minDistance: string;
    proximityViolations: string;
    operatingScenario: string;
    simulationStatus: string;
    lastExperiment: string;
    quickLaunch: string;
    systemHealth: string;
    recentEvents: string;
    unnecessaryRestrictionsSaved: string;
  };
  simulator: {
    title: string;
    play: string;
    pause: string;
    reset: string;
    step: string;
    speed: string;
    scenario: string;
    liveDistance: string;
    dynamicZone: string;
    staticZone: string;
    riskAssessment: string;
    explanation: string;
    timeline: string;
    robotSpeed: string;
    humanSpeed: string;
    humanTask: string;
    editPath: string;
    viewMode: string;
    robotPath: string;
    humanPath: string;
    addWaypoint: string;
    deleteWaypoint: string;
    clearPath: string;
    savePath: string;
    resetPath: string;
    telemetry: string;
    liveChart: string;
    simulationSummary: string;
    exportTelemetryCSV: string;
    saveAsExperiment: string;
  };
  environment: {
    title: string;
    subtitle: string;
    temperature: string;
    pressure: string;
    floorCondition: string;
    frictionCoefficient: string;
    sensorDegradation: string;
    ambientMultiplier: string;
    dynamicRequiredDistance: string;
    nominalRequiredDistance: string;
    environmentalIncrease: string;
    nominalConditions: string;
    dryClean: string;
    wetWashdown: string;
    oilChemical: string;
    coldFrost: string;
    assumptionNotice: string;
  };
  multiAgent: {
    modeSingle: string;
    modeMulti: string;
    activeRobots: string;
    activeHumans: string;
    pairwiseMatrix: string;
    highestThreat: string;
    robotRobot: string;
    humanHuman: string;
    robotHuman: string;
    marginRemaining: string;
    pairsEvaluated: string;
    evaluationLatency: string;
  };
  experiments: {
    title: string;
    subtitle: string;
    runBatch: string;
    batchResults: string;
    history: string;
    exportCSV: string;
    clearHistory: string;
    baselineComparison: string;
  };
  sensitivity: {
    title: string;
    subtitle: string;
    sweepParameter: string;
    thresholds: string;
    impactAnalysis: string;
    decisionTransitions: string;
  };
  failureCases: {
    title: string;
    subtitle: string;
    edgeCaseList: string;
    expectedBehavior: string;
    observedBehavior: string;
    validationStatus: string;
  };
  dataCapture: {
    title: string;
    subtitle: string;
    addRecord: string;
    observer: string;
    location: string;
    measuredDistance: string;
    notes: string;
    savedRecords: string;
    exportData: string;
  };
  settings: {
    title: string;
    language: string;
    systemConfig: string;
    about: string;
    complianceEvidence: string;
    factoryReset: string;
  };
  stakeholder: {
    title: string;
    subtitle: string;
    purposeNotice: string;
    validationStatus: string;
    statusPending: string;
    statusInProgress: string;
    statusAvailable: string;
    noFabricatedDataNotice: string;
    roleSelect: string;
    roles: {
      EHS_MANAGER: string;
      PLANT_OPERATOR: string;
      MAINTENANCE_ENGINEER: string;
      OTHER: string;
    };
    otherRolePlaceholder: string;
    sessionInfo: string;
    scenarioEvaluated: string;
    simulationMode: string;
    environmentalCondition: string;
    evaluationDuration: string;
    likertScale: {
      s1: string;
      s2: string;
      s3: string;
      s4: string;
      s5: string;
    };
    questions: {
      q1: string;
      q2: string;
      q3: string;
      q4: string;
      q5: string;
      q6: string;
      q7: string;
      q8: string;
      q9: string;
      q10: string;
    };
    qualitativeTitle: string;
    qualitative: {
      easyToUnderstand: string;
      difficultToUnderstand: string;
      mostUsefulFeature: string;
      featureNeedingImprovement: string;
      additionalInfoNeeded: string;
      additionalComments: string;
    };
    submitEvaluation: string;
    resetForm: string;
    exportJSON: string;
    exportCSV: string;
    clearAll: string;
    summaryTitle: string;
    totalResponses: string;
    completedEvaluations: string;
    overallAverage: string;
    questionAverages: string;
    responsesList: string;
    noResponsesYet: string;
    submittedSuccess: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    export: string;
    import: string;
    refresh: string;
    close: string;
    active: string;
    inactive: string;
    status: string;
    actions: string;
    online: string;
    offline: string;
    runAll?: string;
    exportCSV?: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    appName: 'ProcessPlant Dynamic Safety Simulator',
    appSubtitle: 'Dynamic Human-Robot Safety-Zone Simulator for Process Plants',
    prototypeNotice: 'RESEARCH PROTOTYPE • NOT CERTIFIED SAFETY SYSTEM',
    nav: {
      dashboard: 'Dashboard',
      simulator: 'Simulator',
      layout: 'Plant Layout',
      scenarios: 'Scenarios',
      safetyRules: 'Safety Rules',
      experiments: 'Experiments',
      sensitivity: 'Sensitivity Analysis',
      failureCases: 'Failure Cases',
      dataCapture: 'Data Capture',
      stakeholderFeedback: 'Stakeholder Feedback',
      settings: 'Settings',
    },
    safetyStates: {
      SAFE: 'SAFE',
      WARNING: 'WARNING',
      UNSAFE: 'UNSAFE',
      EMERGENCY: 'EMERGENCY',
    },
    dashboard: {
      title: 'Safety Overview Dashboard',
      totalSimulations: 'Total Scenarios',
      safeScenarios: 'Safe States',
      warningScenarios: 'Warning States',
      unsafeScenarios: 'Violations / Unsafe',
      minDistance: 'Min Separation Dist',
      proximityViolations: 'Proximity Warnings',
      operatingScenario: 'Current Scenario',
      simulationStatus: 'Safety Engine Status',
      lastExperiment: 'Last Test Run',
      quickLaunch: 'Quick Navigation',
      systemHealth: 'Deterministic Engine Integrity',
      recentEvents: 'Recent Safety Events',
      unnecessaryRestrictionsSaved: 'Dynamic Efficiency Gain',
    },
    simulator: {
      title: 'Dynamic Safety Zone Simulator',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      step: 'Step (0.1s)',
      speed: 'Playback Speed',
      scenario: 'Select Scenario',
      liveDistance: 'Separation Distance',
      dynamicZone: 'Dynamic Required Zone (D_req)',
      staticZone: 'Static Baseline (3.0m)',
      riskAssessment: 'Real-Time Risk State',
      explanation: 'Safety Decision Explanation',
      timeline: 'Simulation Timeline',
      robotSpeed: 'AMR Speed (m/s)',
      humanSpeed: 'Worker Speed (m/s)',
      humanTask: 'Worker Task Multiplier',
      editPath: 'Edit Waypoints',
      viewMode: 'View Mode',
      robotPath: 'Robot Path',
      humanPath: 'Human Path',
      addWaypoint: 'Click to Add Waypoint',
      deleteWaypoint: 'Delete Waypoint',
      clearPath: 'Clear Path',
      savePath: 'Apply Path',
      resetPath: 'Reset to Scenario Default',
      telemetry: 'Real-Time Telemetry',
      liveChart: 'Distance vs Dynamic Threshold',
      simulationSummary: 'Simulation Run Summary',
      exportTelemetryCSV: 'Export Telemetry (CSV)',
      saveAsExperiment: 'Save as Experiment Record',
    },
    environment: {
      title: 'Environmental Physics Calibration',
      subtitle: 'Simulate the impact of plant floor traction, temperature, pressure, and sensor degradation on dynamic required safety distance.',
      temperature: 'Ambient Temperature',
      pressure: 'Atmospheric Pressure',
      floorCondition: 'Floor Condition / Traction',
      frictionCoefficient: 'Surface Friction Coefficient (μ)',
      sensorDegradation: 'Sensor Degradation Factor (η)',
      ambientMultiplier: 'Ambient Multiplier (λ_ambient)',
      dynamicRequiredDistance: 'Dynamic Required Distance',
      nominalRequiredDistance: 'Nominal Baseline Distance',
      environmentalIncrease: 'Environmental Delta (ΔD_env)',
      nominalConditions: 'Nominal Baseline (25°C, 1.013 bar, μ=1.00, η=0.00)',
      dryClean: 'Dry Clean Concrete (μ = 1.00)',
      wetWashdown: 'Wet Washdown Area (μ = 0.65)',
      oilChemical: 'Oil / Chemical Spill Slick (μ = 0.35)',
      coldFrost: 'Cold Storage Frost Slick (μ = 0.20)',
      assumptionNotice: 'Environmental physics are mathematical academic simulation approximations for research evaluation.',
    },
    multiAgent: {
      modeSingle: 'Single-Agent Mode (1 AMR + 1 Worker)',
      modeMulti: 'Multi-Agent Mode (Multi-AMRs + Multi-Workers)',
      activeRobots: 'Active AMRs',
      activeHumans: 'Active Workers',
      pairwiseMatrix: 'Pairwise Safety Status Matrix',
      highestThreat: 'Highest Threat Pair',
      robotRobot: 'AMR ↔ AMR Separation',
      humanHuman: 'Worker ↔ Worker Proximity',
      robotHuman: 'AMR ↔ Worker Safety Zone',
      marginRemaining: 'Safety Margin Remaining',
      pairsEvaluated: 'Pairs Evaluated',
      evaluationLatency: 'Eval Latency',
    },
    experiments: {
      title: 'Empirical Experiments & Benchmarking',
      subtitle: 'Batch simulation testing across operational process plant scenarios comparing dynamic safety envelopes against static baseline zones.',
      runBatch: 'Execute All Benchmark Scenarios',
      batchResults: 'Benchmark Results Matrix',
      history: 'Recorded Run History',
      exportCSV: 'Export Experiment History (CSV)',
      clearHistory: 'Clear Run History',
      baselineComparison: 'Dynamic Adaptive vs Fixed-Radius Comparison',
    },
    sensitivity: {
      title: 'Parameter Sensitivity Analysis',
      subtitle: 'Systematic parameter sweeps analyzing safety boundary shifts, decision transitions, and gradient influence.',
      sweepParameter: 'Select Sweep Parameter',
      thresholds: 'Decision Transition Boundaries',
      impactAnalysis: 'Safety Distance Influence Curve',
      decisionTransitions: 'Observed Risk State Transitions',
    },
    failureCases: {
      title: '12 Failure Cases & Boundary Suite',
      subtitle: 'Automated verification harness assessing system robustness against singularities, traction loss, and sensor degradation.',
      edgeCaseList: 'Boundary Edge Cases',
      expectedBehavior: 'Expected Safety State',
      observedBehavior: 'Evaluated State',
      validationStatus: 'Harness Result',
    },
    dataCapture: {
      title: 'Field Proximity Data Capture',
      subtitle: 'Capture empirical worker proximity observations during plant walkthroughs with offline storage support.',
      addRecord: 'Log Field Observation',
      observer: 'Observer Name / ID',
      location: 'Plant Area / Unit',
      measuredDistance: 'Estimated Separation (m)',
      notes: 'Environmental / Operational Context',
      savedRecords: 'Saved Field Observations',
      exportData: 'Export Observations (CSV)',
    },
    stakeholder: {
      title: 'Stakeholder Feedback & Field Evaluation',
      subtitle: 'Structured Field & Academic Evaluation for Process Plant Safety Specialists',
      purposeNotice: 'Evaluate the usability, explainability, environmental adaptation, multi-agent safety visualization, and field usefulness of the Dynamic Human-Robot Safety-Zone Simulator.',
      validationStatus: 'Stakeholder Validation Status',
      statusPending: 'PENDING ACTUAL TRIALS',
      statusInProgress: 'IN PROGRESS',
      statusAvailable: 'RESPONSES AVAILABLE',
      noFabricatedDataNotice: 'Validation has not yet been conducted. No stakeholder responses have been fabricated.',
      roleSelect: 'Select Evaluator Role',
      roles: {
        EHS_MANAGER: 'Plant Safety Officer / EHS Manager',
        PLANT_OPERATOR: 'Process Plant Operator / Technician',
        MAINTENANCE_ENGINEER: 'Automation / AMR Maintenance Engineer',
        OTHER: 'Academic / Safety Specialist / Other',
      },
      otherRolePlaceholder: 'Specify your professional role...',
      sessionInfo: 'Session Context (Optional)',
      scenarioEvaluated: 'Scenario Evaluated',
      simulationMode: 'Simulation Mode',
      environmentalCondition: 'Environmental Condition',
      evaluationDuration: 'Evaluation Session Duration',
      likertScale: {
        s1: '1 - Strongly Disagree',
        s2: '2 - Disagree',
        s3: '3 - Neutral',
        s4: '4 - Agree',
        s5: '5 - Strongly Agree',
      },
      questions: {
        q1: 'Q1: The dynamic safety-zone explanation is clear and understandable.',
        q2: 'Q2: The simulator clearly shows why a safety warning or unsafe state occurs.',
        q3: 'Q3: The environmental controls for temperature, pressure, floor friction, and sensor degradation are understandable and useful.',
        q4: 'Q4: The multi-agent view clearly identifies which robot-human or robot-robot interaction represents the highest threat.',
        q5: 'Q5: The simulator demonstrates the difference between static and dynamic safety zones clearly.',
        q6: 'Q6: The simulator interface is easy to understand and operate.',
        q7: 'Q7: The simulator provides useful information for evaluating process-plant human-robot proximity scenarios.',
        q8: 'Q8: The configurable safety parameters appear useful for plant-specific simulation experiments.',
        q9: 'Q9: The English/Tamil interface and visual indicators improve usability.',
        q10: 'Q10: Overall, the simulator is useful as an academic safety-analysis and decision-support prototype.',
      },
      qualitativeTitle: 'Qualitative Field Observations (Optional)',
      qualitative: {
        easyToUnderstand: 'What was easy to understand?',
        difficultToUnderstand: 'What was difficult to understand?',
        mostUsefulFeature: 'Which feature was most useful?',
        featureNeedingImprovement: 'Which feature needs improvement?',
        additionalInfoNeeded: 'What additional information would be useful?',
        additionalComments: 'Additional comments or recommendations',
      },
      submitEvaluation: 'Submit Evaluation Response',
      resetForm: 'Reset Form',
      exportJSON: 'Export JSON',
      exportCSV: 'Export CSV',
      clearAll: 'Clear Responses',
      summaryTitle: 'Actual Stakeholder Responses Summary',
      totalResponses: 'Total Responses Recorded',
      completedEvaluations: 'Completed Evaluations',
      overallAverage: 'Overall Average Rating',
      questionAverages: 'Question-by-Question Average Ratings',
      responsesList: 'Recorded Evaluation Records',
      noResponsesYet: 'No evaluation responses have been submitted yet. Fill out the form above to record authentic evaluator feedback.',
      submittedSuccess: 'Stakeholder evaluation successfully recorded locally.',
    },
    settings: {
      title: 'Settings & System Configuration',
      language: 'Display Language / மொழி',
      systemConfig: 'Simulator Architecture & Calibration',
      about: 'About Research Project',
      complianceEvidence: 'Review 2 Deliverables Checklist',
      factoryReset: 'Clear Local Storage & Reset to Baseline',
    },
    common: {
      save: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      close: 'Close',
      active: 'Active',
      inactive: 'Inactive',
      status: 'Status',
      actions: 'Actions',
      online: 'ONLINE',
      offline: 'OFFLINE CACHE',
    },
  },
  ta: {
    appName: 'செயல்முறை ஆலை பாதுகாப்பு மாதிரி',
    appSubtitle: 'தொழிற்சாலைகளுக்கான மனித-ரோபோ மாறும் பாதுகாப்பு மண்டல உருவகப்படுத்துதல்',
    prototypeNotice: 'ஆராய்ச்சி முன்மாதிரி • சான்றளிக்கப்பட்ட பாதுகாப்பு அமைப்பு அல்ல',
    nav: {
      dashboard: 'டாஷ்போர்டு',
      simulator: 'மாதிரி இயக்கி',
      layout: 'ஆலை வரைபடம்',
      scenarios: 'சூழ்நிலைகள்',
      safetyRules: 'பாதுகாப்பு விதிகள்',
      experiments: 'சோதனைகள்',
      sensitivity: 'உணர்திறன் பகுப்பாய்வு',
      failureCases: 'விளிம்பு வழக்குகள்',
      dataCapture: 'தரவு பதிவு',
      stakeholderFeedback: 'பங்குதாரர் கருத்து',
      settings: 'அமைப்புகள்',
    },
    safetyStates: {
      SAFE: 'பாதுகாப்பானது (SAFE)',
      WARNING: 'எச்சரிக்கை (WARNING)',
      UNSAFE: 'ஆபத்தானது (UNSAFE)',
      EMERGENCY: 'அவசர நிறுத்தம் (EMERGENCY)',
    },
    dashboard: {
      title: 'பாதுகாப்பு கண்ணோட்டம்',
      totalSimulations: 'மொத்த சூழ்நிலைகள்',
      safeScenarios: 'பாதுகாப்பான நிலைகள்',
      warningScenarios: 'எச்சரிக்கை நிலைகள்',
      unsafeScenarios: 'மீறல்கள் / ஆபத்தானவை',
      minDistance: 'குறைந்தபட்ச தூரம்',
      proximityViolations: 'அருகாமை எச்சரிக்கைகள்',
      operatingScenario: 'தற்போதைய சூழ்நிலை',
      simulationStatus: 'இயந்திரத்தின் நிலை',
      lastExperiment: 'கடைசி சோதனை ஓட்டம்',
      quickLaunch: 'விரைவு வழிசெலுத்தல்',
      systemHealth: 'கணித ஒருமைப்பாடு',
      recentEvents: 'சமீபத்திய பாதுகாப்பு நிகழ்வுகள்',
      unnecessaryRestrictionsSaved: 'தவிர்க்கப்பட்ட தேவையற்ற தடைகள்',
    },
    simulator: {
      title: 'மாறும் பாதுகாப்பு மண்டல சிமுலேட்டர்',
      play: 'இயக்கு',
      pause: 'நிறுத்து',
      reset: 'மீட்டமை',
      step: 'படி படி (0.1வி)',
      speed: 'வேகம்',
      scenario: 'சூழ்நிலையைத் தேர்ந்தெடு',
      liveDistance: 'நேரடி தூரம்',
      dynamicZone: 'தேவையான மாறும் மண்டலம்',
      staticZone: 'நிலையான மண்டலம் (3.0மீ)',
      riskAssessment: 'ஆபத்து மதிப்பீடு',
      explanation: 'பாதுகாப்பு முடிவு விளக்கம்',
      timeline: 'காலவரிசை',
      robotSpeed: 'ரோபோ வேகம் (மீ/வி)',
      humanSpeed: 'பணியாளர் வேகம் (மீ/வி)',
      humanTask: 'பணி காரணி',
      editPath: 'பாதையை மாற்று',
      viewMode: 'பார்வை முறை',
      robotPath: 'ரோபோ பாதை',
      humanPath: 'மனிதர் பாதை',
      addWaypoint: 'புள்ளி சேர்க்க கிளிக் செய்க',
      deleteWaypoint: 'புள்ளியை நீக்கு',
      clearPath: 'பாதையை அழி',
      savePath: 'பயன்படுத்து',
      resetPath: 'இயல்புநிலைக்கு மீட்டமை',
      telemetry: 'நேரடி டெலிமெட்ரி',
      liveChart: 'தூரம் மற்றும் மாறும் வரம்பு வரைபடம்',
      simulationSummary: 'சோதனை ஓட்ட சுருக்கம்',
      exportTelemetryCSV: 'டெலிமெட்ரி ஏற்றுமதி (CSV)',
      saveAsExperiment: 'சோதனை பதிவாக சேமி',
    },
    environment: {
      title: 'சுற்றுச்சூழல் இயற்பியல் அளவுத்திருத்தம்',
      subtitle: 'தரை உராய்வு, வெப்பநிலை, அழுத்தம் மற்றும் சென்சார் சிதைவின் தாக்கத்தை கணக்கிடுங்கள்.',
      temperature: 'சுற்றுப்புற வெப்பநிலை',
      pressure: 'வளிமண்டல அழுத்தம்',
      floorCondition: 'தரை நிலை / உராய்வு',
      frictionCoefficient: 'உராய்வு குணகம் (μ)',
      sensorDegradation: 'சென்சார் சிதைவு காரணி (η)',
      ambientMultiplier: 'சுற்றுப்புற பெருக்கி (λ_ambient)',
      dynamicRequiredDistance: 'தேவையான மாறும் தூரம்',
      nominalRequiredDistance: 'இயல்புநிலை தூரம்',
      environmentalIncrease: 'சுற்றுச்சூழல் அதிகரிப்பு (ΔD_env)',
      nominalConditions: 'இயல்பு நிலை (25°C, 1.013 bar, μ=1.00, η=0.00)',
      dryClean: 'உலர்ந்த கான்கிரீட் (μ = 1.00)',
      wetWashdown: 'ஈரமான பகுதி (μ = 0.65)',
      oilChemical: 'எண்ணெய் / ரசாயன கசிவு (μ = 0.35)',
      coldFrost: 'குளிர் உறைபனி தரை (μ = 0.20)',
      assumptionNotice: 'சுற்றுச்சூழல் காரணிகள் ஆராய்ச்சி மதிப்பீட்டிற்கான கணித மாதிரிகளாகும்.',
    },
    multiAgent: {
      modeSingle: 'தனி முகவர் பயன்முறை (Single)',
      modeMulti: 'பல முகவர் பயன்முறை (Multi-Agent)',
      activeRobots: 'செயலில் உள்ள ரோபோக்கள்',
      activeHumans: 'செயலில் உள்ள பணியாளர்கள்',
      pairwiseMatrix: 'ஜோடி பாதுகாப்பு நிலை அணி',
      highestThreat: 'அதிக ஆபத்து உள்ள ஜோடி',
      robotRobot: 'ரோபோ-ரோபோ இடைவெளி',
      humanHuman: 'பணியாளர்-பணியாளர் அருகாமை',
      robotHuman: 'ரோபோ-பணியாளர் பாதுகாப்பு மண்டலம்',
      marginRemaining: 'மீதமுள்ள பாதுகாப்பு இடைவெளி',
      pairsEvaluated: 'மதிப்பிடப்பட்ட ஜோடிகள்',
      evaluationLatency: 'மதிப்பீட்டு நேரம்',
    },
    experiments: {
      title: 'சோதனை மற்றும் ஒப்பீட்டு மையம்',
      subtitle: 'நிலையான மண்டலங்களுடன் ஒப்பிடும் விரிவான தொகுதி சோதனைகள்.',
      runBatch: 'அனைத்து சூழ்நிலைகளையும் இயக்கு',
      batchResults: 'சோதனை முடிவுகள்',
      history: 'பதிவு செய்யப்பட்ட வரலாறு',
      exportCSV: 'வரலாற்றை ஏற்றுமதி செய்க (CSV)',
      clearHistory: 'வரலாற்றை அழிக்கவும்',
      baselineComparison: 'மாறும் மற்றும் நிலையான மண்டல ஒப்பீடு',
    },
    sensitivity: {
      title: 'உணர்திறன் பகுப்பாய்வு',
      subtitle: 'அளவுரு மாற்றங்களின் பாதுகாப்பு மண்டல தாக்கத்தை சோதிக்கவும்.',
      sweepParameter: 'அளவுருவைத் தேர்ந்தெடுக்கவும்',
      thresholds: 'முடிவு மாற்ற எல்லைகள்',
      impactAnalysis: 'பாதுகாப்பு தூர தாக்கம்',
      decisionTransitions: 'கவனிக்கப்பட்ட மாற்றங்கள்',
    },
    failureCases: {
      title: '12 விளிம்பு வழக்குகள் மற்றும் தோல்வி பகுப்பாய்வு',
      subtitle: 'தீவிர நிலைகளில் கணினி நிலைத்தன்மையை சோதிக்கும் சரிபார்ப்பு தொகுதி.',
      edgeCaseList: 'விளிம்பு வழக்குகள்',
      expectedBehavior: 'எதிர்பார்க்கப்படும் முடிவு',
      observedBehavior: 'கணக்கிடப்பட்ட முடிவு',
      validationStatus: 'சரிபார்ப்பு நிலை',
    },
    dataCapture: {
      title: 'கள பாதுகாப்பு தரவு பதிவு',
      subtitle: 'ஆலை ஆய்வுகளின் போது நேரடி அவதானிப்புகளைப் பதிவுசெய்க.',
      addRecord: 'புதிய பதிவைச் சேர்',
      observer: 'ஆய்வாளர் பெயர்',
      location: 'ஆலை பகுதி',
      measuredDistance: 'மதிப்பிடப்பட்ட தூரம் (மீ)',
      notes: 'சுற்றுச்சூழல் குறிப்புகள்',
      savedRecords: 'சேமிக்கப்பட்ட பதிவுகள்',
      exportData: 'தரவை ஏற்றுமதி செய்க (CSV)',
    },
    stakeholder: {
      title: 'பங்குதாரர் கருத்து & கள மதிப்பீடு',
      subtitle: 'செயல்முறை ஆலை பாதுகாப்பு நிபுணர்களுக்கான கள மற்றும் கல்வி மதிப்பீட்டு அமைப்பு',
      purposeNotice: 'டைனமிக் மனித-ரோபோ பாதுகாப்பு-மண்டல சிமுலேட்டரின் பயன்பாட்டினை, விளக்கத்திறனை, சுற்றுச்சூழல் தழுவலை, பல முகவர் பாதுகாப்பு காட்சிப்படுத்தலை மற்றும் களப் பயனை மதிப்பிடுங்கள்.',
      validationStatus: 'பங்குதாரர் சரிபார்ப்பு நிலை',
      statusPending: 'உண்மையான சோதனைகள் நிலுவையில் உள்ளன',
      statusInProgress: 'செயலில் உள்ளது',
      statusAvailable: 'பதில்கள் கிடைக்கின்றன',
      noFabricatedDataNotice: 'சரிபார்ப்பு இன்னும் நடத்தப்படவில்லை. எந்தவொரு போலி பங்குதாரர் பதில்களும் உருவாக்கப்படவில்லை.',
      roleSelect: 'மதிப்பீட்டாளர் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
      roles: {
        EHS_MANAGER: 'ஆலை பாதுகாப்பு அதிகாரி / EHS மேலாளர்',
        PLANT_OPERATOR: 'செயல்முறை ஆலை ஆபரேட்டர் / தொழில்நுட்ப வல்லுநர்',
        MAINTENANCE_ENGINEER: 'ஆட்டோமேஷன் / AMR பராமரிப்பு பொறியாளர்',
        OTHER: 'கல்வியாளர் / பாதுகாப்பு நிபுணர் / பிறர்',
      },
      otherRolePlaceholder: 'உங்கள் தொழில்முறைப் பாத்திரத்தைக் குறிப்பிடவும்...',
      sessionInfo: 'அமர்வு சூழல் (விருப்பமானது)',
      scenarioEvaluated: 'மதிப்பிடப்பட்ட காட்சி',
      simulationMode: 'சிமுலேஷன் பயன்முறை',
      environmentalCondition: 'சுற்றுச்சூழல் நிலை',
      evaluationDuration: 'மதிப்பீட்டு அமர்வு கால அளவு',
      likertScale: {
        s1: '1 - முற்றிலும் ஏற்கவில்லை',
        s2: '2 - ஏற்கவில்லை',
        s3: '3 - நடுநிலை',
        s4: '4 - ஏற்கிறேன்',
        s5: '5 - முற்றிலும் ஏற்கிறேன்',
      },
      questions: {
        q1: 'Q1: டைனமிக் பாதுகாப்பு மண்டல விளக்கம் தெளிவாகவும் புரிந்துகொள்ளக்கூடியதாகவும் உள்ளது.',
        q2: 'Q2: பாதுகாப்பு எச்சரிக்கை அல்லது பாதுகாப்பற்ற நிலை ஏன் ஏற்படுகிறது என்பதை சிமுலேட்டர் தெளிவாகக் காட்டுகிறது.',
        q3: 'Q3: வெப்பநிலை, அழுத்தம், தரை உராய்வு மற்றும் சென்சார் சிதைவுக்கான சுற்றுச்சூழல் கட்டுப்பாடுகள் பயனுள்ளதாக உள்ளன.',
        q4: 'Q4: எந்த ரோபோ-மனித அல்லது ரோபோ-ரோபோ தொடர்பு அதிக அச்சுறுத்தலைக் குறிக்கிறது என்பதை பல முகவர் பார்வை தெளிவாகக் காட்டுகிறது.',
        q5: 'Q5: நிலையான மற்றும் டைனமிக் பாதுகாப்பு மண்டலங்களுக்கு இடையிலான வேறுபாட்டை சிமுலேட்டர் தெளிவாக விளக்குகிறது.',
        q6: 'Q6: சிமுலேட்டர் இடைமுகம் புரிந்துகொள்வதற்கும் இயக்குவதற்கும் எளிதானது.',
        q7: 'Q7: செயல்முறை-ஆலை மனித-ரோபோ அருகாமை காட்சிகளை மதிப்பிடுவதற்கான பயனுள்ள தகவல்களை சிமுலேட்டர் வழங்குகிறது.',
        q8: 'Q8: உள்ளமைக்கக்கூடிய பாதுகாப்பு அளவுருக்கள் ஆலை சார்ந்த சிமுலேஷன் சோதனைகளுக்கு பயனுள்ளதாகத் தோன்றுகின்றன.',
        q9: 'Q9: ஆங்கிலம்/தமிழ் இடைமுகம் மற்றும் காட்சி குறிகாட்டிகள் பயன்பாட்டினை மேம்படுத்துகின்றன.',
        q10: 'Q10: ஒட்டுமொத்தமாக, கல்விப் பாதுகாப்பு பகுப்பாய்வு மற்றும் முடிவெடுக்கும் முன்மாதிரியாக சிமுலேட்டர் பயனுள்ளதாக இருக்கிறது.',
      },
      qualitativeTitle: 'தரமான களக் கருத்துக்கள் (விருப்பமானது)',
      qualitative: {
        easyToUnderstand: 'எது எளிதாகப் புரிந்தது?',
        difficultToUnderstand: 'எது புரிந்துகொள்ள கடினமாக இருந்தது?',
        mostUsefulFeature: 'எந்த அம்சம் மிகவும் பயனுள்ளதாக இருந்தது?',
        featureNeedingImprovement: 'எந்த அம்சம் மேம்படுத்தப்பட வேண்டும்?',
        additionalInfoNeeded: 'கூடுதலாக என்ன தகவல் பயனுள்ளதாக இருக்கும்?',
        additionalComments: 'கூடுதல் கருத்துக்கள் அல்லது பரிந்துரைகள்',
      },
      submitEvaluation: 'மதிப்பீட்டு பதிலைச் சமர்ப்பிக்கவும்',
      resetForm: 'படிவத்தை மீட்டமை',
      exportJSON: 'JSON ஏற்றுமதி',
      exportCSV: 'CSV ஏற்றுமதி',
      clearAll: 'பதில்களை அழிக்கவும்',
      summaryTitle: 'உண்மையான பங்குதாரர் பதில்கள் சுருக்கம்',
      totalResponses: 'பதிவுசெய்யப்பட்ட மொத்த பதில்கள்',
      completedEvaluations: 'முடிக்கப்பட்ட மதிப்பீடுகள்',
      overallAverage: 'ஒட்டுமொத்த சராசரி மதிப்பீடு',
      questionAverages: 'கேள்வி வாரியான சராசரி மதிப்பீடுகள்',
      responsesList: 'பதிவுசெய்யப்பட்ட மதிப்பீட்டு பதிவுகள்',
      noResponsesYet: 'இதுவரை எந்த மதிப்பீட்டு பதில்களும் சமர்ப்பிக்கப்படவில்லை. உண்மையான மதிப்பீட்டாளர் கருத்துக்களைப் பதிவு செய்ய மேலே உள்ள படிவத்தை நிரப்பவும்.',
      submittedSuccess: 'பங்குதாரர் மதிப்பீடு வெற்றிகரமாக உள்ளூரில் பதிவு செய்யப்பட்டது.',
    },
    settings: {
      title: 'அமைப்புகள் மற்றும் உள்ளமைவு',
      language: 'மொழி தேர்வு',
      systemConfig: 'கட்டமைப்பு மற்றும் அளவுத்திருத்தம்',
      about: 'திட்டத்தைப் பற்றி',
      complianceEvidence: 'மதிப்பாய்வு 2 தேவைகள் சரிபார்ப்பு',
      factoryReset: 'தொழிற்சாலை இயல்புநிலைக்கு மீட்டமைக்கவும்',
    },
    common: {
      save: 'சேமிக்கவும்',
      cancel: 'ரத்துசெய்',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      export: 'ஏற்றுமதி',
      import: 'இறக்குமதி',
      refresh: 'புதுப்பி',
      close: 'மூடு',
      active: 'செயலில்',
      inactive: 'செயலற்றது',
      status: 'நிலை',
      actions: 'செயல்கள்',
      online: 'இணைப்பில் உள்ளது',
      offline: 'ஆஃப்லைன் சேமிப்பு',
    },
  },
};
