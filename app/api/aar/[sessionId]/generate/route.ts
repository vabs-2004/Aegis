import { NextRequest, NextResponse } from "next/server";
import { getSessionScore, getSessionEvents, getSessionDecisions, getTrainee } from "@/lib/db/store";
import { generateAARAnalysis, generateScenarioBriefing } from "@/lib/ai/groq";
import { analyzeTrainingGap } from "@/lib/simulation/adaptive";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const score = await getSessionScore(sessionId);
    const events = await getSessionEvents(sessionId);
    const decisions = await getSessionDecisions(sessionId);
    const trainee = await getTrainee("TRN-04");

    if (!score) {
      return NextResponse.json({ error: "Session score not found" }, { status: 404 });
    }

    const adaptiveChain = analyzeTrainingGap(score, trainee.competencyProfile);
    const analysis = await generateAARAnalysis(score, events);
    const brief = await generateScenarioBriefing(adaptiveChain.nextScenario, adaptiveChain.gapDetected.name);

    if (brief.rationale) {
      adaptiveChain.nextScenario.rationale = brief.rationale;
    }

    return NextResponse.json({
      success: true,
      score,
      events,
      decisions,
      analysis,
      adaptiveChain,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("AAR API error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
