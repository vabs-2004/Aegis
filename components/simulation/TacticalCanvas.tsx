"use client";

import React from "react";
import { ComputedContactState } from "@/lib/simulation/trajectory";
import { Contact } from "@/lib/types";

interface TacticalCanvasProps {
  contacts: ComputedContactState[];
  contactMetadata: Record<string, Contact>;
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  sensorQuality: number; // 0.0 - 1.0
  visibility: number; // 0.0 - 1.0
  elapsedSeconds: number;
}

export function TacticalCanvas({
  contacts,
  contactMetadata,
  selectedContactId,
  onSelectContact,
  sensorQuality,
  visibility,
  elapsedSeconds,
}: TacticalCanvasProps) {
  // Canvas coordinate system: 800 x 600
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;

  // Radar sweep angle based on elapsedSeconds
  const sweepAngle = (elapsedSeconds * 45) % 360;

  // Dynamic atmospheric opacity based on optical visibility
  const contourOpacity = Math.max(0.15, Math.min(0.5, visibility * 0.7));

  return (
    <div className="relative w-full h-full bg-[#0B0E0D] select-none overflow-hidden flex items-center justify-center border border-[#2A322D]">
      {/* Background Topographic Contours & Coordinate Grid */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full object-contain cursor-crosshair"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="tac-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1C231F" strokeWidth="0.75" />
          </pattern>
          {/* Sensor Sweep Gradient */}
          <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#89A97D" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#89A97D" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base Grid */}
        <rect width={width} height={height} fill="url(#tac-grid)" />

        {/* Fictional Urban Footprints in SE Sector */}
        <g opacity="0.22" stroke="#2A322D" strokeWidth="1" fill="#171C19">
          <rect x="520" y="380" width="45" height="30" />
          <rect x="580" y="370" width="60" height="45" />
          <rect x="530" y="430" width="80" height="35" />
          <rect x="630" y="440" width="50" height="50" />
          <rect x="490" y="480" width="70" height="40" />
          <rect x="580" y="500" width="55" height="30" />
          <text x="520" y="365" fill="#687169" fontSize="9" fontFamily="monospace">
            URBAN CLUSTER B-7
          </text>
        </g>

        {/* Fictional Topographic Contours (NW Sector) */}
        <g fill="none" stroke="#2A322D" strokeWidth="1" opacity={contourOpacity}>
          <path d="M 50 120 Q 180 80 260 180 T 400 210" />
          <path d="M 70 170 Q 190 130 280 220 T 430 250" />
          <path d="M 90 220 Q 210 180 300 260 T 460 290" />
          <text x="60" y="115" fill="#687169" fontSize="9" fontFamily="monospace">
            CONTOUR +820m
          </text>
        </g>

        {/* Concentric Radar Range Rings */}
        <g stroke="#2A322D" strokeWidth="1" fill="none">
          <circle cx={centerX} cy={centerY} r="80" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r="160" />
          <circle cx={centerX} cy={centerY} r="240" strokeDasharray="4 4" />
          <circle cx={centerX} cy={centerY} r="280" />
        </g>

        {/* Range Labels */}
        <text x={centerX + 85} y={centerY - 6} fill="#687169" fontSize="9" fontFamily="monospace">
          2.5 KM
        </text>
        <text x={centerX + 165} y={centerY - 6} fill="#687169" fontSize="9" fontFamily="monospace">
          5.0 KM
        </text>
        <text x={centerX + 245} y={centerY - 6} fill="#687169" fontSize="9" fontFamily="monospace">
          7.5 KM
        </text>
        <text x={centerX + 285} y={centerY - 6} fill="#687169" fontSize="9" fontFamily="monospace">
          10.0 KM
        </text>

        {/* Azimuth Crosshairs */}
        <line x1={centerX} y1={20} x2={centerX} y2={height - 20} stroke="#2A322D" strokeWidth="1" strokeDasharray="2 4" />
        <line x1={20} y1={centerY} x2={width - 20} y2={centerY} stroke="#2A322D" strokeWidth="1" strokeDasharray="2 4" />

        {/* Degree Markers */}
        <text x={centerX - 10} y="30" fill="#687169" fontSize="9" fontFamily="monospace">000°</text>
        <text x={width - 40} y={centerY + 3} fill="#687169" fontSize="9" fontFamily="monospace">090°</text>
        <text x={centerX - 10} y={height - 25} fill="#687169" fontSize="9" fontFamily="monospace">180°</text>
        <text x="25" y={centerY + 3} fill="#687169" fontSize="9" fontFamily="monospace">270°</text>

        {/* Sensor Aperture Cone (affected by sensorQuality) */}
        <g transform={`rotate(${sweepAngle} ${centerX} ${centerY})`}>
          <path
            d={`M ${centerX} ${centerY} L ${centerX + 280} ${centerY - 80} A 280 280 0 0 1 ${centerX + 280} ${centerY + 80} Z`}
            fill="url(#sweep-grad)"
          />
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + 280}
            y2={centerY}
            stroke="#89A97D"
            strokeWidth="1.2"
            opacity="0.6"
          />
        </g>

        {/* Protected Sector Origin Symbol */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <polygon points="0,-9 8,7 -8,7" fill="#1C231F" stroke="#8CA8B8" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="2.5" fill="#8CA8B8" />
          <text x="12" y="4" fill="#8CA8B8" fontSize="10" fontFamily="monospace" fontWeight="600">
            BASE REF
          </text>
        </g>

        {/* Contacts Layer */}
        {contacts.map((contact) => {
          if (!contact.visible) return null;

          const cx = (contact.x / 100) * width;
          const cy = (contact.y / 100) * height;
          const isSelected = selectedContactId === contact.id;
          const meta = contactMetadata[contact.id];

          return (
            <g
              key={contact.id}
              className="cursor-pointer transition-transform duration-100"
              onClick={() => onSelectContact(contact.id)}
            >
              {/* Breadcrumb Trajectory History */}
              {contact.breadcrumbs.length > 1 && (
                <polyline
                  points={contact.breadcrumbs
                    .map((p) => `${(p.x / 100) * width},${(p.y / 100) * height}`)
                    .join(" ")}
                  fill="none"
                  stroke={isSelected ? "#8CA8B8" : "#9AA39B"}
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity={isSelected ? "0.6" : "0.35"}
                />
              )}

              {/* Uncertainty Ring */}
              <circle
                cx={cx}
                cy={cy}
                r={contact.uncertaintyRadius}
                fill="none"
                stroke={
                  isSelected
                    ? "#8CA8B8"
                    : contact.isFriendly
                    ? "#89A97D"
                    : "#D6A85B"
                }
                strokeWidth={isSelected ? "1.5" : "1"}
                strokeDasharray={
                  contact.visibilityState === "INTERMITTENT"
                    ? "4 5"
                    : contact.visibilityState === "DEGRADED"
                    ? "3 3"
                    : "2 2"
                }
                opacity={
                  isSelected
                    ? "0.85"
                    : contact.visibilityState === "INTERMITTENT"
                    ? "0.3"
                    : "0.55"
                }
                className="origin-center"
              />

              {/* Velocity Vector Arrow */}
              {(() => {
                const rad = (contact.heading * Math.PI) / 180;
                const vx = cx + Math.cos(rad) * 18;
                const vy = cy + Math.sin(rad) * 18;
                return (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={vx}
                    y2={vy}
                    stroke={isSelected ? "#8CA8B8" : "#9AA39B"}
                    strokeWidth="1.2"
                  />
                );
              })()}

              {/* Contact Marker Symbology */}
              {contact.isFriendly ? (
                // Friendly: Hollow Diamond
                <polygon
                  points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${cy + 6} ${cx - 6},${cy}`}
                  fill="#111614"
                  stroke="#89A97D"
                  strokeWidth="1.5"
                />
              ) : (
                // Threat / Unknown: Hollow Circle
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#111614"
                  stroke={isSelected ? "#8CA8B8" : "#D6A85B"}
                  strokeWidth="1.5"
                />
              )}

              {/* Selected Focus Brackets */}
              {isSelected && (
                <g stroke="#8CA8B8" strokeWidth="1.5" fill="none">
                  {/* Top-left */}
                  <path d={`M ${cx - 14} ${cy - 8} L ${cx - 14} ${cy - 14} L ${cx - 8} ${cy - 14}`} />
                  {/* Top-right */}
                  <path d={`M ${cx + 8} ${cy - 14} L ${cx + 14} ${cy - 14} L ${cx + 14} ${cy - 8}`} />
                  {/* Bottom-left */}
                  <path d={`M ${cx - 14} ${cy + 8} L ${cx - 14} ${cy + 14} L ${cx - 8} ${cy + 14}`} />
                  {/* Bottom-right */}
                  <path d={`M ${cx + 8} ${cy + 14} L ${cx + 14} ${cy + 14} L ${cx + 14} ${cy + 8}`} />
                </g>
              )}

              {/* Contact ID & Telemetry Label */}
              <text
                x={cx + 12}
                y={cy - 4}
                fill={isSelected ? "#8CA8B8" : "#E8ECE7"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {contact.id}
              </text>
              <text
                x={cx + 12}
                y={cy + 8}
                fill={contact.visibilityState === "INTERMITTENT" ? "#D6A85B" : "#9AA39B"}
                fontSize="8"
                fontFamily="monospace"
              >
                {typeof contact.detectionConfidence === "number"
                  ? `${contact.detectionConfidence}% CONF`
                  : meta
                  ? `${meta.detectionConfidence}% CONF`
                  : "ACQUIRING"}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Canvas Overlay Header (Coordinate / Sector Telemetry) */}
      <div className="absolute top-2 left-3 pointer-events-none flex items-center gap-3 font-mono text-[10px] text-[#687169] bg-[#111614]/85 px-2.5 py-1 border border-[#2A322D] rounded">
        <span>GRID: 24N-88E</span>
        <span>•</span>
        <span className="text-[#89A97D]">RADAR: COHERENT 9.4 GHz</span>
        <span>•</span>
        <span>R-RANGE: 10 KM</span>
      </div>

      <div className="absolute top-2 right-3 pointer-events-none flex items-center gap-2 font-mono text-[10px] bg-[#111614]/85 px-2.5 py-1 border border-[#2A322D] rounded">
        <span className="text-[#9AA39B]">SENSOR QUALITY:</span>
        <span className={sensorQuality < 0.7 ? "text-[#D6A85B] font-semibold" : "text-[#89A97D] font-semibold"}>
          {Math.round(sensorQuality * 100)}%
        </span>
      </div>
    </div>
  );
}
