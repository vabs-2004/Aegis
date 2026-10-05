import { Contact, VisibilityState } from "../types";
import { evaluateSensorContactState } from "./sensor";

// Seeded PRNG (Mulberry32) for reproducible trajectories
export function createPRNG(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ComputedContactState {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  visible: boolean;
  uncertaintyRadius: number; // SVG pixel radius
  heading: number; // degrees
  breadcrumbs: { x: number; y: number }[];
  isFriendly: boolean;
  isLocked: boolean;
  isResolved: boolean;
  lastConfirmedSec: number;
  visibilityState: VisibilityState;
  detectionConfidence: number;
  classificationConfidence: number;
}

/**
 * Computes deterministic positions and kinematics of contacts at elapsed seconds.
 */
export function computeContactPositions(
  contacts: Contact[],
  elapsedSeconds: number,
  sensorQuality: number = 0.68,
  confirmedTimestamps: Record<string, number> = {},
  baseCenter = { x: 50, y: 50 }
): ComputedContactState[] {
  return contacts.map((contact) => {
    // If not appeared yet
    if (elapsedSeconds < contact.appearanceDelaySeconds) {
      return {
        id: contact.id,
        x: contact.initialX,
        y: contact.initialY,
        visible: false,
        uncertaintyRadius: contact.uncertaintyRadius,
        heading: contact.heading,
        breadcrumbs: [],
        isFriendly: !!contact.isFriendly,
        isLocked: false,
        isResolved: false,
        lastConfirmedSec: 0,
        visibilityState: "STABLE",
        detectionConfidence: contact.detectionConfidence,
        classificationConfidence: contact.classificationConfidence,
      };
    }

    const activeTime = elapsedSeconds - contact.appearanceDelaySeconds;
    const rad = (contact.heading * Math.PI) / 180;

    let posX = contact.initialX;
    let posY = contact.initialY;

    // Movement kinematics
    const speedFactor = contact.speed * 0.45; // percentage per second

    if (contact.pattern === "steady") {
      posX += Math.cos(rad) * speedFactor * activeTime;
      posY += Math.sin(rad) * speedFactor * activeTime;
    } else if (contact.pattern === "converging") {
      // Vector towards radar center (50, 50)
      const dx = baseCenter.x - contact.initialX;
      const dy = baseCenter.y - contact.initialY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      posX += nx * speedFactor * activeTime;
      posY += ny * speedFactor * activeTime;
    } else if (contact.pattern === "crossing") {
      posX += Math.cos(rad) * speedFactor * activeTime;
      posY += (Math.sin(rad) * speedFactor + Math.sin(activeTime * 0.5) * 0.4) * activeTime;
    } else if (contact.pattern === "intermittent") {
      posX += Math.cos(rad) * speedFactor * activeTime;
      posY += Math.sin(rad) * speedFactor * activeTime;
    }

    // Clamp inside canvas bounds
    posX = Math.max(5, Math.min(95, posX));
    posY = Math.max(5, Math.min(95, posY));

    // Handle intermittent visibility fade
    let visible = true;
    if (contact.pattern === "intermittent") {
      const cycle = Math.sin(activeTime * 0.8);
      if (cycle < -0.7) {
        visible = false;
      }
    }

    // Compute breadcrumbs (last 4 historical positions)
    const breadcrumbs: { x: number; y: number }[] = [];
    const stepCount = 4;
    for (let i = 1; i <= stepCount; i++) {
      const pastTime = Math.max(0, activeTime - i * 1.5);
      if (contact.pattern === "converging") {
        const dx = baseCenter.x - contact.initialX;
        const dy = baseCenter.y - contact.initialY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        breadcrumbs.push({
          x: Math.max(5, Math.min(95, contact.initialX + (dx / dist) * speedFactor * pastTime)),
          y: Math.max(5, Math.min(95, contact.initialY + (dy / dist) * speedFactor * pastTime)),
        });
      } else {
        breadcrumbs.push({
          x: Math.max(5, Math.min(95, contact.initialX + Math.cos(rad) * speedFactor * pastTime)),
          y: Math.max(5, Math.min(95, contact.initialY + Math.sin(rad) * speedFactor * pastTime)),
        });
      }
    }

    // Delegate sensor confirmation and decay calculation to sensor model
    const prevConfirmedAt = confirmedTimestamps[contact.id] ?? contact.appearanceDelaySeconds;
    const sensorTelemetry = evaluateSensorContactState(
      contact,
      posX,
      posY,
      elapsedSeconds,
      prevConfirmedAt,
      sensorQuality,
      baseCenter
    );

    return {
      id: contact.id,
      x: posX,
      y: posY,
      visible,
      uncertaintyRadius: sensorTelemetry.uncertaintyRadius,
      heading: contact.heading,
      breadcrumbs,
      isFriendly: !!contact.isFriendly,
      isLocked: false,
      isResolved: false,
      lastConfirmedSec: sensorTelemetry.lastConfirmedSec,
      visibilityState: sensorTelemetry.visibilityState,
      detectionConfidence: sensorTelemetry.detectionConfidence,
      classificationConfidence: sensorTelemetry.classificationConfidence,
    };
  });
}
