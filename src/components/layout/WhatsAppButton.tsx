"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const path = usePathname();
  const num = (process.env.NEXT_PUBLIC_WHATSAPP || "94770000000").replace(/\D/g, "");
  if (path.startsWith("/checkout")) return null;
  return (
    <a
      href={`https://wa.me/${num}?text=${encodeURIComponent("Hi She Things! I have a question")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-ink/10 bg-sage px-3 py-3 shadow-soft transition-all hover:pr-5 md:bottom-6 md:right-6"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[120px]">Ask us anything</span>
    </a>
  );
}
