import { MousePointerClick } from "lucide-react";

import { ShapeBadge } from "@/components/ui/ShapeBadge";

export function MapClickHint() {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-xs">
      <div className="rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-white/92 px-4 py-3 shadow-pop">
        <ShapeBadge tone="accent" className="px-3 py-2 text-[0.62rem] tracking-[0.18em]">
          <MousePointerClick className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
          Click anywhere
        </ShapeBadge>
        <p className="mt-3 text-sm font-semibold text-[color:var(--placedna-ink)]">
          Click anywhere to generate a card.
        </p>
      </div>
    </div>
  );
}
