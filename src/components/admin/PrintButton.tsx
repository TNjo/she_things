"use client";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print chip" aria-label="Print packing slip">
      <Printer className="h-4 w-4" /> Packing slip
    </button>
  );
}
