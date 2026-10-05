"use client";

import React from "react";
import { ScenarioConfig, TaskLoadLevel } from "@/lib/types";

interface TelemetryPanelProps {
  scenario: ScenarioConfig;
  unresolvedCount: number;
  committedCount: number;
  taskLoadLevel?: TaskLoadLevel;
  taskLoadScore?: number;
}

export function TelemetryPanel({
  scenario,
  unresolvedCount,
  committedCount,
  taskLoadLevel = "MEDIUM",
  taskLoadScore = 55,
}: TelemetryPanelProps) {
  const visPercent = Math.round(scenario.visibility * 100);
  const sensorPercent = Math.round(scenario.sensorQuality * 100);

  return (
    <div className="h-full flex flex-col bg-[#111614] border border-[#2A322D] overflow-y-auto select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#2A322D] bg-[#171C19]">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#687169]">
          SECTOR TELEMETRY
        </div>
        <div className="text-xs font-mono font-bold text-[#E8ECE7] mt-0.5">
          {scenario.id} {'//'} {scenario.name.toUpperCase()}
        </div>
      </div>

      {/* Conditions Section */}
      <div className="p-3.5 space-y-3 border-b border-[#2A322D]">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#9AA39B]">
          ENVIRONMENTAL PARAMETERS
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
            <span className="text-[#687169] block">TIME CONTEXT</span>
            <span className="text-[#E8ECE7] font-semibold">23:40 HRS</span>
          </div>
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
            <span className="text-[#687169] block">LIGHTING</span>
            <span className="text-[#8CA8B8] font-semibold">{scenario.environment}</span>
          </div>
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
            <span className="text-[#687169] block">TERRAIN</span>
            <span className="text-[#E8ECE7] font-semibold">{scenario.terrain}</span>
          </div>
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D]">
            <span className="text-[#687169] block">DIFFICULTY</span>
            <span className="text-[#D6A85B] font-semibold">{scenario.difficulty} / 10</span>
          </div>
        </div>

        {/* Meters */}
        <div className="space-y-2 pt-1 font-mono text-[10px]">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9AA39B]">OPTICAL VISIBILITY</span>
              <span className="text-[#E8ECE7] font-semibold">{visPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#1C231F] rounded overflow-hidden">
              <div
                className="h-full bg-[#9AA39B]"
                style={{ width: `${visPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9AA39B]">SENSOR FIDELITY</span>
              <span className={sensorPercent < 70 ? "text-[#D6A85B] font-semibold" : "text-[#89A97D] font-semibold"}>
                {sensorPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#1C231F] rounded overflow-hidden">
              <div
                className={`h-full ${sensorPercent < 70 ? "bg-[#D6A85B]" : "bg-[#89A97D]"}`}
                style={{ width: `${sensorPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Task Load Monitor */}
      <div className="p-3.5 space-y-3 border-b border-[#2A322D] font-mono text-[10px]">
        <div className="text-[10px] uppercase tracking-wider text-[#9AA39B] flex items-center justify-between">
          <span>SIMULATED TASK LOAD</span>
          <span
            className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
              taskLoadLevel === "LOW"
                ? "bg-[#89A97D]/10 text-[#89A97D] border border-[#89A97D]/30"
                : taskLoadLevel === "MEDIUM"
                ? "bg-[#8CA8B8]/10 text-[#8CA8B8] border border-[#8CA8B8]/30"
                : "bg-[#D6A85B]/10 text-[#D6A85B] border border-[#D6A85B]/30"
            }`}
          >
            {taskLoadLevel}
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#171C19] border border-[#2A322D] space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-[#687169]">
              <span>COMPLEXITY INDEX</span>
              <span className="text-[#E8ECE7] font-semibold">{taskLoadScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#1C231F] rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  taskLoadLevel === "LOW"
                    ? "bg-[#89A97D]"
                    : taskLoadLevel === "MEDIUM"
                    ? "bg-[#8CA8B8]"
                    : "bg-[#D6A85B]"
                }`}
                style={{ width: `${taskLoadScore}%` }}
              />
            </div>
          </div>

          <div className="pt-1 border-t border-[#2A322D]/60 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#687169]">ACTIVE CONTACTS:</span>
              <span className="text-[#E8ECE7] font-bold">{scenario.contactCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#687169]">UNRESOLVED:</span>
              <span className={unresolvedCount > 0 ? "text-[#D6A85B] font-semibold" : "text-[#89A97D]"}>
                {unresolvedCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#687169]">COMMITTED:</span>
              <span className="text-[#89A97D] font-semibold">{committedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Objective Card */}
      <div className="p-3.5 mt-auto bg-[#171C19]/40 font-mono">
        <div className="text-[10px] uppercase tracking-wider text-[#687169] mb-1">
          TRAINING OBJECTIVE
        </div>
        <div className="text-xs text-[#8CA8B8] font-bold leading-tight">
          {scenario.trainingObjective}
        </div>
        <p className="text-[10px] text-[#687169] mt-1.5 leading-normal">
          Evaluate isolated and simultaneous target vectors. Maintain rapid discrimination under RF noise.
        </p>
      </div>
    </div>
  );
}
