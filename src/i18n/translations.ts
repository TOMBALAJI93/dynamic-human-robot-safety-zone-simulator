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
  experiments: {
    title: string;
    subtitle: string;
    runBatch: string;
    batchResults: string;
    history: string;
    exportCSV: string;
    clearHistory: string;
    baselineComparison: string;
    unnecessaryRestrictionsDesc: string;
  };
  sensitivity: {
    title: string;
    subtitle: string;
    paramSelect: string;
    chartTitle: string;
    decisionTransitions: string;
    noTransitions: string;
    influenceAnalysis: string;
  };
  common: {
    save: string;
    cancel: string;
    export: string;
    exportCSV: string;
    import: string;
    runAll: string;
    status: string;
    online: string;
    offline: string;
    filter: string;
    search: string;
    actions: string;
    delete: string;
    view: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    appName: "Dynamic Safety-Zone Simulator",
    appSubtitle: "Human-Robot Proximity Simulation for Process Plants",
    prototypeNotice: "RESEARCH PROTOTYPE: Prototype Safety Decision Model. Not a certified industrial safety system.",
    nav: {
      dashboard: "Dashboard",
      simulator: "Simulator",
      layout: "Plant Layout",
      scenarios: "Scenarios",
      safetyRules: "Safety Rules",
      experiments: "Experiments",
      sensitivity: "Sensitivity Analysis",
      failureCases: "Failure Cases",
      dataCapture: "Field Data Capture",
      settings: "Settings & Docs",
    },
    safetyStates: {
      SAFE: "SAFE",
      WARNING: "WARNING",
      UNSAFE: "UNSAFE",
      EMERGENCY: "EMERGENCY",
    },
    dashboard: {
      title: "Process Plant Safety Dashboard",
      totalSimulations: "Total Simulations",
      safeScenarios: "Safe Scenarios",
      warningScenarios: "Warning Scenarios",
      unsafeScenarios: "Unsafe Scenarios",
      minDistance: "Minimum Observed Distance",
      proximityViolations: "Proximity Violations",
      operatingScenario: "Active Scenario",
      simulationStatus: "Simulation Status",
      lastExperiment: "Last Benchmark Run",
      quickLaunch: "Quick Navigation & Tools",
      systemHealth: "Decision Engine Telemetry",
      recentEvents: "Recent Safety Events",
      unnecessaryRestrictionsSaved: "Unnecessary Stops Prevented",
    },
    simulator: {
      title: "Interactive 2D Plant Simulator",
      play: "Start Simulation",
      pause: "Pause",
      reset: "Reset",
      step: "Step Forward",
      speed: "Speed",
      scenario: "Select Scenario",
      liveDistance: "Current Separation Distance",
      dynamicZone: "Required Dynamic Distance",
      staticZone: "Static Baseline Zone",
      riskAssessment: "Real-Time Risk Level",
      explanation: "Decision Engine Explanation",
      timeline: "Safety Event Stream",
      robotSpeed: "Robot Velocity",
      humanSpeed: "Human Velocity",
      humanTask: "Human Task Activity",
      editPath: "Edit Waypoint Path",
      viewMode: "Simulation Mode",
      robotPath: "Robot Path",
      humanPath: "Human Path",
      addWaypoint: "Click canvas to add waypoint",
      deleteWaypoint: "Click waypoint to remove",
      clearPath: "Clear Path",
      savePath: "Save Custom Path",
      resetPath: "Reset to Scenario Default",
      telemetry: "Live Telemetry Stream",
      liveChart: "Distance Telemetry Chart (Current vs Required)",
      simulationSummary: "Simulation Run Summary",
      exportTelemetryCSV: "Export Telemetry CSV",
      saveAsExperiment: "Save to Experiment History",
    },
    experiments: {
      title: "Automated Experiment Test Harness",
      subtitle: "Execute batch scenarios, evaluate dynamic vs static baseline separation, and review saved experiment logs.",
      runBatch: "Run All Scenarios",
      batchResults: "Scenario Benchmark Results",
      history: "Saved Experiment History",
      exportCSV: "Export Experiments CSV",
      clearHistory: "Clear History",
      baselineComparison: "Static Baseline vs Dynamic Decision Model",
      unnecessaryRestrictionsDesc: "Prototype Unnecessary-Restriction Metric: A static-triggered halt/warning that was safely avoided by the dynamic decision model under the exact same kinematics.",
    },
    sensitivity: {
      title: "Sensitivity Analysis & Decision-Change Detection",
      subtitle: "Evaluate parameter influence sweeps and detect critical threshold transitions where safety decisions change state.",
      paramSelect: "Sweep Parameter",
      chartTitle: "Required Dynamic Distance vs Parameter Sweep",
      decisionTransitions: "Decision State Transitions",
      noTransitions: "No decision changes across tested range under standard separation.",
      influenceAnalysis: "Parameter Gradient & Ranking Analysis",
    },
    common: {
      save: "Save Changes",
      cancel: "Cancel",
      export: "Export JSON",
      exportCSV: "Export CSV",
      import: "Import Data",
      runAll: "Run All Scenarios",
      status: "Status",
      online: "ONLINE",
      offline: "OFFLINE MODE",
      filter: "Filter",
      search: "Search...",
      actions: "Actions",
      delete: "Delete",
      view: "View Details",
    },
  },
  ta: {
    appName: "மனித-ரோபோ இயக்க பாதுகாப்பு உருவகப்படுத்தி",
    appSubtitle: "செயல்முறை ஆலைகளுக்கான பாதுகாப்பு மண்டல உருவகப்படுத்துதல்",
    prototypeNotice: "ஆராய்ச்சி மாதிரி: இது ஒரு முன்மாதிரி முடிவெடுக்கும் மாதிரி. சான்றளிக்கப்பட்ட தொழிலக அமைப்பு அல்ல.",
    nav: {
      dashboard: "முகப்பு பலகை",
      simulator: "உருவகப்படுத்தி",
      layout: "ஆலை தளவமைப்பு",
      scenarios: "சூழ்நிலைகள்",
      safetyRules: "பாதுகாப்பு விதிகள்",
      experiments: "சோதனைகள்",
      sensitivity: "உணர்திறன் பகுப்பாய்வு",
      failureCases: "தோல்வி நிலைகள்",
      dataCapture: "களத் தரவு பதிவு",
      settings: "அமைப்புகள் & ஆவணங்கள்",
    },
    safetyStates: {
      SAFE: "பாதுகாப்பானது (SAFE)",
      WARNING: "எச்சரிக்கை (WARNING)",
      UNSAFE: "பாதுகாப்பற்றது (UNSAFE)",
      EMERGENCY: "அவசரநிலை (EMERGENCY)",
    },
    dashboard: {
      title: "செயல்முறை ஆலை பாதுகாப்பு முகப்பு",
      totalSimulations: "மொத்த உருவகப்படுத்துதல்கள்",
      safeScenarios: "பாதுகாப்பான நிலைகள்",
      warningScenarios: "எச்சரிக்கை நிலைகள்",
      unsafeScenarios: "ஆபத்தான நிலைகள்",
      minDistance: "குறைந்தபட்ச இடைவெளி",
      proximityViolations: "பாதுகாப்பு விதிமீறல்கள்",
      operatingScenario: "செயலில் உள்ள சூழ்நிலை",
      simulationStatus: "உருவகப்படுத்துதல் நிலை",
      lastExperiment: "கடைசி சோதனை முடிவு",
      quickLaunch: "விரைவு வழிசெலுத்தல்",
      systemHealth: "பாதுகாப்பு எஞ்சின் நிலை",
      recentEvents: "சமீபத்திய பாதுகாப்பு நிகழ்வுகள்",
      unnecessaryRestrictionsSaved: "தவிர்க்கப்பட்ட தேவையற்ற நிறுத்தங்கள்",
    },
    simulator: {
      title: "2D ஆலை பாதுகாப்பு உருவகப்படுத்தி",
      play: "தொடங்கு",
      pause: "நிறுத்து",
      reset: "மீட்டமை",
      step: "முன்னேறு",
      speed: "வேகம்",
      scenario: "சூழ்நிலையைத் தேர்ந்தெடு",
      liveDistance: "தற்போதைய தூரம்",
      dynamicZone: "தேவையான இயக்க பாதுகாப்பு தூரம்",
      staticZone: "நிலையான அடிப்படை தூரம்",
      riskAssessment: "நேரலை ஆபத்து நிலை",
      explanation: "முடிவெடுத்ததற்கான விளக்கம்",
      timeline: "பாதுகாப்பு நிகழ்வு காலவரிசை",
      robotSpeed: "ரோபோ வேகம்",
      humanSpeed: "மனித வேகம்",
      humanTask: "மனித பணி",
      editPath: "பாதை திருத்துதல் முறை",
      viewMode: "உருவகப்படுத்துதல் முறை",
      robotPath: "ரோபோ பாதை",
      humanPath: "மனித பாதை",
      addWaypoint: "புள்ளி சேர்க்க கிளிக் செய்யவும்",
      deleteWaypoint: "புள்ளியை நீக்க கிளிக் செய்யவும்",
      clearPath: "பாதையை அழி",
      savePath: "பாதையை சேமி",
      resetPath: "இயல்புநிலை பாதைக்கு மாற்று",
      telemetry: "நேரலை தொலை அளவியல் (Telemetry)",
      liveChart: "இடைவெளி தொலை அளவியல் வரைபடம்",
      simulationSummary: "உருவகப்படுத்துதல் சுருக்கம்",
      exportTelemetryCSV: "தொலை அளவியல் CSV ஏற்றுமதி",
      saveAsExperiment: "சோதனை வரலாற்றில் சேமி",
    },
    experiments: {
      title: "தானியங்கி சோதனை தொகுப்பு",
      subtitle: "தானியங்கி சோதனை ஓட்டங்களை இயக்கி நிலையான மற்றும் இயக்க பாதுகாப்பு மண்டல முடிவுகளை ஒப்பிடவும்.",
      runBatch: "அனைத்து சூழ்நிலைகளையும் இயக்கு",
      batchResults: "சோதனை முடிவுகள் அட்டவணை",
      history: "சேமிக்கப்பட்ட சோதனை வரலாறு",
      exportCSV: "சோதனை CSV ஏற்றுமதி",
      clearHistory: "வரலாற்றை அழி",
      baselineComparison: "நிலையான மற்றும் இயக்க மாதிரியின் ஒப்பீடு",
      unnecessaryRestrictionsDesc: "முன்மாதிரி தேவையற்ற கட்டுப்பாட்டு மெட்ரிக்: இயக்க பாதுகாப்பு மாதிரி பாதுகாப்பாக இயங்க அனுமதித்த போது நிலையான வளையம் தேவையற்றதாக எச்சரித்த நிறுத்தங்கள்.",
    },
    sensitivity: {
      title: "உணர்திறன் பகுப்பாய்வு & முடிவு மாற்றக் கண்டறிதல்",
      subtitle: "அளவீட்டு மாற்றங்களின் மூலம் பாதுகாப்பு முடிவுகள் SAFE/WARNING/UNSAFE நிலைக்கு மாறும் வரம்புகளைக் கண்டறியவும்.",
      paramSelect: "அளவீட்டைத் தேர்ந்தெடு",
      chartTitle: "தேவையான இயக்க தூரம் வரைபடம்",
      decisionTransitions: "பாதுகாப்பு முடிவு மாற்றங்கள்",
      noTransitions: "சோதிக்கப்பட்ட வரம்பில் பாதுகாப்பு நிலையில் மாற்றங்கள் இல்லை.",
      influenceAnalysis: "அளவீட்டு தாக்க மதிப்பீடு",
    },
    common: {
      save: "சேமி",
      cancel: "ரத்து செய்",
      export: "ஏற்றுமதி செய்",
      exportCSV: "CSV ஏற்றுமதி",
      import: "இறக்குமதி செய்",
      runAll: "அனைத்தையும் இயக்கு",
      status: "நிலை",
      online: "ஆன்லைன்",
      offline: "ஆஃப்லைன் முறை",
      filter: "வடிகட்டு",
      search: "தேடு...",
      actions: "செயல்கள்",
      delete: "நீக்கு",
      view: "பார்வையிடு",
    },
  },
};
