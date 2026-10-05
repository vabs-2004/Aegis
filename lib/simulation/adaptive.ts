import { CompetencyProfile, SessionScore, ScenarioConfig, AdaptiveChain } from "../types";
import { SEEDED_SCENARIOS } from "../data/seeds";

export function analyzeTrainingGap(
  score: SessionScore,
  competency: CompetencyProfile
): AdaptiveChain {
  // Determine lowest skill intersection
  const multiAccuracy = score.multiContactScore || competency.multiContact;
  const singleAccuracy = Math.min(99, Math.round(score.detectionScore * 0.5 + score.classificationScore * 0.5));
  const delta = multiAccuracy - singleAccuracy;

  // Determine difficulty adaptation
  let nextDifficulty = 7;
  let parameterShift = "Maintain difficulty (07), increase concurrent contacts from 5 to 6";
  
  if (score.overallScore >= 90) {
    nextDifficulty = 8;
    parameterShift = "Readiness demonstrated: Escalate difficulty 07 → 08 with lower visibility";
  } else if (score.overallScore < 60) {
    nextDifficulty = 6;
    parameterShift = "De-escalate difficulty 07 → 06 to isolate single-to-dual contact transition";
  }

  const nextScenario: ScenarioConfig = {
    ...SEEDED_SCENARIOS["SCN-009"],
    difficulty: nextDifficulty,
  };

  return {
    lastSessionSummary: {
      score: score.overallScore,
      delta: score.scoreDelta,
      weakestMetric: "Multi-contact discrimination",
      weakestScore: multiAccuracy,
    },
    gapDetected: {
      name: "MULTI-CONTACT DISCRIMINATION",
      singleAccuracy,
      multiAccuracy,
      delta,
      reason: "Performance dropped significantly when simultaneous contacts appeared under degraded sensor conditions.",
    },
    trainingFocus: {
      focusTitle: "CONCURRENT CONTACT DISCRIMINATION",
      actionItems: [
        "Increase concurrent target emergence rate (+20%)",
        "Retain RF noise and degraded sensor quality (60%)",
        "Add divergent decoy contact alongside converging group",
      ],
      parameterShift,
    },
    nextScenario,
  };
}
