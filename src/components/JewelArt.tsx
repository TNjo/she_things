"use client";
import { useId } from "react";
import type { JewelArtSpec } from "@/lib/types";
import clsx from "clsx";

const METALS = {
  gold: ["#FFF3B8", "#E9C46A", "#B98A2E", "#7A5718"],
  silver: ["#FFFFFF", "#DDE1E7", "#A3AAB5", "#5F6672"],
  rose: ["#FFE4DA", "#E8AE9C", "#B9766A", "#7D4639"],
} as const;

interface Props {
  art: JewelArtSpec;
  className?: string;
  /** hide the coloured background card */
  bare?: boolean;
  /** gentle swing animation */
  sway?: boolean;
  title?: string;
  /** render as a nested <svg> inside another svg */
  nested?: { x: number; y: number; size: number };
}

export default function JewelArt({ art, className, bare, sway, title, nested }: Props) {
  const uid = useId().replace(/:/g, "");
  const m = METALS[art.metal];
  const gem = art.gem || "#BE185D";
  const metal = `url(#m${uid})`;
  const metalStroke = `url(#ms${uid})`;
  const gemFill = `url(#g${uid})`;
  const pearl = `url(#p${uid})`;

  return (
    <svg
      viewBox="0 0 200 200"
      className={nested ? className : clsx("block h-full w-full", className)}
      {...(nested ? { x: nested.x, y: nested.y, width: nested.size, height: nested.size, overflow: "visible" } : {})}
      role="img"
      aria-label={title ?? `${art.metal} ${art.kind}`}
    >
      <defs>
        <linearGradient id={`m${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m[0]} />
          <stop offset="0.35" stopColor={m[1]} />
          <stop offset="0.7" stopColor={m[2]} />
          <stop offset="1" stopColor={m[3]} />
        </linearGradient>
        <linearGradient id={`ms${uid}`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor={m[2]} />
          <stop offset="0.3" stopColor={m[0]} />
          <stop offset="0.55" stopColor={m[1]} />
          <stop offset="0.8" stopColor={m[3]} />
          <stop offset="1" stopColor={m[1]} />
        </linearGradient>
        <radialGradient id={`g${uid}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.25" stopColor={gem} />
          <stop offset="1" stopColor={gem} stopOpacity="1" />
        </radialGradient>
        <radialGradient id={`p${uid}`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor={art.gem || "#F4EEE6"} />
          <stop offset="0.85" stopColor="#D9CBBE" />
          <stop offset="1" stopColor="#B7A595" />
        </radialGradient>
        <filter id={`s${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#1C1917" floodOpacity="0.22" />
        </filter>
      </defs>

      {!bare && <rect width="200" height="200" fill={art.bg || "#F8E6EA"} />}

      <g filter={`url(#s${uid})`} style={sway ? { transformOrigin: "100px 40px", animation: "sway 3.4s ease-in-out infinite" } : undefined}>
        <Shape kind={art.kind} metal={metal} metalStroke={metalStroke} gemFill={gemFill} pearl={pearl} gem={gem} dark={m[3]} />
      </g>
      <Glint x={art.kind === "hoop" ? 62 : 128} y={art.kind === "hoop" ? 70 : 62} />
    </svg>
  );
}

function Glint({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 9} L${x + 2} ${y - 2} L${x + 9} ${y} L${x + 2} ${y + 2} L${x} ${y + 9} L${x - 2} ${y + 2} L${x - 9} ${y} L${x - 2} ${y - 2} Z`}
      fill="#fff"
      opacity="0.9"
    >
      <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" />
    </path>
  );
}

const Hook = ({ stroke }: { stroke: string }) => (
  <path d="M100 30 C 100 14, 120 14, 120 28 C 120 38, 108 40, 100 46" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
);

function Shape({ kind, metal, metalStroke, gemFill, pearl, gem, dark }: { kind: JewelArtSpec["kind"]; metal: string; metalStroke: string; gemFill: string; pearl: string; gem: string; dark: string }) {
  switch (kind) {
    case "hoop":
      return (
        <g>
          <circle cx="100" cy="108" r="54" fill="none" stroke={metalStroke} strokeWidth="20" />
          <circle cx="100" cy="108" r="54" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="40 300" strokeDashoffset="-20" />
          <rect x="96" y="44" width="8" height="12" rx="3" fill={metal} />
        </g>
      );
    case "huggie":
      return (
        <g>
          <circle cx="100" cy="104" r="34" fill="none" stroke={metalStroke} strokeWidth="12" />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = Math.PI * (0.15 + i * 0.175);
            return <circle key={i} cx={100 + 34 * Math.cos(a)} cy={104 + 34 * Math.sin(a)} r="4.2" fill="#fff" stroke={dark} strokeWidth="0.8" />;
          })}
        </g>
      );
    case "drop":
      return (
        <g>
          <Hook stroke={metalStroke} />
          <circle cx="100" cy="52" r="6" fill={metal} />
          <path d="M100 62 C 124 96, 132 120, 132 136 A 32 32 0 0 1 68 136 C 68 120, 76 96, 100 62 Z" fill={metal} />
          <path d="M100 72 C 119 100, 125 120, 125 135 A 25 25 0 0 1 75 135 C 75 120, 81 100, 100 72 Z" fill={gemFill} />
          <path d="M100 72 L 88 128 L 100 158 L 112 128 Z" fill="#fff" opacity="0.18" />
          <path d="M84 120 L 100 158 L 116 120" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
        </g>
      );
    case "stud":
      return (
        <g>
          <circle cx="100" cy="100" r="34" fill={gem === "#BE185D" ? metal : gemFill} />
          <circle cx="100" cy="100" r="34" fill="none" stroke={metalStroke} strokeWidth="5" />
          <ellipse cx="88" cy="86" rx="10" ry="6" fill="#fff" opacity="0.7" transform="rotate(-30 88 86)" />
        </g>
      );
    case "pearl-drop":
      return (
        <g>
          <Hook stroke={metalStroke} />
          <circle cx="100" cy="54" r="7" fill={metal} />
          <rect x="98" y="58" width="4" height="22" fill={metal} />
          <ellipse cx="100" cy="118" rx="34" ry="40" fill={pearl} />
          <ellipse cx="88" cy="100" rx="9" ry="13" fill="#fff" opacity="0.6" transform="rotate(-20 88 100)" />
        </g>
      );
    case "chandelier":
      return (
        <g>
          <circle cx="100" cy="40" r="12" fill={metal} />
          <circle cx="100" cy="40" r="5" fill={gemFill} />
          <path d="M60 116 C 60 76, 140 76, 140 116 Z" fill={metal} />
          <path d="M70 108 C 74 86, 126 86, 130 108" fill="none" stroke={dark} strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 4" />
          <rect x="96" y="52" width="8" height="26" fill={metal} />
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 64 + i * 9;
            const len = 14 + (i % 2) * 8;
            return (
              <g key={i}>
                <line x1={x} y1="116" x2={x} y2={116 + len} stroke={metalStroke} strokeWidth="1.6" />
                <circle cx={x} cy={118 + len} r="3.6" fill={i % 2 ? gemFill : metal} />
              </g>
            );
          })}
        </g>
      );
    case "cuff":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M64 70 A 46 46 0 1 0 140 74" stroke={metalStroke} strokeWidth="11" />
          <path d="M74 84 A 32 32 0 1 0 128 86" stroke={metalStroke} strokeWidth="7" />
        </g>
      );
    case "star":
      return (
        <g>
          {[[72, 140, 14], [92, 112, 11], [110, 88, 9], [126, 66, 7.5], [138, 48, 6]].map(([x, y, r], i) => (
            <g key={i}>
              <path d={star(x, y, r, r * 0.45)} fill={metal} />
              <circle cx={x} cy={y} r={r * 0.32} fill="#fff" />
            </g>
          ))}
          <path d="M72 140 Q 100 110, 138 48" stroke={metalStroke} strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      );
    case "heart":
      return (
        <g>
          <path d="M100 150 C 40 110, 52 56, 100 82 C 148 56, 160 110, 100 150 Z" fill={gemFill} />
          <path d="M100 150 C 40 110, 52 56, 100 82 C 148 56, 160 110, 100 150 Z" fill="none" stroke={metalStroke} strokeWidth="6" strokeLinejoin="round" />
          <ellipse cx="80" cy="92" rx="10" ry="6" fill="#fff" opacity="0.55" transform="rotate(-35 80 92)" />
          <path d="M100 82 C 104 66, 116 54, 132 50" stroke={metalStroke} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "flower":
      return (
        <g>
          <Hook stroke={metalStroke} />
          <line x1="100" y1="46" x2="100" y2="72" stroke={metalStroke} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx="100" cy="88" rx="15" ry="26" fill={gem === "#FFFFFF" ? "#FFFDF8" : gemFill} stroke={metalStroke} strokeWidth="2.5" transform={`rotate(${i * 72} 100 114)`} />
          ))}
          <circle cx="100" cy="114" r="12" fill={metal} />
        </g>
      );
    case "chain":
      return (
        <g>
          <path d="M20 40 C 40 150, 160 150, 180 40" fill="none" stroke={metalStroke} strokeWidth="4" />
          {Array.from({ length: 15 }).map((_, i) => {
            const t = (i + 1) / 16;
            const x = (1 - t) ** 3 * 20 + 3 * (1 - t) ** 2 * t * 40 + 3 * (1 - t) * t * t * 160 + t ** 3 * 180;
            const y = (1 - t) ** 3 * 40 + 3 * (1 - t) ** 2 * t * 150 + 3 * (1 - t) * t * t * 150 + t ** 3 * 40;
            return <circle key={i} cx={x} cy={y} r={gem === "#BE185D" ? 3 : 8} fill={gem === "#BE185D" ? metal : pearl} />;
          })}
        </g>
      );
    case "pendant":
      return (
        <g>
          <path d="M30 30 C 50 120, 150 120, 170 30" fill="none" stroke={metalStroke} strokeWidth="2.5" />
          <circle cx="100" cy="118" r="5" fill="none" stroke={metalStroke} strokeWidth="3" />
          <circle cx="100" cy="146" r="24" fill={metal} />
          <text x="100" y="155" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="26" fill={dark} opacity="0.75">S</text>
        </g>
      );
    case "ring":
      return (
        <g>
          <ellipse cx="100" cy="124" rx="50" ry="22" fill="none" stroke={metalStroke} strokeWidth="13" />
          <path d="M50 124 C 50 108, 150 108, 150 124" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="3" />
          <path d="M78 98 L 122 98 L 112 80 L 88 80 Z" fill={metal} />
          <path d="M84 96 L 116 96 L 108 72 L 92 72 Z" fill={gemFill} />
        </g>
      );
    case "bangle":
      return (
        <g>
          <ellipse cx="100" cy="110" rx="66" ry="40" fill="none" stroke={metalStroke} strokeWidth="11" strokeDasharray="370 40" />
          <circle cx="146" cy="80" r="7" fill={metal} />
          <circle cx="158" cy="94" r="7" fill={metal} />
        </g>
      );
    case "anklet":
      return (
        <g>
          <path d="M20 90 C 60 150, 140 150, 180 90" fill="none" stroke={metalStroke} strokeWidth="3" strokeDasharray="6 3" />
          {[0.25, 0.4, 0.55, 0.7].map((t, i) => {
            const x = 20 + t * 160;
            const y = 90 + Math.sin(t * Math.PI) * 45;
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={x} y2={y + 10} stroke={metalStroke} strokeWidth="1.5" />
                <path d={`M${x - 7} ${y + 22} C ${x - 7} ${y + 8}, ${x + 7} ${y + 8}, ${x + 7} ${y + 22} Z`} fill={metal} />
                <circle cx={x} cy={y + 23} r="2" fill={dark} />
              </g>
            );
          })}
        </g>
      );
  }
}

function star(cx: number, cy: number, R: number, r: number) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    d += `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `;
  }
  return d + "Z";
}
