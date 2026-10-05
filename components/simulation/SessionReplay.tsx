"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ScenarioConfig, SessionEvent, Contact, ClassificationType, ResponsePathway } from "@/lib/types";
import { computeContactPositions } from "@/lib/simulation/trajectory";
import { TacticalCanvas } from "./TacticalCanvas";
import { DecisionRecord, projectWhatIfScenario } from "@/lib/simulation/scorer";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  GitBranch, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  SlidersHorizontal 
} from "lucide-react";

interface SessionReplayProps {
  scenario: ScenarioConfig;
  events: SessionEvent[];
  decisions?: DecisionRecord[];
}

const CLASSIFICATION_OPTIONS: ClassificationType[] = [
  "UNKNOWN",
  "AUTHORIZED / EXPECTED",
  "COMMERCIAL",
  "MILITARY-LIKE SIGNATURE",
  "COORDINATED GROUP",
];

const RESPONSE_OPTIONS: ResponsePathway[] = [
  "VERIFY",
  "MONITOR",
  "ALERT",
  "ESCALATE",
  "SIMULATED MITIGATION",
];

const FALLBACK_DECISIONS: DecisionRecord[] = [
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

export function SessionReplay({ scenario, events, decisions }: SessionReplayProps) {
  const [viewMode, setViewMode] = useState<"TIMELINE" | "WHAT_IF">("TIMELINE");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [replayTimeSec, setReplayTimeSec] = useState<number>(0);
  const [selectedContactId, setSelectedContactId] = useState<string | null>("D-07");

  // What-If Counterfactual state
  const [whatIfContactId, setWhatIfContactId] = useState<string>("D-07");
  const [altClassification, setAltClassification] = useState<ClassificationType>("MILITARY-LIKE SIGNATURE");
  const [altResponse, setAltResponse] = useState<ResponsePathway>("ESCALATE");

  const effectiveDecisions = useMemo(() => {
    return decisions && decisions.length > 0 ? decisions : FALLBACK_DECISIONS;
  }, [decisions]);

  const contactMap = useMemo(() => {
    const map: Record<string, Contact> = {};
    scenario.contacts.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [scenario.contacts]);

  const maxTimeSec = 45; // Standard replay sample duration

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setReplayTimeSec((prev) => {
        const next = prev + 0.1 * replaySpeed;
        if (next >= maxTimeSec) {
          setIsPlaying(false);
          return maxTimeSec;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, replaySpeed]);

  const contactPositions = useMemo(
    () => computeContactPositions(scenario.contacts, replayTimeSec, scenario.sensorQuality),
    [scenario.contacts, replayTimeSec, scenario.sensorQuality]
  );

  // Find active event at current time
  const currentEvent = events.find(
    (e) => Math.abs(e.timestampOffsetMs / 1000 - replayTimeSec) < 1.5
  );

  const resetReplay = () => {
    setIsPlaying(false);
    setReplayTimeSec(0);
  };

  const mins = Math.floor(replayTimeSec / 60);
  const secs = (replayTimeSec % 60).toFixed(1);
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs.padStart(4, "0")}`;

  // Deterministic What-If Projection Calculation
  const whatIfResult = useMemo(() => {
    return projectWhatIfScenario(
      scenario,
      effectiveDecisions,
      events,
      whatIfContactId,
      altClassification,
      altResponse
    );
  }, [scenario, effectiveDecisions, events, whatIfContactId, altClassification, altResponse]);

  const originalTargetDecision = effectiveDecisions.find((d) => d.contactId === whatIfContactId);

  return (
    <div className="flex flex-col bg-[#111614] border border-[#2A322D] rounded select-none overflow-hidden font-mono">
      {/* Replay Control Bar */}
      <div className="h-10 px-3 bg-[#171C19] border-b border-[#2A322D] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8CA8B8]"></span>
          <span className="text-[#E8ECE7] font-semibold text-[11px]">
            SESSION REPLAY {'//'} {scenario.id}
          </span>
          {viewMode === "TIMELINE" && (
            <span className="text-[#687169] text-[10px]">({formattedTime} / 00:45.0)</span>
          )}
        </div>

        {/* View Mode Switcher + Playback Controls */}
        <div className="flex items-center gap-2">
          {viewMode === "TIMELINE" ? (
            <>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C231F] hover:bg-[#2A322D] border border-[#2A322D] text-[#E8ECE7] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-[#D6A85B]" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-[#89A97D]" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button
                onClick={resetReplay}
                className="p-1 rounded bg-[#1C231F] hover:bg-[#2A322D] border border-[#2A322D] text-[#9AA39B] transition-colors cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              {/* Speed Multipliers */}
              <div className="flex items-center rounded border border-[#2A322D] bg-[#1C231F] overflow-hidden">
                {[0.5, 1, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setReplaySpeed(speed)}
                    className={`px-2 py-0.5 text-[10px] transition-colors ${
                      replaySpeed === speed
                        ? "bg-[#8CA8B8] text-[#0B0E0D] font-bold"
                        : "text-[#9AA39B] hover:text-[#E8ECE7]"
                    }`}
                  >
                    {speed}×
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {/* Mode Switch Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setViewMode(viewMode === "TIMELINE" ? "WHAT_IF" : "TIMELINE");
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
              viewMode === "WHAT_IF"
                ? "bg-[#D6A85B]/20 text-[#D6A85B] border-[#D6A85B]"
                : "bg-[#1C231F] text-[#8CA8B8] border-[#2A322D] hover:border-[#8CA8B8]"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{viewMode === "TIMELINE" ? "WHAT-IF REPLAY" : "TACTICAL TIMELINE"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Either Tactical Timeline or What-If Counterfactual */}
      {viewMode === "TIMELINE" ? (
        <>
          {/* Embedded Tactical Canvas */}
          <div className="h-[360px] p-2 bg-[#0B0E0D] relative">
            <TacticalCanvas
              contacts={contactPositions}
              contactMetadata={contactMap}
              selectedContactId={selectedContactId}
              onSelectContact={(id) => setSelectedContactId(id)}
              sensorQuality={scenario.sensorQuality}
              visibility={scenario.visibility}
              elapsedSeconds={replayTimeSec}
            />

            {/* Live Event Synchronizer Overlay */}
            {currentEvent && (
              <div className="absolute bottom-4 left-4 right-4 bg-[#111614]/90 border border-[#8CA8B8] p-2 rounded flex items-center justify-between text-[11px] text-[#E8ECE7] shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-[#8CA8B8] font-bold">[{currentEvent.timeFormatted}]</span>
                  <span>{currentEvent.action}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    currentEvent.correctness === "CORRECT"
                      ? "bg-[#89A97D]/20 text-[#89A97D]"
                      : "bg-[#D6A85B]/20 text-[#D6A85B]"
                  }`}
                >
                  {currentEvent.correctness}
                </span>
              </div>
            )}
          </div>

          {/* Replay Scrubbing Bar */}
          <div className="h-1 bg-[#1C231F] w-full">
            <div
              className="h-full bg-[#8CA8B8] transition-all duration-100"
              style={{ width: `${(replayTimeSec / maxTimeSec) * 100}%` }}
            />
          </div>

          {/* Bottom Quick-Launch for What-If Exploration */}
          <div className="p-2.5 bg-[#171C19] border-t border-[#2A322D] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#9AA39B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85B]"></span>
              <span>D-07 misclassification identified under high load (+18.4s)</span>
            </div>
            <button
              onClick={() => {
                setWhatIfContactId("D-07");
                setAltClassification("MILITARY-LIKE SIGNATURE");
                setAltResponse("ESCALATE");
                setViewMode("WHAT_IF");
              }}
              className="flex items-center gap-1.5 text-[#D6A85B] hover:text-[#E8ECE7] font-bold transition-colors cursor-pointer"
            >
              <span>EXPLORE WHAT-IF ON D-07</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        /* What-If Counterfactual Explorer */
        <div className="h-[400px] p-4 bg-[#0B0E0D] flex flex-col justify-between overflow-y-auto">
          {/* Header & Contact Selector */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A322D]">
              <div>
                <div className="text-[10px] text-[#D6A85B] uppercase font-bold flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>COUNTERFACTUAL DECISION REPLAY</span>
                </div>
                <div className="text-xs text-[#E8ECE7] font-semibold mt-0.5">
                  Substitute Decision & Deterministic Rescore
                </div>
              </div>

              {/* Contact Selector Tabs */}
              <div className="flex items-center gap-1.5">
                {scenario.contacts.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setWhatIfContactId(c.id);
                      setAltClassification(c.groundTruthClassification);
                      setAltResponse(c.groundTruthResponse);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      whatIfContactId === c.id
                        ? "bg-[#D6A85B]/20 text-[#D6A85B] border-[#D6A85B]"
                        : "bg-[#171C19] text-[#9AA39B] border-[#2A322D] hover:text-[#E8ECE7]"
                    }`}
                  >
                    {c.id} {c.id === "D-07" ? "(GAP)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Grid: Inputs vs Projected Results */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
              {/* Left Column: Original vs Counterfactual Configuration (7 cols) */}
              <div className="md:col-span-7 space-y-3">
                {/* Original Recorded Decision Card */}
                <div className="p-2.5 rounded bg-[#111614] border border-[#2A322D] text-[11px]">
                  <span className="text-[10px] text-[#687169] uppercase font-bold block">
                    ORIGINAL TRAINEE ACTION [{whatIfContactId}]
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[#E8ECE7]">
                    <span className="font-semibold text-[#C96862]">
                      {originalTargetDecision?.classification || "COMMERCIAL"} →{" "}
                      {originalTargetDecision?.response || "MONITOR"}
                    </span>
                    <span className="text-[10px] text-[#9AA39B]">
                      Recorded Load: {originalTargetDecision?.taskLoadLevel || "HIGH"}
                    </span>
                  </div>
                </div>

                {/* Alternative Classification Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#8CA8B8] uppercase font-bold block">
                    COUNTERFACTUAL CLASSIFICATION
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CLASSIFICATION_OPTIONS.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setAltClassification(cls)}
                        className={`px-2 py-1 rounded text-[10px] text-left truncate border transition-colors cursor-pointer ${
                          altClassification === cls
                            ? "bg-[#8CA8B8]/20 text-[#8CA8B8] border-[#8CA8B8] font-bold"
                            : "bg-[#171C19] text-[#9AA39B] border-[#2A322D] hover:border-[#39433C]"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alternative Response Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#8CA8B8] uppercase font-bold block">
                    COUNTERFACTUAL RESPONSE PATHWAY
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {RESPONSE_OPTIONS.map((resp) => (
                      <button
                        key={resp}
                        onClick={() => setAltResponse(resp)}
                        className={`px-2 py-1 rounded text-[10px] text-center truncate border transition-colors cursor-pointer ${
                          altResponse === resp
                            ? "bg-[#89A97D]/20 text-[#89A97D] border-[#89A97D] font-bold"
                            : "bg-[#171C19] text-[#9AA39B] border-[#2A322D] hover:border-[#39433C]"
                        }`}
                      >
                        {resp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Deterministic Recomputation Output (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between p-3 rounded bg-[#171C19] border border-[#2A322D]">
                <div>
                  <div className="text-[10px] text-[#687169] uppercase font-bold">
                    DETERMINISTIC SCORE RESCORE
                  </div>

                  {/* Score Delta Hero */}
                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#2A322D]">
                    <div>
                      <span className="text-[10px] text-[#9AA39B] block">ORIGINAL</span>
                      <span className="text-xl font-bold text-[#E8ECE7]">{whatIfResult.originalScore}</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#687169] self-center" />

                    <div>
                      <span className="text-[10px] text-[#9AA39B] block">PROJECTED</span>
                      <span className="text-xl font-bold text-[#89A97D]">{whatIfResult.projectedScore}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#687169] block">DELTA</span>
                      <div className="flex items-center gap-1">
                        {whatIfResult.scoreDelta >= 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-[#89A97D]" />
                            <span className="text-sm font-bold text-[#89A97D]">
                              +{whatIfResult.scoreDelta} pts
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-[#C96862]" />
                            <span className="text-sm font-bold text-[#C96862]">
                              {whatIfResult.scoreDelta} pts
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Competency Shift Breakdown */}
                  <div className="mt-3 pt-2 border-t border-[#2A322D] space-y-1.5 text-[10px]">
                    {whatIfResult.affectedCompetencies.map((comp) => (
                      <div key={comp.name} className="flex justify-between items-center text-[#9AA39B]">
                        <span>{comp.name}</span>
                        <span className="text-[#E8ECE7]">
                          {comp.originalVal}% →{" "}
                          <strong className={comp.projectedVal >= comp.originalVal ? "text-[#89A97D]" : "text-[#C96862]"}>
                            {comp.projectedVal}%
                          </strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deterministic Explanation */}
                <div className="mt-3 pt-2 border-t border-[#2A322D] text-[10px] text-[#8CA8B8] leading-tight">
                  {whatIfResult.scoreDelta > 0
                    ? `Immediate ${altClassification} classification & ${altResponse} intervention mitigates trajectory vector prior to urban boundary ingress.`
                    : whatIfResult.scoreDelta < 0
                    ? `Sub-optimal counterfactual increases operational latency penalty and reduces composite score.`
                    : `Identical decision vector yields nominal baseline performance.`}
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Footer */}
          <div className="pt-2 border-t border-[#2A322D] flex items-center justify-between text-[9px] text-[#687169]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#89A97D]" />
              <span>DETERMINISTIC EVALUATION GUARANTEE // 0% LLM SCORING INFERENCE</span>
            </div>
            <span>REPRODUCIBLE UNDER SEED</span>
          </div>
        </div>
      )}
    </div>
  );
}
