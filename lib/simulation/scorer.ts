import { 
  ScenarioConfig, 
  SessionEvent, 
  SessionScore, 
  ClassificationType, 
  ResponsePathway, 
  TaskLoadLevel,
  TaskLoadBreakdown,
  CalibrationBreakdown,
  WhatIfResult
} from "../types";

export interface DecisionRecord {
  contactId: string;
  classification: ClassificationType;
  response: ResponsePathway;
  latencyMs: number;
  detectionLatencyMs: number;
  timestampOffsetMs: number;
  decisionConfidence?: number; // 20 - 100
  taskLoadLevel?: TaskLoadLevel; // Evaluated at decision time
}

export function calculateSessionScore(
  scenario: ScenarioConfig,
  decisions: DecisionRecord[],
  events: SessionEvent[],
  historicalLastScore: number = 87
): SessionScore {
  const totalContacts = scenario.contacts.length;
  const committedCount = decisions.length;

  // 1. Detection Score (25% weight): based on detection latency
  let detectionPoints = 0;
  decisions.forEach((d) => {
    if (d.detectionLatencyMs <= 2500) {
      detectionPoints += 100;
    } else {
      const penalty = Math.min(60, ((d.detectionLatencyMs - 2500) / 4500) * 60);
      detectionPoints += Math.max(40, 100 - penalty);
    }
  });

  const missedCount = Math.max(0, totalContacts - committedCount);
  const missedPenalty = missedCount * 12;
  const avgDetection = committedCount > 0 
    ? Math.max(25, (detectionPoints / totalContacts) - missedPenalty) 
    : 45;

  // 2. Classification Score (25% weight)
  let classificationPoints = 0;
  decisions.forEach((d) => {
    const contact = scenario.contacts.find((c) => c.id === d.contactId);
    if (!contact) return;
    if (d.classification === contact.groundTruthClassification) {
      classificationPoints += 100;
    } else if (
      (contact.groundTruthClassification === "COORDINATED GROUP" && d.classification === "MILITARY-LIKE SIGNATURE") ||
      (contact.groundTruthClassification === "COMMERCIAL" && d.classification === "UNKNOWN")
    ) {
      classificationPoints += 65; // Partially accurate signature
    } else {
      classificationPoints += 30; // False classification under noise
    }
  });
  const avgClassification = committedCount > 0 ? (classificationPoints / totalContacts) : 45;

  // 3. Decision Score (25% weight): abstract response pathway appropriateness
  let decisionPoints = 0;
  decisions.forEach((d) => {
    const contact = scenario.contacts.find((c) => c.id === d.contactId);
    if (!contact) return;
    if (d.response === contact.groundTruthResponse) {
      decisionPoints += 100;
    } else {
      const responseHierarchy: ResponsePathway[] = ["VERIFY", "MONITOR", "ALERT", "ESCALATE", "SIMULATED MITIGATION"];
      const actualIdx = responseHierarchy.indexOf(contact.groundTruthResponse);
      const chosenIdx = responseHierarchy.indexOf(d.response);
      const diff = Math.abs(actualIdx - chosenIdx);
      if (diff === 1) decisionPoints += 70;
      else if (diff === 2) decisionPoints += 45;
      else decisionPoints += 20;
    }
  });
  const avgDecision = committedCount > 0 ? (decisionPoints / totalContacts) : 40;

  // 4. Response Timing Score (15% weight)
  let timingPoints = 0;
  decisions.forEach((d) => {
    if (d.latencyMs <= 3000) timingPoints += 100;
    else if (d.latencyMs <= 5000) timingPoints += 80;
    else if (d.latencyMs <= 8000) timingPoints += 60;
    else timingPoints += 40;
  });
  const avgTiming = committedCount > 0 ? timingPoints / committedCount : 50;

  // 5. Multi-Contact Handling (10% weight)
  let multiContactHandling = 65;
  if (committedCount >= 3) {
    const multiEvents = events.filter((e) => e.eventType === "SATURATION_WARNING" || e.latencyMs > 4000);
    if (multiEvents.length === 0) {
      multiContactHandling = 85;
    } else if (multiEvents.length <= 2) {
      multiContactHandling = 63;
    } else {
      multiContactHandling = 52;
    }
  }

  // 6. Degraded Sensor Performance
  const degradedSensorScore = Math.round(
    avgClassification * 0.4 + avgDetection * 0.4 + (scenario.sensorQuality * 100) * 0.2
  );

  // Official Weighted Composite Score
  const rawScore = 
    avgDetection * 0.25 +
    avgClassification * 0.25 +
    avgDecision * 0.25 +
    avgTiming * 0.15 +
    multiContactHandling * 0.10;

  const overallScore = Math.max(30, Math.min(99, Math.round(rawScore)));
  const scoreDelta = overallScore - historicalLastScore;

  // Secondary Diagnostic 1: Simulated Task Load Breakdown
  let taskLoadBreakdown: TaskLoadBreakdown | undefined;
  if (decisions.length >= 2) {
    const lowDecisions = decisions.filter((d) => d.taskLoadLevel === "LOW");
    const medDecisions = decisions.filter((d) => d.taskLoadLevel === "MEDIUM");
    const highDecisions = decisions.filter((d) => d.taskLoadLevel === "HIGH");

    const calcGroupScore = (decs: DecisionRecord[]) => {
      if (decs.length === 0) return 0;
      let total = 0;
      decs.forEach((d) => {
        const c = scenario.contacts.find((item) => item.id === d.contactId);
        if (!c) return;
        const clsPts = d.classification === c.groundTruthClassification ? 100 : 40;
        const respPts = d.response === c.groundTruthResponse ? 100 : 40;
        total += (clsPts + respPts) / 2;
      });
      return Math.round(total / decs.length);
    };

    const lowScore = lowDecisions.length > 0 ? calcGroupScore(lowDecisions) : 94;
    const medScore = medDecisions.length > 0 ? calcGroupScore(medDecisions) : 81;
    const highScore = highDecisions.length > 0 ? calcGroupScore(highDecisions) : 63;
    const loadDegradation = lowScore - highScore;

    taskLoadBreakdown = {
      lowLoadScore: lowScore,
      mediumLoadScore: medScore,
      highLoadScore: highScore,
      loadDegradation,
      sampleCount: decisions.length,
      hasSufficientData: true,
    };
  } else {
    taskLoadBreakdown = {
      lowLoadScore: 0,
      mediumLoadScore: 0,
      highLoadScore: 0,
      loadDegradation: 0,
      sampleCount: decisions.length,
      hasSufficientData: false,
    };
  }

  // Secondary Diagnostic 2: Decision Calibration Breakdown
  let calibrationBreakdown: CalibrationBreakdown | undefined;
  if (decisions.length >= 2) {
    let highConfCorrect = 0;
    let highConfIncorrect = 0;
    let lowConfCorrect = 0;
    let lowConfIncorrect = 0;

    decisions.forEach((d) => {
      const c = scenario.contacts.find((item) => item.id === d.contactId);
      if (!c) return;
      const conf = d.decisionConfidence ?? 70;
      const isCorrect = d.classification === c.groundTruthClassification && d.response === c.groundTruthResponse;
      const isHighConf = conf >= 70;

      if (isHighConf && isCorrect) highConfCorrect++;
      else if (isHighConf && !isCorrect) highConfIncorrect++;
      else if (!isHighConf && isCorrect) lowConfCorrect++;
      else lowConfIncorrect++;
    });

    const calibrationGap = highConfIncorrect * 15 - lowConfCorrect * 5;

    calibrationBreakdown = {
      highConfCorrect,
      highConfIncorrect,
      lowConfCorrect,
      lowConfIncorrect,
      calibrationGap,
      hasSufficientData: true,
    };
  } else {
    calibrationBreakdown = {
      highConfCorrect: 0,
      highConfIncorrect: 0,
      lowConfCorrect: 0,
      lowConfIncorrect: 0,
      calibrationGap: 0,
      hasSufficientData: false,
    };
  }

  return {
    sessionId: `SESSION-${Math.floor(10 + Math.random() * 90)}`,
    traineeId: "TRN-04",
    scenarioId: scenario.id,
    detectionScore: Math.round(avgDetection),
    classificationScore: Math.round(avgClassification),
    decisionScore: Math.round(avgDecision),
    timingScore: Math.round(avgTiming),
    multiContactScore: Math.round(multiContactHandling),
    degradedSensorScore: Math.round(degradedSensorScore),
    overallScore,
    scoreDelta,
    calculatedAt: new Date().toISOString(),
    taskLoadBreakdown,
    calibrationBreakdown,
  };
}

/**
 * Deterministically projects session score if an alternative decision had been taken.
 */
export function projectWhatIfScenario(
  scenario: ScenarioConfig,
  currentDecisions: DecisionRecord[],
  events: SessionEvent[],
  targetContactId: string,
  alternativeClassification: ClassificationType,
  alternativeResponse: ResponsePathway
): WhatIfResult {
  const origScore = calculateSessionScore(scenario, currentDecisions, events, 87);
  const targetDecision = currentDecisions.find((d) => d.contactId === targetContactId) || {
    contactId: targetContactId,
    classification: "COMMERCIAL" as ClassificationType,
    response: "MONITOR" as ResponsePathway,
    latencyMs: 3500,
    detectionLatencyMs: 2000,
    timestampOffsetMs: 20000,
    decisionConfidence: 70,
  };

  // Substitute alternative decision in a cloned array
  const counterfactualDecisions: DecisionRecord[] = currentDecisions.map((d) => {
    if (d.contactId === targetContactId) {
      return {
        ...d,
        classification: alternativeClassification,
        response: alternativeResponse,
        // If correcting an error, simulate optimal decision processing latency
        latencyMs: Math.max(1600, d.latencyMs - 1200),
      };
    }
    return d;
  });

  // If target wasn't in array yet, append it
  if (!counterfactualDecisions.some((d) => d.contactId === targetContactId)) {
    counterfactualDecisions.push({
      ...targetDecision,
      classification: alternativeClassification,
      response: alternativeResponse,
    });
  }

  // Rerun official scoring deterministically
  const projectedScoreObj = calculateSessionScore(scenario, counterfactualDecisions, events, 87);

  const affectedCompetencies = [
    {
      name: "Classification Accuracy",
      originalVal: origScore.classificationScore,
      projectedVal: projectedScoreObj.classificationScore,
    },
    {
      name: "Decision Pathway Quality",
      originalVal: origScore.decisionScore,
      projectedVal: projectedScoreObj.decisionScore,
    },
  ];

  return {
    contactId: targetContactId,
    originalClassification: targetDecision.classification,
    originalResponse: targetDecision.response,
    alternativeClassification,
    alternativeResponse,
    originalScore: origScore.overallScore,
    projectedScore: projectedScoreObj.overallScore,
    scoreDelta: projectedScoreObj.overallScore - origScore.overallScore,
    affectedCompetencies,
  };
}
