import { iconToneClasses } from "@/lib/design";
import { workflowSteps } from "@/data/homepage";

import { SectionShell } from "../layout/SectionShell";
import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

export function HowItWorksSection() {
  return (
    <SectionShell
      id="how-it-works"
      eyebrow="How it works"
      title="Map click in. Collectible geospatial card out."
      description="PlaceDNA keeps the workflow simple: choose a place, analyze layered signals, and reveal a card that feels fun enough to keep."
      tone="quaternary"
    >
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-[10%] right-[10%] top-10 hidden h-24 w-[80%] text-[color:var(--placedna-border)] lg:block"
          viewBox="0 0 1000 120"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 80C150 20 230 20 340 72C450 120 560 22 680 54C780 82 872 98 980 40"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="12 12"
            strokeLinecap="round"
          />
        </svg>

        <div className="grid gap-6 lg:grid-cols-3">
          {workflowSteps.map((step) => {
            const Icon = step.icon;

            return (
              <StickerCard key={step.title} tone={step.tone} className="pt-6">
                <div className="card-body p-6">
                  <div
                    className={`absolute left-5 top-0 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 ${iconToneClasses[step.tone]} wiggle-hover`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <ShapeBadge tone={step.tone} soft className="px-3 py-2 text-[0.64rem] tracking-[0.2em]">
                      {step.label}
                    </ShapeBadge>
                  </div>
                  <h3 className="font-display mt-6 text-2xl font-extrabold text-[color:var(--placedna-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--placedna-muted-foreground)]">
                    {step.description}
                  </p>
                </div>
              </StickerCard>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
