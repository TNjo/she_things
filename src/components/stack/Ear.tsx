"use client";
import type { EarSpot, JewelArtSpec } from "@/lib/types";
import JewelArt from "../JewelArt";
import type { TryOnLook } from "./EarringVisual";

const toLook = (v: TryOnLook | JewelArtSpec): TryOnLook => ("art" in v ? v : { art: v });

export interface Slot {
  id: string;
  spot: EarSpot;
  label: string;
  x: number;
  y: number;
  size: number;
  /** where the round photo bubble sits (outside the ear) */
  pin: [number, number];
}

export const SLOTS: Slot[] = [
  { id: "helix-1", spot: "helix", label: "Upper helix", x: 222, y: 70, size: 54, pin: [272, 36] },
  { id: "helix-2", spot: "helix", label: "Helix", x: 262, y: 130, size: 54, pin: [306, 104] },
  { id: "conch", spot: "conch", label: "Conch", x: 190, y: 200, size: 70, pin: [304, 214] },
  { id: "tragus", spot: "tragus", label: "Tragus", x: 116, y: 222, size: 46, pin: [66, 188] },
  { id: "upper-lobe", spot: "upper-lobe", label: "Second lobe", x: 160, y: 318, size: 62, pin: [262, 330] },
  { id: "lobe", spot: "lobe", label: "First lobe", x: 132, y: 350, size: 96, pin: [70, 392] },
];

export const SKIN_TONES = [
  { name: "Porcelain", fill: "#F6D9C8", line: "#B98A74" },
  { name: "Honey", fill: "#E3B48E", line: "#9C6B48" },
  { name: "Caramel", fill: "#B98058", line: "#6F4529" },
  { name: "Cocoa", fill: "#7A4B33", line: "#3D2216" },
];

interface Props {
  tone?: (typeof SKIN_TONES)[number];
  /** drawn art spec, or a try-on look with an optional real cut-out PNG */
  placed?: Record<string, TryOnLook | JewelArtSpec | undefined>;
  active?: string | null;
  onSlot?: (slot: Slot) => void;
  className?: string;
}

/** Hand-drawn style ear with piercing hotspots */
export default function Ear({ tone = SKIN_TONES[1], placed = {}, active, onSlot, className }: Props) {
  return (
    <svg viewBox="30 0 320 440" className={className} role="group" aria-label="Ear piercing map">
      <defs>
        <radialGradient id="earShade" cx="0.55" cy="0.45" r="0.7">
          <stop offset="0.6" stopColor={tone.fill} />
          <stop offset="1" stopColor={tone.line} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      {/* outer ear */}
      <path
        d="M168 28 C 248 22, 300 88, 290 168 C 283 226, 246 252, 226 294 C 212 326, 214 362, 186 390 C 160 414, 110 410, 98 372 C 90 344, 112 322, 118 296 C 124 268, 96 246, 92 200 C 86 128, 98 34, 168 28 Z"
        fill="url(#earShade)"
        stroke={tone.line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* helix fold */}
      <path d="M150 56 C 220 46, 268 98, 262 160 C 257 210, 224 232, 206 268" fill="none" stroke={tone.line} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      {/* antihelix */}
      <path d="M150 96 C 200 88, 236 120, 230 168 C 226 196, 204 214, 186 222" fill="none" stroke={tone.line} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      {/* concha bowl */}
      <path d="M140 178 C 170 156, 214 176, 206 222 C 200 256, 160 262, 146 244" fill={tone.line} fillOpacity="0.14" stroke={tone.line} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      {/* tragus */}
      <path d="M124 206 C 106 212, 104 244, 126 252" fill="none" stroke={tone.line} strokeWidth="3" strokeLinecap="round" />
      {/* lobe crease */}
      <path d="M150 300 C 166 312, 170 330, 160 346" fill="none" stroke={tone.line} strokeWidth="2" strokeLinecap="round" opacity="0.35" />

      {SLOTS.map((s) => {
        const raw = placed[s.id];
        const look = raw ? toLook(raw) : undefined;
        const art = look?.art;
        const isActive = active === s.id;
        return (
          <g key={s.id}>
            {art ? (
              <g style={{ cursor: onSlot ? "pointer" : "default" }} onClick={() => onSlot?.(s)}>
                {look?.cutout ? (
                  <image href={look.cutout} x={s.x - s.size / 2} y={s.y - s.size * 0.12} width={s.size} height={s.size} preserveAspectRatio="xMidYMin meet" />
                ) : look?.photo ? (
                  <g>
                    <defs>
                      <clipPath id={`pin-${s.id}`}><circle cx={s.pin[0]} cy={s.pin[1]} r="24" /></clipPath>
                    </defs>
                    <line x1={s.x} y1={s.y} x2={s.pin[0]} y2={s.pin[1]} stroke="#141414" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx={s.x} cy={s.y} r="4.5" fill="#E9C46A" stroke="#141414" strokeWidth="1.2" />
                    <circle cx={s.pin[0]} cy={s.pin[1]} r="27" fill="#FFFFFF" stroke="#141414" strokeWidth="1.5" />
                    <image href={look.photo} x={s.pin[0] - 24} y={s.pin[1] - 24} width="48" height="48" preserveAspectRatio="xMidYMid slice" clipPath={`url(#pin-${s.id})`} />
                  </g>
                ) : (
                  <JewelArt art={{ ...art!, bg: undefined }} bare nested={{ x: s.x - s.size / 2, y: s.y - s.size * 0.22, size: s.size }} />
                )}
              </g>
            ) : null}
            {onSlot && (
              <g
                role="button"
                tabIndex={0}
                aria-label={`${s.label}${art ? " (filled)" : ""}`}
                onClick={() => onSlot(s)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSlot(s)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <circle cx={s.x} cy={s.y} r={art ? (look?.photo && !look.cutout ? 9 : s.size / 3) : 11} fill={isActive && !art ? "#BE185D" : art ? "transparent" : "#FFFFFF"} stroke={art ? (isActive ? "#BE185D" : "none") : "#1C1917"} strokeWidth="2" strokeDasharray={art ? "4 3" : "3 3"}>
                  {!art && <animate attributeName="r" values="9;12;9" dur="2s" repeatCount="indefinite" />}
                </circle>
                {!art && <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={isActive ? "#fff" : "#1C1917"} pointerEvents="none">+</text>}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
