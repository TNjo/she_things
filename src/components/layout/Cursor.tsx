"use client";
import { useEffect, useRef } from "react";

/** A little sparkle cursor for mouse users. Disabled on touch & reduced motion. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, big = false;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as HTMLElement | null;
      big = !!t?.closest("a,button,[role=button],input,select,textarea,label");
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px) scale(${big ? 1.8 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    const click = (e: MouseEvent) => burst(e.clientX, e.clientY, 6);
    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", move);
    window.addEventListener("click", click);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("click", click);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] hidden h-1.5 w-1.5 rounded-full bg-cherry [.has-cursor_&]:block" aria-hidden />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[100] -ml-4 -mt-4 hidden h-8 w-8 rounded-full border border-ink/60 transition-[scale] duration-200 [.has-cursor_&]:block" aria-hidden />
    </>
  );
}

/** Tiny star confetti – also used when something is added to the bag */
export function burst(x: number, y: number, count = 14) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#BE185D", "#B98A2E", "#F3D3DC", "#1C1917", "#F3E6CC"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const size = 6 + Math.random() * 8;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;z-index:101;pointer-events:none;background:${colors[i % colors.length]};clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)`;
    document.body.appendChild(el);
    const a = Math.random() * Math.PI * 2;
    const d = 30 + Math.random() * (count > 8 ? 90 : 30);
    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 20}px)) scale(0.2) rotate(${180 + Math.random() * 180}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).onfinish = () => el.remove();
  }
}
