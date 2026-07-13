import { MousePointerClick } from "lucide-react";

import { ShapeBadge } from "@/components/ui/ShapeBadge";

export function MapClickHint() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] sm:left-4 sm:top-4">
      <div className="rounded-[1.15rem] border-2 border-[color:var(--placedna-ink)] bg-white/92 px-3 py-2.5 shadow-pop sm:rounded-[1.35rem] sm:px-4 sm:py-3">
        <ShapeBadge tone="quaternary" className="px-3 py-2 text-[0.58rem] tracking-[0.16em] sm:text-[0.62rem]">
          Satellite view
        </ShapeBadge>
        <p
          id="map-instructions"
          className="mt-2 flex items-center gap-2 text-xs font-semibold text-[color:var(--placedna-ink)] sm:mt-3 sm:text-sm"
        >
          <MousePointerClick className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
          Tap anywhere to reveal place DNA.
        </p>
      </div>
    </div>
  );
}
