import { Pool } from "pg";
import { SEEDED_TRAINEE, SEEDED_SCENARIOS, HISTORICAL_SESSION_SCORES, HISTORICAL_AAR_EVENTS } from "../data/seeds";
import { Trainee, ScenarioConfig, SessionScore, SessionEvent } from "../types";
import { DecisionRecord } from "../simulation/scorer";

const SEEDED_DECISIONS_SESSION_08: DecisionRecord[] = [
  {
    contactId: "D-01",
    classification: "COMMERCIAL",
    response: "MONITOR",
    latencyMs: 1400,
    detectionLatencyMs: 1800,
    timestampOffsetMs: 7200,
    decisionConfidence: 85,
    taskLoadLevel: "LOW",
  },
  {
    contactId: "D-07",
    classification: "COMMERCIAL",
    response: "MONITOR",
    latencyMs: 3800,
    detectionLatencyMs: 4200,
    timestampOffsetMs: 18400,
    decisionConfidence: 75,
    taskLoadLevel: "HIGH",
  },
  {
    contactId: "D-09",
    classification: "MILITARY-LIKE SIGNATURE",
    response: "ESCALATE",
    latencyMs: 2900,
    detectionLatencyMs: 3200,
    timestampOffsetMs: 22100,
    decisionConfidence: 65,
    taskLoadLevel: "HIGH",
  },
  {
    contactId: "D-03",
    classification: "AUTHORIZED / EXPECTED",
    response: "VERIFY",
    latencyMs: 1600,
    detectionLatencyMs: 2100,
    timestampOffsetMs: 29000,
    decisionConfidence: 80,
    taskLoadLevel: "MEDIUM",
  },
];

// In-memory memory fallback stores
const memoryStore = {
  trainees: new Map<string, Trainee>([[SEEDED_TRAINEE.id, SEEDED_TRAINEE]]),
  scenarios: new Map<string, ScenarioConfig>(Object.entries(SEEDED_SCENARIOS)),
  scores: new Map<string, SessionScore>(HISTORICAL_SESSION_SCORES.map((s) => [s.sessionId, s])),
  events: new Map<string, SessionEvent[]>(new Map([["SESSION-08", HISTORICAL_AAR_EVENTS]])),
  decisions: new Map<string, DecisionRecord[]>([["SESSION-08", SEEDED_DECISIONS_SESSION_08]]),
};

// Database connection helper
let pool: Pool | null = null;
let isDbAvailable = false;

export function getNormalizedDbUrl(): string | null {
  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRE_URL || process.env.POSTGRES_URL;
  if (!rawUrl) return null;
  // Normalize python psycopg format "postgresql+psycopg://" to "postgresql://"
  return rawUrl.replace(/^postgresql\+psycopg:\/\//, "postgresql://");
}

export function getDbPool(): Pool | null {
  if (pool) return pool;
  const connectionString = getNormalizedDbUrl();
  if (!connectionString) return null;

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000,
    });
    return pool;
  } catch (err) {
    console.warn("PostgreSQL pool init failed, using in-memory store:", err);
    return null;
  }
}

/**
 * Initialize database schema if PostgreSQL is accessible
 */
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  const p = getDbPool();
  if (!p) {
    return { success: false, message: "No PostgreSQL connection string available. Using in-memory store." };
  }

  try {
    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS trainees (
          id VARCHAR(64) PRIMARY KEY,
          code VARCHAR(64) NOT NULL,
          display_name VARCHAR(128) NOT NULL,
          streak INT DEFAULT 1,
          last_session_score INT DEFAULT 85,
          primary_gap VARCHAR(255),
          competency_json JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS scenarios (
          id VARCHAR(64) PRIMARY KEY,
          seed INT NOT NULL,
          name VARCHAR(128) NOT NULL,
          environment VARCHAR(32),
          terrain VARCHAR(32),
          sensor_quality NUMERIC(3,2),
          visibility NUMERIC(3,2),
          contact_count INT,
          pattern VARCHAR(64),
          difficulty INT,
          training_objective TEXT,
          configuration_json JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(64) PRIMARY KEY,
          trainee_id VARCHAR(64),
          scenario_id VARCHAR(64),
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ,
          score INT,
          status VARCHAR(32) DEFAULT 'COMPLETED'
        );

        CREATE TABLE IF NOT EXISTS session_scores (
          session_id VARCHAR(64) PRIMARY KEY,
          trainee_id VARCHAR(64),
          scenario_id VARCHAR(64),
          detection_score INT,
          classification_score INT,
          decision_score INT,
          timing_score INT,
          multi_contact_score INT,
          degraded_sensor_score INT,
          overall_score INT,
          score_delta INT,
          calculated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS session_events (
          id VARCHAR(64) PRIMARY KEY,
          session_id VARCHAR(64) NOT NULL,
          timestamp_offset_ms INT,
          time_formatted VARCHAR(16),
          contact_id VARCHAR(32),
          event_type VARCHAR(32),
          action TEXT,
          correctness VARCHAR(32),
          latency_ms INT,
          metadata_json JSONB
        );
      `);

      isDbAvailable = true;
      return { success: true, message: "PostgreSQL tables verified and initialized." };
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("PostgreSQL connection error:", errorMsg);
    isDbAvailable = false;
    return { success: false, message: `Database offline or unreachable: ${errorMsg}` };
  }
}

// Data access operations with instant in-memory fallback
export async function getTrainee(id: string = "TRN-04"): Promise<Trainee> {
  const p = getDbPool();
  if (p && isDbAvailable) {
    try {
      const res = await p.query("SELECT * FROM trainees WHERE id = $1", [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          code: row.code,
          displayName: row.display_name,
          streak: row.streak,
          lastSessionScore: row.last_session_score,
          primaryGap: row.primary_gap,
          competencyProfile: row.competency_json,
        };
      }
    } catch {
      // fallback to memory
    }
  }
  return memoryStore.trainees.get(id) || SEEDED_TRAINEE;
}

export async function saveSessionResults(
  score: SessionScore,
  events: SessionEvent[],
  decisions?: DecisionRecord[]
): Promise<void> {
  // Always update in-memory store
  memoryStore.scores.set(score.sessionId, score);
  memoryStore.events.set(score.sessionId, events);
  if (decisions && decisions.length > 0) {
    memoryStore.decisions.set(score.sessionId, decisions);
  }

  // Update trainee competency
  const trainee = memoryStore.trainees.get(score.traineeId) || SEEDED_TRAINEE;
  trainee.lastSessionScore = score.overallScore;
  trainee.streak += 1;
  memoryStore.trainees.set(score.traineeId, trainee);

  // Save to PostgreSQL if available
  const p = getDbPool();
  if (p && isDbAvailable) {
    try {
      await p.query(
        `INSERT INTO session_scores 
         (session_id, trainee_id, scenario_id, detection_score, classification_score, decision_score, timing_score, multi_contact_score, degraded_sensor_score, overall_score, score_delta, calculated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (session_id) DO UPDATE SET overall_score = EXCLUDED.overall_score`,
        [
          score.sessionId,
          score.traineeId,
          score.scenarioId,
          score.detectionScore,
          score.classificationScore,
          score.decisionScore,
          score.timingScore,
          score.multiContactScore,
          score.degradedSensorScore,
          score.overallScore,
          score.scoreDelta,
          score.calculatedAt,
        ]
      );
    } catch (err) {
      console.warn("DB save score error (fallback active):", err);
    }
  }
}

export async function getSessionScore(sessionId: string): Promise<SessionScore | null> {
  if (memoryStore.scores.has(sessionId)) {
    return memoryStore.scores.get(sessionId)!;
  }
  return HISTORICAL_SESSION_SCORES[1] || null;
}

export async function getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  if (memoryStore.events.has(sessionId)) {
    return memoryStore.events.get(sessionId)!;
  }
  return HISTORICAL_AAR_EVENTS;
}

export async function getSessionDecisions(sessionId: string): Promise<DecisionRecord[]> {
  if (memoryStore.decisions.has(sessionId)) {
    return memoryStore.decisions.get(sessionId)!;
  }
  return SEEDED_DECISIONS_SESSION_08;
}

export async function getScenario(scenarioId: string): Promise<ScenarioConfig> {
  return memoryStore.scenarios.get(scenarioId) || SEEDED_SCENARIOS["SCN-008"];
}
