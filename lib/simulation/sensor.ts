import { Contact, VisibilityState, TaskLoadLevel } from "../types";

export interface ContactSensorTelemetry {
  id: string;
  lastConfirmedAtSec: number;
  lastConfirmedSec: number;
  detectionConfidence: number;
  classificationConfidence: number;
  visibilityState: VisibilityState;
  uncertaintyRadius: number;
}

/**
 * Calculates whether the sweeping sensor beam confirms the contact,
 * and deterministically derives current confidence and visibility state.
 */
export function evaluateSensorContactState(
  contact: Contact,
  posX: number,
  posY: number,
  elapsedSeconds: number,
  previousConfirmedAtSec: number,
  sensorQuality: number, // 0.0 - 1.0
  baseCenter = { x: 50, y: 50 }
): ContactSensorTelemetry {
  // 1. Calculate contact bearing relative to radar origin
  const dx = posX - baseCenter.x;
  const dy = posY - baseCenter.y;
  let bearingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (bearingDeg < 0) bearingDeg += 360;

  // 2. Sensor sweep angle (45 degrees per second, 8-second rotation)
  const sweepAngle = (elapsedSeconds * 45) % 360;
  let angleDiff = Math.abs(bearingDeg - sweepAngle);
  if (angleDiff > 180) angleDiff = 360 - angleDiff;

  // 3. Sensor confirmation logic:
  // Sweep beam width is 20 degrees. When beam intersects contact bearing:
  let lastConfirmedAtSec = previousConfirmedAtSec;
  const beamWidth = 20;

  if (angleDiff <= beamWidth) {
    // Under degraded RF conditions, pulse transmission has deterministic fidelity
    const degradationThreshold = 0.25 * (1 - sensorQuality);
    const pulseCheck = (Math.sin(elapsedSeconds * 3.1 + contact.initialX) + 1) / 2;
    if (pulseCheck >= degradationThreshold) {
      lastConfirmedAtSec = elapsedSeconds;
    }
  }

  // 4. Derive time without confirmation
  const lastConfirmedSec = Math.max(0, elapsedSeconds - lastConfirmedAtSec);

  // 5. Monotonic confidence decay as time-without-confirmation grows
  const rfNoisePenalty = (1 - sensorQuality) * 20;
  const timeDecay = lastConfirmedSec * 3.5;

  const currentDetConf = Math.max(
    35,
    Math.min(95, Math.round(contact.detectionConfidence - rfNoisePenalty - timeDecay))
  );

  const currentClsConf = Math.max(
    25,
    Math.min(90, Math.round(contact.classificationConfidence - rfNoisePenalty * 1.3 - timeDecay * 1.2))
  );

  // 6. Visibility state transitions
  let visibilityState: VisibilityState = "STABLE";
  if (timeDecay > 16 || currentDetConf < 50 || contact.sensorVisibility === "HEAVILY_DEGRADED") {
    visibilityState = "INTERMITTENT";
  } else if (timeDecay > 7 || currentDetConf < 70 || contact.sensorVisibility === "DEGRADED") {
    visibilityState = "DEGRADED";
  }

  // 7. Uncertainty radius expands proportionally with decay
  const dynamicRadius = Math.max(
    contact.uncertaintyRadius,
    contact.uncertaintyRadius * (1 + lastConfirmedSec * 0.12 + (1 - sensorQuality) * 0.45)
  );

  return {
    id: contact.id,
    lastConfirmedAtSec,
    lastConfirmedSec,
    detectionConfidence: currentDetConf,
    classificationConfidence: currentClsConf,
    visibilityState,
    uncertaintyRadius: dynamicRadius,
  };
}

/**
 * Evaluates current task load at a specific decision timestamp.
 */
export function calculateCurrentTaskLoad(
  activeContactCount: number,
  unresolvedContactCount: number,
  sensorQuality: number
): { level: TaskLoadLevel; score: number; complexityFactor: number } {
  // Deterministic complexity factor from observable simulation conditions
  const complexityFactor =
    activeContactCount * 18 +
    unresolvedContactCount * 14 +
    (1 - sensorQuality) * 35;

  let level: TaskLoadLevel = "LOW";
  let score = 30;

  if (complexityFactor >= 70) {
    level = "HIGH";
    score = Math.min(95, Math.round(complexityFactor));
  } else if (complexityFactor >= 35) {
    level = "MEDIUM";
    score = Math.round(complexityFactor);
  } else {
    level = "LOW";
    score = Math.max(15, Math.round(complexityFactor));
  }

  return { level, score, complexityFactor };
}
