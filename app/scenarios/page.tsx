"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { SEEDED_SCENARIOS } from "@/lib/data/seeds";
import { Play } from "lucide-react";

export default function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState(SEEDED_SCENARIOS["SCN-008"]);

  return (
    <AppShell activeSessionId="STUDIO">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0B0E0D] font-mono">
        <div className="bg-[#111614] border border-[#2A322D] p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#687169]">
              CURRICULUM AUTHORING {'//'} SCENARIO REPOSITORY
            </div>
            <h1 className="text-xl font-bold text-[#E8ECE7] mt-1">SCENARIO STUDIO</h1>
            <p className="text-xs text-[#9AA39B] mt-0.5 font-sans">
              Inspect deterministic training configurations, synthesize threat profiles, and launch custom simulations.
            </p>
          </div>

          <Link
            href={`/train?scenario=${selectedScenario.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#8CA8B8] hover:bg-[#9CB8C8] text-[#0B0E0D] font-bold text-xs tracking-wider uppercase transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH {selectedScenario.id}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(SEEDED_SCENARIOS).map((scn) => (
            <div
              key={scn.id}
              onClick={() => setSelectedScenario(scn)}
              className={`p-4 rounded border transition-all cursor-pointer ${
                selectedScenario.id === scn.id
                  ? "bg-[#171C19] border-[#8CA8B8]"
                  : "bg-[#111614] border-[#2A322D] hover:border-[#39433C]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#8CA8B8]">{scn.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C231F] border border-[#2A322D] text-[#D6A85B]">
                  DIFF {scn.difficulty}
                </span>
              </div>
              <div className="text-sm font-bold text-[#E8ECE7]">{scn.name}</div>
              <div className="text-[11px] text-[#9AA39B] mt-1">
                {scn.environment} • {scn.terrain} • {scn.contactCount} CONTACTS
              </div>
              <p className="text-[10px] text-[#687169] mt-2 leading-relaxed">
                {scn.rationale || scn.trainingObjective}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
