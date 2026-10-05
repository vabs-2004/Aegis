"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { SessionReplay } from "@/components/simulation/SessionReplay";
import { SEEDED_SCENARIOS, HISTORICAL_SESSION_SCORES, HISTORICAL_AAR_EVENTS, SEEDED_TRAINEE } from "@/lib/data/seeds";
import { SessionScore, SessionEvent, ScenarioConfig } from "@/lib/types";
import { analyzeTrainingGap } from "@/lib/simulation/adaptive";
import { DecisionRecord } from "@/lib/simulation/scorer";
import { 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  RotateCw,
  Cpu,
  Activity,
  Target
} from "lucide-react";

export default function AARPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId as string) || "SESSION-08";

  const [score, setScore] = useState<SessionScore>(HISTORICAL_SESSION_SCORES[1]);
  const [events, setEvents] = useState<SessionEvent[]>(HISTORICAL_AAR_EVENTS);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [scenario] = useState<ScenarioConfig>(SEEDED_SCENARIOS["SCN-008"]);
  const [aiRationale, setAiRationale] = useState<string>("");
  const [isGeneratingNext, setIsGeneratingNext] = useState<boolean>(false);
  const [hasGeneratedAdapted, setHasGeneratedAdapted] = useState<boolean>(false);

  useEffect(() => {
    // Fetch live session results if available, else use seeded session 8
    async function fetchAARData() {
      try {
        const res = await fetch(`/api/aar/${sessionId}/generate`);
        if (res.ok) {
          const data = await res.json();
          if (data.score) setScore(data.score);
          if (data.events) setEvents(data.events);
          if (data.decisions) setDecisions(data.decisions);
          if (data.adaptiveChain) {
            setAiRationale(data.adaptiveChain.nextScenario.rationale || "");
          }
        } else {
          // Fallback to local computation
          const localChain = analyzeTrainingGap(HISTORICAL_SESSION_SCORES[1], SEEDED_TRAINEE.competencyProfile);
          setAiRationale(localChain.nextScenario.rationale || "");
        }
      } catch {
        const localChain = analyzeTrainingGap(HISTORICAL_SESSION_SCORES[1], SEEDED_TRAINEE.competencyProfile);
        setAiRationale(localChain.nextScenario.rationale || "");
      }
    }
    fetchAARData();
  }, [sessionId]);

  const handleGenerateTargeted = async () => {
    setIsGeneratingNext(true);
    try {
      // Simulate / call API for Groq synthesis
      await new Promise((r) => setTimeout(r, 600));
      setHasGeneratedAdapted(true);
      setAiRationale(
        "Adapted Scenario SCN-009 synthesized: Escalated concurrent target arrival rate to 6 simultaneous contacts while preserving 60% RF noise profile to isolate discrimination breakdown."
      );
    } finally {
      setIsGeneratingNext(false);
    }
  };

  const handleStartTargetedTraining = () => {
    router.push("/train?scenario=SCN-009");
  };

  const competencyMetrics = [
    { label: "DETECTION LATENCY & QUALITY", val: score.detectionScore, ideal: 90 },
    { label: "CLASSIFICATION ACCURACY", val: score.classificationScore, ideal: 85 },
    { label: "DECISION PATHWAY QUALITY", val: score.decisionScore, ideal: 85 },
    { label: "RESPONSE TIMING", val: score.timingScore, ideal: 80 },
    { label: "MULTI-CONTACT DISCRIMINATION", val: score.multiContactScore, ideal: 80, isGap: true },
    { label: "DEGRADED SENSING ADAPTATION", val: score.degradedSensorScore, ideal: 75, isGap: true },
  ];

  return (
    <AppShell activeSessionId={sessionId}>
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0B0E0D] font-sans">
        {/* AAR Header & Hero Banner */}
        <div className="bg-[#111614] border border-[#2A322D] p-5 rounded">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#687169] flex items-center gap-2">
                <span>POST-SIMULATION EVALUATION</span>
                <span>•</span>
                <span className="text-[#8CA8B8]">EVIDENCE-BASED RUBRIC</span>
              </div>
              <h1 className="text-xl font-bold font-mono text-[#E8ECE7] mt-1">
                AFTER-ACTION REVIEW {'//'} {sessionId}
              </h1>
              <div className="text-xs text-[#9AA39B] mt-0.5">
                Scenario: SCN-008 (Night / Urban / Degraded Sensors) • Trainee: ARJUN-04
              </div>
            </div>

            {/* Score Hero */}
            <div className="flex items-center gap-6 bg-[#171C19] border border-[#2A322D] p-3 px-5 rounded font-mono">
              <div>
                <span className="text-[10px] text-[#687169] uppercase block">OVERALL SCORE</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-bold text-[#E8ECE7]">{score.overallScore}</span>
                  <span className="text-xs text-[#687169]">/ 100</span>
                </div>
              </div>

              <div className="border-l border-[#2A322D] pl-5">
                <span className="text-[10px] text-[#687169] uppercase block">SCORE DELTA</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {score.scoreDelta >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-[#89A97D]" />
                      <span className="text-sm font-semibold text-[#89A97D]">
                        +{score.scoreDelta} vs baseline
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-[#C96862]" />
                      <span className="text-sm font-semibold text-[#C96862]">
                        {score.scoreDelta} vs baseline
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Training Gap Callout (Crucial SIH Differentiator) */}
        <div className="bg-[#171C19] border border-[#D6A85B]/40 p-4 rounded font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#D6A85B] text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>PRIMARY TRAINING GAP IDENTIFIED</span>
            </div>
            <span className="text-[10px] text-[#9AA39B]">CAUSAL EVIDENCE LOGGED</span>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#111614] border border-[#2A322D] rounded">
              <span className="text-[10px] text-[#687169] block">WEAKEST SKILL DIMENSION</span>
              <span className="text-sm font-bold text-[#E8ECE7] block mt-1">
                MULTI-CONTACT DISCRIMINATION
              </span>
              <span className="text-[10px] text-[#D6A85B] mt-0.5 block">
                Concurrent target saturation under RF noise
              </span>
            </div>

            <div className="p-3 bg-[#111614] border border-[#2A322D] rounded">
              <span className="text-[10px] text-[#687169] block">SINGLE VS MULTI-CONTACT ACCURACY</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-[#89A97D]">94% (Single)</span>
                <span className="text-xs text-[#687169]">→</span>
                <span className="text-sm font-bold text-[#C96862]">63% (Multi)</span>
              </div>
              <span className="text-[10px] text-[#C96862] mt-0.5 block">
                -31 points performance degradation
              </span>
            </div>

            <div className="p-3 bg-[#111614] border border-[#2A322D] rounded">
              <span className="text-[10px] text-[#687169] block">PROCESS BREAKDOWN CAUSE</span>
              <span className="text-[11px] text-[#9AA39B] block mt-1 leading-snug">
                Latency rose by 4.2s when D-07 & D-09 converged simultaneously, inducing misclassification.
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Diagnostics: Simulated Cognitive Load & Decision Calibration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          {/* Diagnostic 1: Simulated Cognitive Load */}
          <div className="bg-[#111614] border border-[#2A322D] p-4 rounded">
            <div className="flex items-center justify-between text-xs text-[#9AA39B] uppercase font-bold tracking-wider pb-2 border-b border-[#2A322D]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#8CA8B8]" />
                <span>PERFORMANCE UNDER TASK LOAD</span>
              </div>
              <span className="text-[10px] text-[#687169]">DECISION-TIME LOAD</span>
            </div>

            {score.taskLoadBreakdown && score.taskLoadBreakdown.hasSufficientData ? (
              <div className="mt-3 space-y-2.5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
                    <span className="text-[10px] text-[#687169] block">LOW LOAD</span>
                    <span className="text-sm font-bold text-[#89A97D] block mt-0.5">
                      {score.taskLoadBreakdown.lowLoadScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
                    <span className="text-[10px] text-[#687169] block">MED LOAD</span>
                    <span className="text-sm font-bold text-[#8CA8B8] block mt-0.5">
                      {score.taskLoadBreakdown.mediumLoadScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
                    <span className="text-[10px] text-[#687169] block">HIGH LOAD</span>
                    <span className="text-sm font-bold text-[#D6A85B] block mt-0.5">
                      {score.taskLoadBreakdown.highLoadScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#171C19]/60 border border-[#2A322D] text-[11px]">
                  <span className="text-[#9AA39B]">LOAD DEGRADATION DROP</span>
                  <span className="text-[#D6A85B] font-bold">
                    -{score.taskLoadBreakdown.loadDegradation} pts under simultaneous arrivals
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#687169]">
                INSUFFICIENT SAMPLE DATA (&lt;2 decisions under variable load)
              </div>
            )}
          </div>

          {/* Diagnostic 2: Decision Calibration */}
          <div className="bg-[#111614] border border-[#2A322D] p-4 rounded">
            <div className="flex items-center justify-between text-xs text-[#9AA39B] uppercase font-bold tracking-wider pb-2 border-b border-[#2A322D]">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#8CA8B8]" />
                <span>DECISION CONFIDENCE CALIBRATION</span>
              </div>
              <span className="text-[10px] text-[#687169]">CALIBRATION ACCURACY</span>
            </div>

            {score.calibrationBreakdown && score.calibrationBreakdown.hasSufficientData ? (
              <div className="mt-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
                    <span className="text-[10px] text-[#687169] block">HIGH CONFIDENCE COMMITS</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#89A97D]">
                        {score.calibrationBreakdown.highConfCorrect} CORRECT
                      </span>
                      <span className="text-[10px] text-[#687169]">/</span>
                      <span className="text-xs font-bold text-[#C96862]">
                        {score.calibrationBreakdown.highConfIncorrect} INCORRECT
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
                    <span className="text-[10px] text-[#687169] block">LOW/MOD CONFIDENCE COMMITS</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#89A97D]">
                        {score.calibrationBreakdown.lowConfCorrect} CORRECT
                      </span>
                      <span className="text-[10px] text-[#687169]">/</span>
                      <span className="text-xs font-bold text-[#9AA39B]">
                        {score.calibrationBreakdown.lowConfIncorrect} INCORRECT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#171C19]/60 border border-[#2A322D] text-[11px]">
                  <span className="text-[#9AA39B]">CALIBRATION GAP</span>
                  <span className={score.calibrationBreakdown.calibrationGap > 0 ? "text-[#D6A85B] font-bold" : "text-[#89A97D] font-bold"}>
                    {score.calibrationBreakdown.calibrationGap > 0
                      ? `+${score.calibrationBreakdown.calibrationGap}% (Overconfidence risk detected)`
                      : "Well-calibrated decision awareness"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#687169]">
                INSUFFICIENT SAMPLE DATA (&lt;2 decisions calibrated)
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Performance & Replay Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Horizontal Competency Breakdown + Event Timeline (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Competency Breakdown Bars */}
            <div className="bg-[#111614] border border-[#2A322D] p-4 rounded space-y-3 font-mono">
              <div className="text-xs uppercase tracking-wider text-[#9AA39B] flex items-center justify-between">
                <span>COMPETENCY PERFORMANCE BREAKDOWN</span>
                <span className="text-[10px] text-[#687169]">BENCHMARK</span>
              </div>

              <div className="space-y-2.5">
                {competencyMetrics.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={item.isGap ? "text-[#D6A85B] font-semibold" : "text-[#9AA39B]"}>
                        {item.label}
                      </span>
                      <span className="text-[#E8ECE7] font-bold">{item.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#1C231F] rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.val < 70
                            ? "bg-[#D6A85B]"
                            : item.val < 80
                            ? "bg-[#8CA8B8]"
                            : "bg-[#89A97D]"
                        }`}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronological Event Timeline */}
            <div className="bg-[#111614] border border-[#2A322D] p-4 rounded font-mono">
              <div className="text-xs uppercase tracking-wider text-[#9AA39B] mb-3 flex items-center justify-between">
                <span>CHRONOLOGICAL EVENT LOG</span>
                <span className="text-[10px] text-[#687169]">{events.length} EVENTS RECORDED</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2 rounded bg-[#171C19] border border-[#2A322D] flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#687169]">{evt.timeFormatted}</span>
                      <span className="text-[#8CA8B8] font-bold">{evt.contactId}</span>
                      <span className="text-[#E8ECE7] truncate max-w-[220px]">{evt.action}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          evt.correctness === "CORRECT"
                            ? "bg-[#89A97D]/10 text-[#89A97D] border border-[#89A97D]/30"
                            : evt.correctness === "ATTENTION"
                            ? "bg-[#D6A85B]/10 text-[#D6A85B] border border-[#D6A85B]/30"
                            : "bg-[#C96862]/10 text-[#C96862] border border-[#C96862]/30"
                        }`}
                      >
                        {evt.correctness}
                      </span>
                      <span className="text-[#687169] text-[10px]">{(evt.latencyMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Session Replay (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <SessionReplay scenario={scenario} events={events} decisions={decisions} />
          </div>
        </div>

        {/* THE USP VISUAL: The Explicit Adaptive Process Chain */}
        <div className="bg-[#111614] border border-[#39433C] p-5 rounded font-mono">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-[#8CA8B8] font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#8CA8B8]" />
              <span>THE AEGIS ADAPTIVE LEARNING LOOP</span>
            </div>
            <span className="text-[10px] text-[#687169]">AUTONOMOUS CURRICULUM SYNTHESIS</span>
          </div>

          {/* Horizontal Adaptive Chain */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1: Last Session */}
            <div className="p-3 bg-[#171C19] border border-[#2A322D] rounded flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-[#687169] uppercase font-bold block">1. LAST SESSION</span>
                <span className="text-xs font-bold text-[#E8ECE7] block mt-1">SESSION 08</span>
                <span className="text-[10px] text-[#9AA39B] block mt-1">
                  Overall: {score.overallScore}/100
                </span>
              </div>
              <div className="text-[10px] text-[#D6A85B] mt-2 pt-2 border-t border-[#2A322D]">
                Multi-contact score: 63%
              </div>
            </div>

            {/* Step 2: Gap Detected */}
            <div className="p-3 bg-[#171C19] border border-[#D6A85B]/40 rounded flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-[#D6A85B] uppercase font-bold block">2. GAP DETECTED</span>
                <span className="text-xs font-bold text-[#E8ECE7] block mt-1">MULTI-CONTACT LOAD</span>
                <span className="text-[10px] text-[#9AA39B] block mt-1">
                  Delta: -31 pts under simultaneous arrival
                </span>
              </div>
              <div className="text-[10px] text-[#D6A85B] mt-2 pt-2 border-t border-[#2A322D]">
                Sensor degradation correlation
              </div>
            </div>

            {/* Step 3: Training Focus */}
            <div className="p-3 bg-[#171C19] border border-[#8CA8B8]/40 rounded flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-[#8CA8B8] uppercase font-bold block">3. TRAINING FOCUS</span>
                <span className="text-xs font-bold text-[#E8ECE7] block mt-1">CONCURRENT DISCRIMINATION</span>
                <span className="text-[10px] text-[#9AA39B] block mt-1">
                  Escalate contacts (5 → 6)
                </span>
              </div>
              <div className="text-[10px] text-[#89A97D] mt-2 pt-2 border-t border-[#2A322D]">
                Maintain RF noise (60%)
              </div>
            </div>

            {/* Step 4: Next Scenario */}
            <div className="p-3 bg-[#171C19] border border-[#89A97D]/40 rounded flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-[#89A97D] uppercase font-bold block">4. NEXT SCENARIO</span>
                <span className="text-xs font-bold text-[#E8ECE7] block mt-1">SCN-009 (TARGETED)</span>
                <span className="text-[10px] text-[#9AA39B] block mt-1">
                  Night / Urban / Degraded
                </span>
              </div>
              <div className="text-[10px] text-[#89A97D] mt-2 pt-2 border-t border-[#2A322D]">
                Difficulty 07 {'//'} 6 Contacts
              </div>
            </div>
          </div>

          {/* Targeted Scenario Action Banner */}
          <div className="mt-4 p-4 bg-[#171C19] border border-[#2A322D] rounded flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-[#E8ECE7] font-bold">
                NEXT TARGETED SCENARIO: <span className="text-[#89A97D]">SCN-009 {'//'} ADAPTIVE INCURSION</span>
              </div>
              <p className="text-[11px] text-[#9AA39B] max-w-2xl leading-normal">
                {aiRationale ||
                  "Targeted scenario generated specifically to train multi-contact discrimination while preserving degraded sensor load."}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {!hasGeneratedAdapted ? (
                <button
                  disabled={isGeneratingNext}
                  onClick={handleGenerateTargeted}
                  className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#1C231F] hover:bg-[#2A322D] text-[#8CA8B8] border border-[#8CA8B8] font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  {isGeneratingNext ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>SYNTHESIZING (GROQ LLM)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>GENERATE TARGETED SCENARIO</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleStartTargetedTraining}
                  className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#89A97D] hover:bg-[#9BBF8E] text-[#0B0E0D] border border-[#89A97D] font-mono text-xs font-bold transition-all cursor-pointer shadow"
                >
                  <span>START TARGETED TRAINING</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
