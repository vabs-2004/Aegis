"use client";

import React from "react";
import { AppShell } from "@/components/shell/AppShell";

export default function InstructorPage() {
  return (
    <AppShell activeSessionId="INSTRUCTOR">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0B0E0D] font-mono">
        <div className="bg-[#111614] border border-[#2A322D] p-5 rounded">
          <div className="text-[10px] uppercase tracking-wider text-[#687169]">
            DSSC SUPERVISORY CONSOLE {'//'} FLIGHT WING
          </div>
          <h1 className="text-xl font-bold text-[#E8ECE7] mt-1">INSTRUCTOR DASHBOARD</h1>
          <p className="text-xs text-[#9AA39B] mt-0.5 font-sans">
            Aggregate squadron readiness statistics, curriculum adaptation oversight, and intervention logs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#111614] border border-[#2A322D] rounded">
            <span className="text-[10px] text-[#687169] uppercase">ACTIVE OPERATORS</span>
            <span className="text-2xl font-bold text-[#E8ECE7] block mt-1">12</span>
            <span className="text-[10px] text-[#89A97D] mt-1 block">Squadron Alpha Nominal</span>
          </div>

          <div className="p-4 bg-[#111614] border border-[#2A322D] rounded">
            <span className="text-[10px] text-[#687169] uppercase">SESSIONS THIS WEEK</span>
            <span className="text-2xl font-bold text-[#8CA8B8] block mt-1">84</span>
            <span className="text-[10px] text-[#9AA39B] mt-1 block">Deterministic runs</span>
          </div>

          <div className="p-4 bg-[#111614] border border-[#2A322D] rounded">
            <span className="text-[10px] text-[#687169] uppercase">UNIT READINESS INDEX</span>
            <span className="text-2xl font-bold text-[#89A97D] block mt-1">82%</span>
            <span className="text-[10px] text-[#89A97D] mt-1 block">+4.2% vs last cycle</span>
          </div>

          <div className="p-4 bg-[#111614] border border-[#2A322D] rounded">
            <span className="text-[10px] text-[#687169] uppercase">OPERATORS NEEDING FOCUS</span>
            <span className="text-2xl font-bold text-[#D6A85B] block mt-1">03</span>
            <span className="text-[10px] text-[#D6A85B] mt-1 block">Multi-contact saturation</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
