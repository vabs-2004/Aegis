"use client";

import React from "react";
import { AppShell } from "@/components/shell/AppShell";

export default function TraineesPage() {
  const traineeRoster = [
    { code: "ARJUN-04", name: "Operator Arjun S.", score: 87, trend: "+6", gap: "Multi-contact", status: "NEEDS_FOCUS" },
    { code: "RAVI-09", name: "Operator Ravi K.", score: 72, trend: "-4", gap: "Detection latency", status: "NEEDS_FOCUS" },
    { code: "MEERA-12", name: "Operator Meera P.", score: 91, trend: "+3", gap: "Night conditions", status: "NOMINAL" },
    { code: "KABIR-17", name: "Operator Kabir M.", score: 84, trend: "+1", gap: "Classification noise", status: "NOMINAL" },
  ];

  return (
    <AppShell activeSessionId="ROSTER">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0B0E0D] font-mono">
        <div className="bg-[#111614] border border-[#2A322D] p-5 rounded">
          <div className="text-[10px] uppercase tracking-wider text-[#687169]">
            UNIT EVALUATION {'//'} OPERATOR DOSSIER
          </div>
          <h1 className="text-xl font-bold text-[#E8ECE7] mt-1">TRAINEE PERFORMANCE</h1>
          <p className="text-xs text-[#9AA39B] mt-0.5 font-sans">
            Comprehensive operator proficiency matrix, training streak audits, and gap diagnosis.
          </p>
        </div>

        <div className="bg-[#111614] border border-[#2A322D] rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171C19] border-b border-[#2A322D] text-[#687169] text-[10px] uppercase">
              <tr>
                <th className="p-3">OPERATOR CODE</th>
                <th className="p-3">NAME</th>
                <th className="p-3">READINESS SCORE</th>
                <th className="p-3">TREND</th>
                <th className="p-3">PRIMARY SKILL GAP</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A322D]">
              {traineeRoster.map((t) => (
                <tr key={t.code} className="hover:bg-[#171C19]/50 transition-colors">
                  <td className="p-3 font-bold text-[#8CA8B8]">{t.code}</td>
                  <td className="p-3 text-[#E8ECE7]">{t.name}</td>
                  <td className="p-3 font-bold text-[#E8ECE7]">{t.score} / 100</td>
                  <td className="p-3 text-[#89A97D] font-semibold">{t.trend}</td>
                  <td className="p-3 text-[#D6A85B]">{t.gap}</td>
                  <td className="p-3">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase ${
                        t.status === "NEEDS_FOCUS"
                          ? "bg-[#D6A85B]/10 text-[#D6A85B] border border-[#D6A85B]/30"
                          : "bg-[#89A97D]/10 text-[#89A97D] border border-[#89A97D]/30"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
