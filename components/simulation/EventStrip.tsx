"use client";

import React from "react";
import { SessionEvent } from "@/lib/types";
import { Clock } from "lucide-react";

interface EventStripProps {
  events: SessionEvent[];
}

export function EventStrip({ events }: EventStripProps) {
  const displayEvents = events.slice(-5).reverse();

  return (
    <div className="h-10 flex-shrink-0 bg-[#111614] border-t border-[#2A322D] px-4 flex items-center justify-between select-none font-mono text-[11px] overflow-hidden">
      <div className="flex items-center gap-2 text-[#687169] mr-4 flex-shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#8CA8B8]" />
        <span className="font-semibold text-[#9AA39B]">EVENT STRIP:</span>
      </div>

      <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {displayEvents.length === 0 ? (
          <span className="text-[#687169] text-[10px]">
            Awaiting trainee interactions... Click active contact to initiate observation window.
          </span>
        ) : (
          displayEvents.map((evt) => {
            const isCorrect = evt.correctness === "CORRECT";
            const isAttention = evt.correctness === "ATTENTION";

            return (
              <div
                key={evt.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#171C19] border border-[#2A322D] flex-shrink-0"
              >
                <span className="text-[#687169] text-[10px]">{evt.timeFormatted}</span>
                <span className="text-[#8CA8B8] font-semibold">{evt.contactId}</span>
                <span className="text-[#E8ECE7] truncate max-w-[200px]">{evt.action}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    isCorrect
                      ? "bg-[#89A97D]/10 text-[#89A97D] border border-[#89A97D]/30"
                      : isAttention
                      ? "bg-[#D6A85B]/10 text-[#D6A85B] border border-[#D6A85B]/30"
                      : "bg-[#C96862]/10 text-[#C96862] border border-[#C96862]/30"
                  }`}
                >
                  {evt.correctness}
                </span>
                <span className="text-[#687169] text-[9px]">{(evt.latencyMs / 1000).toFixed(1)}s</span>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden lg:flex items-center gap-2 pl-4 text-[10px] text-[#687169] flex-shrink-0 border-l border-[#2A322D]">
        <span>TOTAL EVENTS:</span>
        <span className="text-[#E8ECE7] font-semibold">{events.length}</span>
      </div>
    </div>
  );
}
