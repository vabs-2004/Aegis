"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { SEEDED_TRAINEE } from "@/lib/data/seeds";
import { 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  ChevronRight
} from "lucide-react";

export default function CommandCenter() {
  const trainee = SEEDED_TRAINEE;

  const competencies = [
    { name: "DETECTION LATENCY", score: trainee.competencyProfile.detection, benchmark: 90, status: "NOMINAL" },
    { name: "CLASSIFICATION ACCURACY", score: trainee.competencyProfile.classification, benchmark: 85, status: "NOMINAL" },
    { name: "DECISION DISCIPLINE", score: trainee.competencyProfile.decision, benchmark: 85, status: "NOMINAL" },
    { name: "RESPONSE TIMING", score: trainee.competencyProfile.responseTiming, benchmark: 80, status: "ACCEPTABLE" },
    { name: "MULTI-CONTACT DISCRIMINATION", score: trainee.competencyProfile.multiContact, benchmark: 80, status: "CRITICAL_GAP", isWeakness: true },
    { name: "DEGRADED SENSING ADAPTATION", score: trainee.competencyProfile.degradedSensor, benchmark: 75, status: "DEGRADED_GAP", isWeakness: true },
    { name: "NIGHT ENVIRONMENT", score: trainee.competencyProfile.night, benchmark: 80, status: "ACCEPTABLE" },
  ];

  const recentTimeline = [
    { time: "11:29", text: "Session 08 completed (Night / Urban)", score: "87/100", type: "COMPLETE" },
    { time: "11:22", text: "Multi-contact stress event evaluated", score: "63% accuracy", type: "ATTENTION" },
    { time: "11:17", text: "Adaptive scenario SCN-008 generated", score: "Diff 07", type: "SYSTEM" },
    { time: "11:11", text: "Sensor-degraded training run initiated", score: "Active", type: "START" },
  ];

  return (
    <AppShell activeSessionId="COMMAND">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0B0E0D] font-sans">
        {/* Header Strip */}
        <div className="bg-[#111614] border border-[#2A322D] p-5 rounded">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#687169] flex items-center gap-2">
                <span>HEADQUARTERS DSSC {'//'} TRAINING COMMAND</span>
                <span>•</span>
                <span className="text-[#8CA8B8]">EVALUATION CONSOLE</span>
              </div>
              <h1 className="text-xl font-bold font-mono text-[#E8ECE7] mt-1 tracking-wide">
                TRAINING COMMAND CENTER
              </h1>
              <p className="text-xs text-[#9AA39B] mt-0.5">
                Monitor readiness, review performance diagnostics, and deploy targeted adaptive training runs.
              </p>
            </div>

            {/* Compact Trainee Readiness Strip */}
            <div className="flex flex-wrap items-center gap-3 bg-[#171C19] border border-[#2A322D] p-2.5 px-4 rounded font-mono text-xs">
              <div className="pr-4 border-r border-[#2A322D]">
                <span className="text-[9px] text-[#687169] uppercase block">ACTIVE TRAINEE</span>
                <span className="font-bold text-[#E8ECE7]">{trainee.code}</span>
              </div>
              <div className="pr-4 border-r border-[#2A322D]">
                <span className="text-[9px] text-[#687169] uppercase block">LAST SESSION</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-[#89A97D]">{trainee.lastSessionScore}</span>
                  <span className="text-[10px] text-[#687169]">/ 100</span>
                </div>
              </div>
              <div className="pr-4 border-r border-[#2A322D]">
                <span className="text-[9px] text-[#687169] uppercase block">PRIMARY GAP</span>
                <span className="font-bold text-[#D6A85B]">MULTI-CONTACT</span>
              </div>
              <div>
                <span className="text-[9px] text-[#687169] uppercase block">TRAINING STREAK</span>
                <span className="font-bold text-[#8CA8B8]">{trainee.streak.toString().padStart(2, "0")} SESSIONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY CALL TO ACTION: Next Recommended Training Banner */}
        <div className="bg-[#171C19] border border-[#8CA8B8]/40 p-5 rounded font-mono relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[9px] rounded bg-[#8CA8B8]/20 text-[#8CA8B8] border border-[#8CA8B8]/40 font-bold uppercase tracking-wider">
                  SYSTEM RECOMMENDED
                </span>
                <span className="text-xs text-[#9AA39B] uppercase font-bold">
                  NIGHT / URBAN / DEGRADED SENSORS
                </span>
              </div>

              <div className="text-base font-bold text-[#E8ECE7] tracking-wide">
                SCN-008: MULTI-CONTACT DISCRIMINATION (DIFFICULTY 07)
              </div>

              <p className="text-xs text-[#9AA39B] leading-relaxed">
                <strong className="text-[#D6A85B]">Targeted Rationale:</strong> Performance declined by 31 points when simultaneous contacts appeared under degraded sensor conditions. This training run focuses on concurrent vector separation.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/train?scenario=SCN-008"
                className="flex items-center gap-2 px-6 py-3 rounded bg-[#8CA8B8] hover:bg-[#9CB8C8] text-[#0B0E0D] font-bold text-xs tracking-wider uppercase transition-all shadow cursor-pointer"
              >
                <span>START RECOMMENDED TRAINING</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Competency Matrix (8 cols) */}
          <div className="lg:col-span-8 bg-[#111614] border border-[#2A322D] p-5 rounded space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#687169] block">
                  TRAINEE COMPETENCY RADAR
                </span>
                <span className="text-xs font-bold text-[#E8ECE7]">
                  OPERATOR COMPETENCY MATRIX {'//'} ARJUN-04
                </span>
              </div>
              <span className="text-[10px] text-[#9AA39B] px-2 py-0.5 rounded bg-[#171C19] border border-[#2A322D]">
                UPDATED 11:29 UTC
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {competencies.map((comp) => (
                <div key={comp.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={comp.isWeakness ? "text-[#D6A85B] font-bold" : "text-[#9AA39B]"}>
                        {comp.name}
                      </span>
                      {comp.isWeakness && (
                        <span className="px-1 text-[8px] rounded bg-[#D6A85B]/10 text-[#D6A85B] border border-[#D6A85B]/30 font-bold uppercase">
                          GAP FOCUS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#687169]">BENCHMARK: {comp.benchmark}%</span>
                      <span className="font-bold text-[#E8ECE7] w-8 text-right">{comp.score}%</span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-[#1C231F] rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        comp.isWeakness
                          ? "bg-[#D6A85B]"
                          : comp.score >= 85
                          ? "bg-[#89A97D]"
                          : "bg-[#8CA8B8]"
                      }`}
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#171C19] border border-[#2A322D] rounded text-[11px] text-[#9AA39B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D6A85B]" />
                <span>Primary deficiency intersection: Concurrent Multi-Contact + Degraded RF Sensing.</span>
              </div>
              <span className="text-[#8CA8B8] font-bold">NET GAP: -31 PTS</span>
            </div>
          </div>

          {/* Right: Operational Activity Timeline (4 cols) */}
          <div className="lg:col-span-4 bg-[#111614] border border-[#2A322D] p-5 rounded flex flex-col font-mono">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#687169] block">
                  TRAINING AUDIT
                </span>
                <span className="text-xs font-bold text-[#E8ECE7]">RECENT EVENT STREAM</span>
              </div>
              <Clock className="w-3.5 h-3.5 text-[#8CA8B8]" />
            </div>

            <div className="space-y-3 flex-1">
              {recentTimeline.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#171C19] border border-[#2A322D] text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#687169] text-[10px]">{item.time} HRS</span>
                    <span
                      className={`text-[9px] px-1 rounded font-bold uppercase ${
                        item.type === "COMPLETE"
                          ? "text-[#89A97D]"
                          : item.type === "ATTENTION"
                          ? "text-[#D6A85B]"
                          : "text-[#8CA8B8]"
                      }`}
                    >
                      {item.score}
                    </span>
                  </div>
                  <div className="text-[#E8ECE7] font-medium leading-snug">{item.text}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2A322D]">
              <Link
                href="/aar/SESSION-08"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-[#171C19] hover:bg-[#1C231F] text-[#8CA8B8] border border-[#2A322D] text-xs transition-colors"
              >
                <span>REVIEW LAST SESSION AAR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
