"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { TacticalCanvas } from "@/components/simulation/TacticalCanvas";
import { TelemetryPanel } from "@/components/simulation/TelemetryPanel";
import { InspectorDecisionPanel } from "@/components/simulation/InspectorDecisionPanel";
import { EventStrip } from "@/components/simulation/EventStrip";
import { SEEDED_SCENARIOS } from "@/lib/data/seeds";
import { ScenarioConfig, Contact, ClassificationType, ResponsePathway, SessionEvent } from "@/lib/types";
import { computeContactPositions } from "@/lib/simulation/trajectory";
import { calculateCurrentTaskLoad } from "@/lib/simulation/sensor";
import { DecisionRecord } from "@/lib/simulation/scorer";
import { ArrowRight } from "lucide-react";

function TrainSimulator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get("scenario") || "SCN-008";

  const [scenario] = useState<ScenarioConfig>(
    SEEDED_SCENARIOS[scenarioParam] || SEEDED_SCENARIOS["SCN-008"]
  );

  const sessionId = "SESSION-08";

  // Simulation State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>("D-07"); // Auto-select D-07 for immediate action
  const [selectionTimeSec, setSelectionTimeSec] = useState<number>(0);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [events, setEvents] = useState<SessionEvent[]>([
    {
      id: "evt-init",
      timestampOffsetMs: 7200,
      timeFormatted: "00:07",
      contactId: "D-01",
      eventType: "DETECT",
      action: "Contact D-01 acquired on urban vector",
      correctness: "CORRECT",
      latencyMs: 1400,
    },
  ]);

  // Contact metadata lookup
  const contactMap = useMemo(() => {
    const map: Record<string, Contact> = {};
    scenario.contacts.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [scenario.contacts]);

  // Master Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 0.1;
        // Check timeout
        if (next >= scenario.timeLimitSeconds) {
          setIsRunning(false);
          return scenario.timeLimitSeconds;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, scenario.timeLimitSeconds]);

  // Compute contact positions deterministically via useMemo
  const contactPositions = useMemo(
    () => computeContactPositions(scenario.contacts, elapsedSeconds, scenario.sensorQuality),
    [scenario.contacts, elapsedSeconds, scenario.sensorQuality]
  );

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    setSelectionTimeSec(elapsedSeconds);
  };

  const handleCommitDecision = (
    contactId: string,
    classification: ClassificationType,
    response: ResponsePathway,
    decisionConfidence: number = 70
  ) => {
    const contact = contactMap[contactId];
    if (!contact) return;

    const latencyMs = Math.round(
      Math.max(800, (elapsedSeconds - selectionTimeSec) * 1000)
    );
    const detectionLatencyMs = Math.round(
      Math.max(1000, (elapsedSeconds - contact.appearanceDelaySeconds) * 1000)
    );

    // Decision-time task load evaluation
    const activeCount = contactPositions.filter((c) => c.visible).length;
    const unresolvedCount = scenario.contactCount - decisions.length;
    const currentTaskLoad = calculateCurrentTaskLoad(
      activeCount,
      unresolvedCount,
      scenario.sensorQuality
    );

    const isClassificationCorrect = classification === contact.groundTruthClassification;
    const isResponseCorrect = response === contact.groundTruthResponse;
    const correctness =
      isClassificationCorrect && isResponseCorrect
        ? "CORRECT"
        : isClassificationCorrect || isResponseCorrect
        ? "ATTENTION"
        : "INCORRECT";

    const newDecision: DecisionRecord = {
      contactId,
      classification,
      response,
      latencyMs,
      detectionLatencyMs,
      timestampOffsetMs: Math.round(elapsedSeconds * 1000),
      decisionConfidence,
      taskLoadLevel: currentTaskLoad.level,
    };

    setDecisions((prev) => [...prev.filter((d) => d.contactId !== contactId), newDecision]);

    // Format mm:ss
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    const newEvent: SessionEvent = {
      id: `evt-${Date.now()}`,
      timestampOffsetMs: Math.round(elapsedSeconds * 1000),
      timeFormatted,
      contactId,
      eventType: "DECISION",
      action: `${classification} → ${response}`,
      correctness,
      latencyMs,
    };

    setEvents((prev) => [...prev, newEvent]);

    // Auto switch to next uncommitted contact
    const remaining = scenario.contacts.find(
      (c) => c.id !== contactId && !decisions.some((d) => d.contactId === c.id)
    );
    if (remaining) {
      setTimeout(() => {
        handleSelectContact(remaining.id);
      }, 350);
    }
  };

  const handleCompleteSession = async () => {
    setIsRunning(false);

    try {
      // Post to server route for scoring & persistence
      await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          decisions,
          events,
        }),
      });

      router.push(`/aar/${sessionId}`);
    } catch {
      router.push(`/aar/${sessionId}`);
    }
  };

  const selectedContact = selectedContactId ? contactMap[selectedContactId] || null : null;
  const isAlreadyCommitted = decisions.some((d) => d.contactId === selectedContactId);

  // Time format: 00:18.42
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = (elapsedSeconds % 60).toFixed(2);
  const formattedTimer = `${mins.toString().padStart(2, "0")}:${secs.padStart(5, "0")}`;

  return (
    <AppShell activeSessionId={sessionId} isSimActive={isRunning}>
      {/* Simulator Control Header */}
      <div className="h-11 flex-shrink-0 bg-[#111614] border-b border-[#2A322D] px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#89A97D] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#E8ECE7]">
              {sessionId} {'//'} {scenario.environment} / {scenario.terrain} / DEGRADED
            </span>
          </div>
          <span className="text-[#687169] text-xs">|</span>
          <span className="text-[11px] font-mono text-[#9AA39B]">
            OBJECTIVE: <strong className="text-[#8CA8B8]">{scenario.trainingObjective}</strong>
          </span>
        </div>

        {/* Central Monospace Timer */}
        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1 rounded bg-[#0B0E0D] border border-[#2A322D] text-sm font-bold text-[#89A97D] tracking-wider">
            {formattedTimer}
          </div>

          <button
            onClick={handleCompleteSession}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#171C19] hover:bg-[#1C231F] text-[#8CA8B8] hover:text-[#E8ECE7] border border-[#2A322D] hover:border-[#8CA8B8] text-xs font-mono transition-colors cursor-pointer"
          >
            <span>COMPLETE SESSION & PROCEED TO AAR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Zone Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Zone 1: Left Telemetry (3 cols) */}
        <div className="col-span-12 lg:col-span-3 h-full border-r border-[#2A322D] overflow-hidden">
          <TelemetryPanel
            scenario={scenario}
            unresolvedCount={scenario.contactCount - decisions.length}
            committedCount={decisions.length}
            taskLoadLevel={
              calculateCurrentTaskLoad(
                contactPositions.filter((c) => c.visible).length,
                scenario.contactCount - decisions.length,
                scenario.sensorQuality
              ).level
            }
            taskLoadScore={
              calculateCurrentTaskLoad(
                contactPositions.filter((c) => c.visible).length,
                scenario.contactCount - decisions.length,
                scenario.sensorQuality
              ).score
            }
          />
        </div>

        {/* Zone 2: Tactical Simulation Canvas (6 cols) */}
        <div className="col-span-12 lg:col-span-6 h-full p-2 bg-[#0B0E0D] flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 relative">
            <TacticalCanvas
              contacts={contactPositions}
              contactMetadata={contactMap}
              selectedContactId={selectedContactId}
              onSelectContact={handleSelectContact}
              sensorQuality={scenario.sensorQuality}
              visibility={scenario.visibility}
              elapsedSeconds={elapsedSeconds}
            />
          </div>
        </div>

        {/* Zone 3: Contact Inspector & Decision Workflow (3 cols) */}
        <div className="col-span-12 lg:col-span-3 h-full border-l border-[#2A322D] overflow-hidden">
          <InspectorDecisionPanel
            key={selectedContactId}
            selectedContact={selectedContact}
            observedTimeSec={
              selectedContactId
                ? Math.max(0, elapsedSeconds - selectionTimeSec)
                : 0
            }
            liveTelemetry={
              contactPositions.find((c) => c.id === selectedContactId)
                ? {
                    detectionConfidence: contactPositions.find((c) => c.id === selectedContactId)!.detectionConfidence,
                    classificationConfidence: contactPositions.find((c) => c.id === selectedContactId)!.classificationConfidence,
                    lastConfirmedSec: contactPositions.find((c) => c.id === selectedContactId)!.lastConfirmedSec,
                    visibilityState: contactPositions.find((c) => c.id === selectedContactId)!.visibilityState,
                  }
                : undefined
            }
            onCommitDecision={handleCommitDecision}
            isAlreadyCommitted={isAlreadyCommitted}
          />
        </div>
      </div>

      {/* Bottom Event Strip */}
      <EventStrip events={events} />
    </AppShell>
  );
}

export default function TrainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-[#0B0E0D] text-[#8CA8B8] font-mono text-xs">
          INITIALIZING SIMULATION ENVIRONMENT...
        </div>
      }
    >
      <TrainSimulator />
    </Suspense>
  );
}
