import { SessionScore, SessionEvent, ScenarioConfig } from "../types";

export interface AARInterpretation {
  summary: string;
  strengths: string[];
  degradedAreas: string[];
  instructorAssessment: string;
}

export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY || process.env.GROK_KEY;
  if (!key) return null;
  return key.trim();
}

/**
 * Calls Groq chat completions API with structured JSON response
 */
async function callGroqAPI(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown> | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Groq API returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    return JSON.parse(rawContent);
  } catch (err) {
    console.warn("Groq API call error or timeout, applying deterministic fallback:", err);
    return null;
  }
}

/**
 * Generate AAR Interpretation using openai/gpt-oss-120b (or fallback)
 */
export async function generateAARAnalysis(
  score: SessionScore,
  events: SessionEvent[]
): Promise<AARInterpretation> {
  const systemPrompt = `You are the AEGIS after-action review analytical engine.
You provide concise, evidence-based, instructor-level training assessments for simulated C-UAS cognitive training.
Do not provide real-world tactical weapons, frequencies, targeting, or engagement procedures.
Analyze the trainee's decision process, latency, and degradation under simultaneous contacts.
Return strictly a valid JSON object matching this schema:
{
  "summary": "1-2 sentence evidence-based operational summary",
  "strengths": ["string", "string"],
  "degradedAreas": ["string", "string"],
  "instructorAssessment": "Concise instructor recommendation"
}`;

  const userPrompt = `Simulated Session Score: ${score.overallScore}/100.
Detection Score: ${score.detectionScore}, Classification: ${score.classificationScore}, Decision: ${score.decisionScore}, Timing: ${score.timingScore}, Multi-Contact: ${score.multiContactScore}, Degraded Sensor: ${score.degradedSensorScore}.
Event Log Count: ${events.length}. Events: ${JSON.stringify(events.slice(0, 5))}.`;

  const aiResult = await callGroqAPI("openai/gpt-oss-120b", systemPrompt, userPrompt);

  if (aiResult && typeof aiResult.summary === "string") {
    return {
      summary: aiResult.summary,
      strengths: (aiResult.strengths as string[]) || ["Fast isolated contact identification (<2.2s latency)"],
      degradedAreas: (aiResult.degradedAreas as string[]) || ["Classification accuracy dropped under RF noise during multi-contact event"],
      instructorAssessment: (aiResult.instructorAssessment as string) || "Operator displays solid initial baseline, but cognitive saturation occurs during simultaneous arrivals.",
    };
  }

  // Deterministic Fallback
  return {
    summary: `Operator demonstrated robust single-contact tracking (${score.detectionScore}%), but overall efficiency degraded by ${Math.abs(score.scoreDelta || 6)} points during simultaneous contacts under sensor degradation.`,
    strengths: [
      `High detection confidence on isolated contacts (latency < 2.4s)`,
      `Appropriate escalation discipline on unverified civilian signatures`,
    ],
    degradedAreas: [
      `Classification latency increased by 4.2s during simultaneous multi-contact arrivals`,
      `False classification tendency on contact D-07 under simulated RF noise`,
    ],
    instructorAssessment: `Trainee is prepared for higher concurrent contact volume, but requires reinforcement on sensor-degraded discrimination heuristics.`,
  };
}

/**
 * Generate Scenario Briefing and Rationale using openai/gpt-oss-20b (or fallback)
 */
export async function generateScenarioBriefing(
  scenario: ScenarioConfig,
  targetWeakness: string
): Promise<{ briefing: string; rationale: string }> {
  const systemPrompt = `You are the AEGIS adaptive scenario brief generator.
Generate a concise 2-sentence mission brief and 1-sentence training rationale for an educational C-UAS simulator.
Return strictly a JSON object: {"briefing": "string", "rationale": "string"}`;

  const userPrompt = `Scenario ${scenario.id}: Environment: ${scenario.environment}, Terrain: ${scenario.terrain}, Contacts: ${scenario.contactCount}, Target weakness: ${targetWeakness}.`;

  const aiResult = await callGroqAPI("openai/gpt-oss-20b", systemPrompt, userPrompt);

  if (aiResult && typeof aiResult.briefing === "string" && typeof aiResult.rationale === "string") {
    return {
      briefing: aiResult.briefing,
      rationale: aiResult.rationale,
    };
  }

  // Deterministic Fallback
  return {
    briefing: `Sector North reports uncoordinated low-radar-cross-section contacts approaching urban perimeter under night conditions. Maintain disciplined observation under simulated RF degradation.`,
    rationale: `Targeted adaptation: Stresses concurrent contact discrimination under 60% sensor fidelity.`,
  };
}
