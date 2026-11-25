"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="font-hand text-[40px] text-cherry">oops</p>
        <h1 className="text-5xl md:text-6xl">Something <i>snapped.</i></h1>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          A clasp came loose on our side. Your bag is safe. Try again – if it keeps happening, message us on WhatsApp.
          {error.digest && <span className="mt-2 block font-mono text-xs">ref: {error.digest}</span>}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn-ink">Try again</button>
          <Link href="/" className="btn-ghost">Home</Link>
        </div>
      </div>
    </div>
  );
}
