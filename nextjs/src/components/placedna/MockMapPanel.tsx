import { LocateFixed, MapPinned, Radar } from "lucide-react";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

const mapPoints = [
  { left: "14%", top: "24%", size: "0.6rem", color: "#8B5CF6" },
  { left: "25%", top: "62%", size: "0.5rem", color: "#34D399" },
  { left: "36%", top: "38%", size: "0.45rem", color: "#F472B6" },
  { left: "49%", top: "68%", size: "0.55rem", color: "#FBBF24" },
  { left: "61%", top: "26%", size: "0.44rem", color: "#8B5CF6" },
  { left: "69%", top: "52%", size: "0.52rem", color: "#34D399" },
  { left: "82%", top: "30%", size: "0.46rem", color: "#F472B6" },
];

export function MockMapPanel() {
  return (
    <StickerCard hoverable={false} tone="quaternary" className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <ShapeBadge tone="quaternary" className="px-3 py-3 text-[0.66rem] tracking-[0.22em]">
          <Radar className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
          Map scan
        </ShapeBadge>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)]">
          28.6129N / 77.2295E
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[2rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] p-4 sm:p-5">
        <div className="bg-dot-grid absolute inset-0 opacity-70" />
        <div className="absolute right-6 top-5 rounded-full border-2 border-[color:var(--placedna-ink)] bg-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)]">
          Clicked location
        </div>

        <div className="relative mt-7 h-[320px] overflow-hidden rounded-[1.75rem] border-2 border-[color:var(--placedna-ink)] bg-white">
          <div className="bg-dot-grid absolute inset-0 opacity-50" />
          <div className="absolute inset-y-8 left-[16%] w-4 rounded-full bg-[color:var(--placedna-tertiary)]/55" />
          <div className="absolute inset-y-4 left-[45%] w-3 rounded-full bg-[color:var(--placedna-quaternary)]/55" />
          <div className="absolute inset-y-10 right-[18%] w-4 rounded-full bg-[color:var(--placedna-secondary)]/50" />

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 640 360"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M32 86C88 126 126 32 178 68C226 100 280 40 344 90C408 140 452 92 508 108C560 124 600 84 628 102"
              stroke="#8B5CF6"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M42 212C110 252 188 172 252 210C302 240 338 184 398 212C456 238 520 188 606 226"
              stroke="#34D399"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M84 310C166 256 220 326 308 288C380 256 446 324 560 276"
              stroke="#F472B6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="18 16"
            />
            <path
              d="M110 60C160 38 206 126 274 108C340 90 370 30 446 56C510 78 540 126 594 102"
              stroke="#FBBF24"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="8 10"
            />
          </svg>

          {mapPoints.map((point) => (
            <span
              key={`${point.left}-${point.top}`}
              className="absolute rounded-full border-2 border-[color:var(--placedna-ink)]"
              style={{
                left: point.left,
                top: point.top,
                width: point.size,
                height: point.size,
                backgroundColor: point.color,
              }}
            />
          ))}

          <ShapeBadge
            tone="tertiary"
            className="absolute left-[10%] top-[14%] px-3 py-1 text-[0.62rem] tracking-[0.18em]"
          >
            Green corridor
          </ShapeBadge>
          <ShapeBadge
            tone="secondary"
            className="absolute right-[7%] top-[20%] px-3 py-1 text-[0.62rem] tracking-[0.18em]"
          >
            Heritage zone
          </ShapeBadge>
          <ShapeBadge
            tone="accent"
            className="absolute left-[12%] bottom-[16%] px-3 py-1 text-[0.62rem] tracking-[0.18em]"
          >
            Route network
          </ShapeBadge>

          <div className="absolute left-[56%] top-[44%]">
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(52,211,153,0.55)] bg-[rgba(52,211,153,0.18)]" />
            <span className="absolute left-1/2 top-1/2 h-[7.5rem] w-[7.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(251,191,36,0.35)]" />
            <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(139,92,246,0.25)]" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary)] text-[color:var(--placedna-ink)] shadow-pop">
              <LocateFixed className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-white/90 px-4 py-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)]">
                Clicked location
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--placedna-ink)]">
                India Gate district
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)]">
              <MapPinned className="h-3.5 w-3.5" strokeWidth={2.5} />
              28.6129N / 77.2295E
            </span>
          </div>
        </div>
      </div>
    </StickerCard>
  );
}
