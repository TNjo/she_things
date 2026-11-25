import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="She Things – home" className={`group inline-flex items-baseline gap-1 ${className}`}>
      <span className="font-display text-[28px] italic leading-none tracking-tight md:text-[32px]">she</span>
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 -translate-y-3 text-cherry transition-transform duration-500 group-hover:rotate-180" aria-hidden>
        <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor" />
      </svg>
      <span className="font-sans text-[15px] font-extrabold uppercase tracking-[0.18em]">things</span>
    </Link>
  );
}
