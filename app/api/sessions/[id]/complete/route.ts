import { NextRequest, NextResponse } from "next/server";
import { SEEDED_SCENARIOS } from "@/lib/data/seeds";
import { calculateSessionScore } from "@/lib/simulation/scorer";
import { saveSessionResults } from "@/lib/db/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { scenarioId, decisions, events } = body;

    const scenario = SEEDED_SCENARIOS[scenarioId] || SEEDED_SCENARIOS["SCN-008"];
    const computedScore = calculateSessionScore(scenario, decisions || [], events || [], 87);
    computedScore.sessionId = id;

    await saveSessionResults(computedScore, events || [], decisions || []);

    return NextResponse.json({
      success: true,
      score: computedScore,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Session complete API error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
