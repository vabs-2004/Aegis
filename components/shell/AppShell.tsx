"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  Activity, 
  Crosshair, 
  FileText, 
  Layers, 
  Users, 
  Database, 
  Radio, 
  Clock, 
  Cpu
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  activeSessionId?: string;
  isSimActive?: boolean;
}

export function AppShell({ children, activeSessionId = "SESSION-08", isSimActive = false }: AppShellProps) {
  const pathname = usePathname();
  const [timeString, setTimeString] = useState<string>("00:00:00 UTC");
  const [dbStatus] = useState<string>("DB: NOMINAL");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toISOString().substring(11, 19) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "COMMAND", href: "/", icon: Activity, description: "Readiness & Overview" },
    { name: "TRAIN", href: "/train", icon: Crosshair, description: "Live C-UAS Simulator" },
    { name: "AAR", href: activeSessionId ? `/aar/${activeSessionId}` : "/aar/SESSION-08", icon: FileText, description: "After-Action Review" },
    { name: "SCENARIOS", href: "/scenarios", icon: Layers, description: "Scenario Studio" },
    { name: "TRAINEES", href: "/trainees", icon: Users, description: "Unit Competency" },
    { name: "INSTRUCTOR", href: "/instructor", icon: Radio, description: "Instructor Terminal" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E0D] text-[#E8ECE7] font-sans">
      {/* Left Navigation Rail (220px) */}
      <aside className="w-[224px] flex-shrink-0 flex flex-col border-r border-[#2A322D] bg-[#111614] select-none z-20">
        {/* Brand / Logo */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-[#2A322D] bg-[#111614]">
          <div className="w-6 h-6 rounded flex items-center justify-center border border-[#39433C] bg-[#171C19] text-[#8CA8B8]">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wider text-[#E8ECE7] flex items-center gap-1.5">
              <span>AEGIS</span>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-[#1C231F] text-[#8CA8B8] border border-[#2A322D] rounded">v1.0</span>
            </div>
            <div className="text-[9px] uppercase tracking-wider text-[#687169] font-mono">
              C-UAS DECISION TRAINER
            </div>
          </div>
        </div>

        {/* System Mode Notice */}
        <div className="px-3 py-2 bg-[#171C19]/60 border-b border-[#2A322D] flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#9AA39B]">SYS ENV:</span>
          <span className="text-[#89A97D] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#89A97D] animate-pulse"></span>
            SYNTHETIC
          </span>
        </div>

        {/* Main Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#687169]">
            OPERATIONAL WORKSPACE
          </div>
          {navItems.map((item) => {
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors relative ${
                  isActive
                    ? "bg-[#1C231F] text-[#E8ECE7] border-l-2 border-[#8CA8B8]"
                    : "text-[#9AA39B] hover:text-[#E8ECE7] hover:bg-[#171C19]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#8CA8B8]" : "text-[#687169] group-hover:text-[#9AA39B]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-mono tracking-wide">{item.name}</div>
                  <div className="text-[10px] text-[#687169] truncate font-sans">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Active Trainee Quick Badge */}
        <div className="p-3 border-t border-[#2A322D] bg-[#111614] space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#687169]">
            ACTIVE OPERATOR
          </div>
          <div className="p-2 rounded bg-[#171C19] border border-[#2A322D] text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-[#E8ECE7]">ARJUN-04</span>
              <span className="text-[10px] text-[#89A97D]">STREAK: 06</span>
            </div>
            <div className="text-[10px] text-[#9AA39B] mt-0.5 font-mono">
              BASE: 87/100 | GAP: MULTI-UAS
            </div>
          </div>
        </div>

        {/* Rail Footer Status */}
        <div className="p-2.5 border-t border-[#2A322D] bg-[#0B0E0D] text-[10px] font-mono text-[#687169] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#9AA39B]">
              <Database className="w-3 h-3 text-[#8CA8B8]" />
              {dbStatus}
            </span>
            <span className="text-[#89A97D]">ONLINE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#9AA39B]">
              <Cpu className="w-3 h-3 text-[#D6A85B]" />
              GROQ LLM
            </span>
            <span className="text-[#89A97D]">READY</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Operational Bar (56px) */}
        <header className="h-14 flex-shrink-0 border-b border-[#2A322D] bg-[#111614] px-5 flex items-center justify-between select-none z-10">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs font-mono font-semibold tracking-wider text-[#E8ECE7]">
                AEGIS COMMAND {'//'} DSSC SIMULATION
              </div>
              <div className="text-[10px] font-mono text-[#687169] flex items-center gap-2">
                <span>SECTOR NORTH [SYNTHETIC]</span>
                <span>•</span>
                <span className="text-[#8CA8B8]">ELEV 820m</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#2A322D]">
              <span className="text-[10px] font-mono text-[#687169]">RUN:</span>
              <span className="px-1.5 py-0.5 rounded bg-[#171C19] border border-[#2A322D] text-[11px] font-mono text-[#E8ECE7]">
                {activeSessionId}
              </span>
              {isSimActive && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#89A97D]/10 border border-[#89A97D]/40 text-[10px] font-mono text-[#89A97D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89A97D] animate-ping"></span>
                  LIVE ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#171C19] border border-[#2A322D] text-[#9AA39B]">
              <Clock className="w-3.5 h-3.5 text-[#8CA8B8]" />
              <span className="text-[#E8ECE7]">{timeString}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#687169]">SECURITY:</span>
              <span className="px-2 py-0.5 rounded bg-[#171C19] border border-[#2A322D] text-[10px] text-[#8CA8B8]">
                SYNTHETIC-RESTRICTED
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[#0B0E0D] relative flex flex-col">
          {children}
        </main>

        {/* Institutional Bottom Status Footer (28px) */}
        <footer className="h-7 flex-shrink-0 border-t border-[#2A322D] bg-[#111614] px-4 flex items-center justify-between text-[10px] font-mono text-[#687169] select-none z-10">
          <div className="flex items-center gap-3">
            <span className="text-[#9AA39B] font-semibold">AEGIS C-UAS SIMULATOR</span>
            <span>|</span>
            <span>SYNTHETIC ENVIRONMENT</span>
            <span>|</span>
            <span className="text-[#89A97D]">ENGINE NOMINAL (60 FPS)</span>
          </div>

          <div className="flex items-center gap-4">
            <span>DETERMINISTIC RUBRIC: ACTIVE</span>
            <span>|</span>
            <span className="text-[#8CA8B8]">AI DECISION ASSIST: READY</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
