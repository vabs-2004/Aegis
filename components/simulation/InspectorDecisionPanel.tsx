"use client";

import React, { useState } from "react";
import { Contact, ClassificationType, ResponsePathway, VisibilityState } from "@/lib/types";
import { Crosshair } from "lucide-react";

interface InspectorDecisionPanelProps {
  selectedContact: Contact | null;
  observedTimeSec: number;
  liveTelemetry?: {
    detectionConfidence: number;
    classificationConfidence: number;
    lastConfirmedSec: number;
    visibilityState: VisibilityState;
  };
  onCommitDecision: (
    contactId: string,
    classification: ClassificationType,
    response: ResponsePathway,
    decisionConfidence: number
  ) => void;
  isAlreadyCommitted: boolean;
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

export function InspectorDecisionPanel({
  selectedContact,
  observedTimeSec,
  liveTelemetry,
  onCommitDecision,
  isAlreadyCommitted,
}: InspectorDecisionPanelProps) {
  const [selectedClassification, setSelectedClassification] = useState<ClassificationType | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponsePathway | null>(null);
  const [decisionConfidence, setDecisionConfidence] = useState<number>(70);

  if (!selectedContact) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#111614] border border-[#2A322D] select-none">
        <div className="w-10 h-10 rounded border border-[#2A322D] bg-[#171C19] flex items-center justify-center text-[#687169] mb-3">
          <Crosshair className="w-5 h-5" />
        </div>
        <div className="text-xs font-mono font-semibold text-[#E8ECE7] tracking-wider uppercase">
          NO CONTACT SELECTED
        </div>
        <p className="text-[11px] text-[#687169] mt-1 max-w-[200px]">
          Select an active radar contact on the tactical canvas to inspect telemetry and commit training response.
        </p>
      </div>
    );
  }

  const detConf = liveTelemetry?.detectionConfidence ?? selectedContact.detectionConfidence;
  const clsConf = liveTelemetry?.classificationConfidence ?? selectedContact.classificationConfidence;
  const lastConfirmedSec = liveTelemetry?.lastConfirmedSec ?? 0;
  const trackQuality = liveTelemetry?.visibilityState ?? selectedContact.sensorVisibility;

  const handleCommit = () => {
    if (!selectedClassification || !selectedResponse) return;
    onCommitDecision(selectedContact.id, selectedClassification, selectedResponse, decisionConfidence);
  };

  const confidenceLabel =
    decisionConfidence >= 80
      ? "HIGH CONFIDENCE"
      : decisionConfidence >= 50
      ? "MODERATE CONFIDENCE"
      : "LOW CONFIDENCE";

  return (
    <div className="h-full flex flex-col bg-[#111614] border border-[#2A322D] overflow-y-auto select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#2A322D] bg-[#171C19] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#687169]">
            SYNTHETIC CONTACT INSPECTOR
          </div>
          <div className="text-sm font-mono font-bold text-[#8CA8B8] flex items-center gap-2 mt-0.5">
            <span>CONTACT {selectedContact.id}</span>
            {isAlreadyCommitted ? (
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#89A97D]/10 text-[#89A97D] border border-[#89A97D]/30 font-normal">
                DECISION COMMITTED
              </span>
            ) : (
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#D6A85B]/10 text-[#D6A85B] border border-[#D6A85B]/30 font-normal animate-pulse">
                UNRESOLVED
              </span>
            )}
          </div>
        </div>

        <div className="text-right font-mono text-[11px]">
          <span className="text-[#687169] text-[9px] block">OBSERVED</span>
          <span className="text-[#E8ECE7] font-semibold">{observedTimeSec.toFixed(1)}s</span>
        </div>
      </div>

      {/* Uncertainty & Information Decay Telemetry */}
      <div className="p-3.5 border-b border-[#2A322D] space-y-3">
        {/* Detection Confidence Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-[#9AA39B]">DETECTION CONFIDENCE</span>
            <span className={detConf < 60 ? "text-[#D6A85B] font-semibold" : "text-[#E8ECE7] font-semibold"}>
              {detConf}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1C231F] rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                detConf < 60 ? "bg-[#D6A85B]" : "bg-[#8CA8B8]"
              }`}
              style={{ width: `${detConf}%` }}
            />
          </div>
        </div>

        {/* Classification Confidence Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-[#9AA39B]">CLASSIFICATION CONFIDENCE</span>
            <span className={clsConf < 55 ? "text-[#D6A85B] font-semibold" : "text-[#E8ECE7] font-semibold"}>
              {clsConf}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1C231F] rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                clsConf < 55 ? "bg-[#D6A85B]" : "bg-[#89A97D]"
              }`}
              style={{ width: `${clsConf}%` }}
            />
          </div>
        </div>

        {/* Technical Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
            <div className="text-[#687169]">LAST CONFIRMED</div>
            <div className="text-[#E8ECE7] font-semibold mt-0.5">
              {lastConfirmedSec > 0 ? `${lastConfirmedSec.toFixed(1)}s AGO` : "JUST NOW"}
            </div>
          </div>
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
            <div className="text-[#687169]">TRACK QUALITY</div>
            <div
              className={`font-semibold mt-0.5 ${
                trackQuality === "INTERMITTENT"
                  ? "text-[#C96862]"
                  : trackQuality === "DEGRADED"
                  ? "text-[#D6A85B]"
                  : "text-[#89A97D]"
              }`}
            >
              {trackQuality}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Workflow Area */}
      <div className="p-3.5 flex-1 flex flex-col space-y-4">
        {/* Step 1: Classification */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9AA39B] mb-1.5">
            <span>1. CLASSIFY CONTACT</span>
            <span className="text-[#687169] text-[9px]">REQUIRED</span>
          </div>
          <div className="space-y-1.5">
            {CLASSIFICATION_OPTIONS.map((opt) => {
              const isSelected = selectedClassification === opt;
              return (
                <button
                  key={opt}
                  disabled={isAlreadyCommitted}
                  onClick={() => setSelectedClassification(opt)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors border ${
                    isSelected
                      ? "bg-[#1C231F] border-[#8CA8B8] text-[#E8ECE7] font-semibold"
                      : "bg-[#171C19] border-[#2A322D] text-[#9AA39B] hover:text-[#E8ECE7] hover:border-[#39433C]"
                  } ${isAlreadyCommitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#8CA8B8]"></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Response Pathway */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9AA39B] mb-1.5">
            <span>2. TRAINING RESPONSE PATHWAY</span>
            <span className="text-[#687169] text-[9px]">ABSTRACT</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {RESPONSE_OPTIONS.map((resp) => {
              const isSelected = selectedResponse === resp;
              return (
                <button
                  key={resp}
                  disabled={isAlreadyCommitted}
                  onClick={() => setSelectedResponse(resp)}
                  className={`text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors border ${
                    isSelected
                      ? "bg-[#1C231F] border-[#D6A85B] text-[#E8ECE7] font-semibold"
                      : "bg-[#171C19] border-[#2A322D] text-[#9AA39B] hover:text-[#E8ECE7] hover:border-[#39433C]"
                  } ${isAlreadyCommitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{resp}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85B]"></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Decision Confidence Calibration */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9AA39B] mb-1.5">
            <span>3. DECISION CONFIDENCE</span>
            <span className="text-[#8CA8B8] font-bold text-[11px]">{decisionConfidence}%</span>
          </div>

          <div className="p-2.5 rounded bg-[#171C19] border border-[#2A322D] space-y-1.5">
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              disabled={isAlreadyCommitted}
              value={decisionConfidence}
              onChange={(e) => setDecisionConfidence(Number(e.target.value))}
              className="w-full accent-[#8CA8B8] bg-[#1C231F] h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-[#687169]">CALIBRATION:</span>
              <span className="text-[#8CA8B8] font-semibold">{confidenceLabel}</span>
            </div>
          </div>
        </div>

        {/* Commit Action Button */}
        <div className="pt-2 mt-auto">
          <button
            disabled={!selectedClassification || !selectedResponse || isAlreadyCommitted}
            onClick={handleCommit}
            className={`w-full py-2.5 px-3 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all duration-150 border ${
              isAlreadyCommitted
                ? "bg-[#171C19] border-[#2A322D] text-[#687169] cursor-not-allowed"
                : selectedClassification && selectedResponse
                ? "bg-[#8CA8B8] hover:bg-[#9CB8C8] text-[#0B0E0D] border-[#8CA8B8] shadow-sm cursor-pointer"
                : "bg-[#171C19] border-[#2A322D] text-[#687169] cursor-not-allowed"
            }`}
          >
            {isAlreadyCommitted ? "DECISION COMMITTED" : "COMMIT DECISION"}
          </button>
          <div className="text-[9px] font-mono text-[#687169] text-center mt-1.5">
            CONFIDENCE & LATENCY CALIBRATION LOGGED
          </div>
        </div>
      </div>
    </div>
  );
}
