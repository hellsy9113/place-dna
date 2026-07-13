import { statFillClasses } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { PlaceStat, StatTone } from "@/types/placedna";

type PlaceStatMeterProps = PlaceStat;

const labelDotClasses: Record<StatTone, string> = {
  neutral: "bg-[color:var(--placedna-muted-foreground)]",
  success: "bg-[color:var(--placedna-quaternary)]",
  info: "bg-[color:var(--placedna-accent)]",
  secondary: "bg-[color:var(--placedna-secondary)]",
  warning: "bg-[color:var(--placedna-tertiary)]",
  error: "bg-[color:var(--placedna-foreground)]",
};

export function PlaceStatMeter({
  label,
  value,
  tone = "neutral",
}: PlaceStatMeterProps) {
  const normalizedValue = Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : 0;
  const displayValue = Math.round(normalizedValue);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={displayValue}
    >
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)] print:mb-1 print:text-[0.56rem]">
        <span className="flex items-center gap-2 print:gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "h-2.5 w-2.5 rounded-full print:h-2 print:w-2",
              labelDotClasses[tone],
            )}
          />
          {label}
        </span>
        <span className="text-[color:var(--placedna-ink)]">{displayValue}/100</span>
      </div>
      <div className="h-4 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-muted)] p-0.5 print:h-3 print:border-[1.5px]">
        <div
          className={cn("h-full rounded-full", statFillClasses[tone])}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
