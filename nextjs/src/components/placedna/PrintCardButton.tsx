"use client";

import { Printer } from "lucide-react";

export function PrintCardButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn no-print inline-flex items-center justify-center gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent)] px-5 font-bold text-white shadow-[4px_4px_0_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1E293B]"
    >
      <Printer className="h-4 w-4" strokeWidth={2.5} />
      <span>Print Card</span>
    </button>
  );
}
