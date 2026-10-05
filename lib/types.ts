export type EnvironmentType = "DAY" | "NIGHT" | "LOW_VISIBILITY";
export type TerrainType = "URBAN" | "RURAL" | "COMPLEX";
export type ThreatPattern = "SINGLE_CONTACT" | "MULTI_CONTACT" | "COORDINATED_GROUP";

export type ClassificationType = 
  | "UNKNOWN" 
  | "AUTHORIZED / EXPECTED" 
  | "COMMERCIAL" 
  | "MILITARY-LIKE SIGNATURE" 
  | "COORDINATED GROUP";

export type ResponsePathway = 
  | "VERIFY" 
  | "MONITOR" 
  | "ALERT" 
  | "ESCALATE" 
  | "SIMULATED MITIGATION";

export type VisibilityState = "STABLE" | "DEGRADED" | "INTERMITTENT";
export type TaskLoadLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ContactTrajectoryPoint {
  x: number;
  y: number;
  timeSec: number;
}

export interface Contact {
  id: string; // e.g. "D-07"
  initialX: number; // 0-100 percentage
  initialY: number;
  speed: number;
  heading: number; // degrees
  pattern: "steady" | "crossing" | "converging" | "diverging" | "intermittent";
  detectionConfidence: number; // 0-100 base
  classificationConfidence: number; // 0-100 base
  groundTruthClassification: ClassificationType;
  groundTruthResponse: ResponsePathway;
  uncertaintyRadius: number;
  sensorVisibility: "NOMINAL" | "DEGRADED" | "HEAVILY_DEGRADED";
  movementDescription: string;
  appearanceDelaySeconds: number;
  isFriendly?: boolean;
}

export interface ScenarioConfig {
  id: string;
  seed: number;
  name: string;
  environment: EnvironmentType;
  terrain: TerrainType;
  sensorQuality: number; // 0.0 - 1.0
  visibility: number; // 0.0 - 1.0
  contactCount: number;
  pattern: ThreatPattern;
  difficulty: number; // 1 - 10
  trainingObjective: string;
  timeLimitSeconds: number;
  contacts: Contact[];
  rationale?: string;
}

export interface SessionEvent {
  id: string;
  timestampOffsetMs: number;
  timeFormatted: string; // "00:07"
  contactId: string;
  eventType: "DETECT" | "CLASSIFY" | "DECISION" | "SATURATION_WARNING";
  action: string;
  correctness: "CORRECT" | "ATTENTION" | "INCORRECT";
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

export interface TaskLoadBreakdown {
  lowLoadScore: number;
  mediumLoadScore: number;
  highLoadScore: number;
  loadDegradation: number;
  sampleCount: number;
  hasSufficientData: boolean;
}

export interface CalibrationBreakdown {
  highConfCorrect: number;
  highConfIncorrect: number;
  lowConfCorrect: number;
  lowConfIncorrect: number;
  calibrationGap: number;
  hasSufficientData: boolean;
}

export interface WhatIfResult {
  contactId: string;
  originalClassification: ClassificationType;
  originalResponse: ResponsePathway;
  alternativeClassification: ClassificationType;
  alternativeResponse: ResponsePathway;
  originalScore: number;
  projectedScore: number;
  scoreDelta: number;
  affectedCompetencies: { name: string; originalVal: number; projectedVal: number }[];
}

export interface SessionScore {
  sessionId: string;
  traineeId: string;
  scenarioId: string;
  detectionScore: number;
  classificationScore: number;
  decisionScore: number;
  timingScore: number;
  multiContactScore: number;
  degradedSensorScore: number;
  overallScore: number;
  scoreDelta: number; // vs historical last session
  calculatedAt: string;
  taskLoadBreakdown?: TaskLoadBreakdown;
  calibrationBreakdown?: CalibrationBreakdown;
}

export interface CompetencyProfile {
  detection: number;
  classification: number;
  decision: number;
  responseTiming: number;
  multiContact: number;
  degradedSensor: number;
  night: number;
  updatedAt: string;
}

export interface Trainee {
  id: string;
  code: string;
  displayName: string;
  competencyProfile: CompetencyProfile;
  streak: number;
  lastSessionScore: number;
  primaryGap: string;
}

export interface AdaptiveChain {
  lastSessionSummary: {
    score: number;
    delta: number;
    weakestMetric: string;
    weakestScore: number;
  };
  gapDetected: {
    name: string;
    singleAccuracy: number;
    multiAccuracy: number;
    delta: number;
    reason: string;
  };
  trainingFocus: {
    focusTitle: string;
    actionItems: string[];
    parameterShift: string;
  };
  nextScenario: ScenarioConfig;
}
