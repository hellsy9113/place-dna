import { ArrowRight } from "lucide-react";

import { demoStages } from "@/data/homepage";

import { PopButton } from "../ui/PopButton";
import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

export function FinalCTASection() {
  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 pb-24 pt-20 lg:px-8">
      <StickerCard tone="tertiary" hoverable={false} className="overflow-visible">
        <div className="pointer-events-none absolute -left-4 -top-4 hidden h-16 w-16 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary)] shadow-pop lg:block" />
        <div className="pointer-events-none absolute -right-6 top-8 hidden h-8 w-24 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)] shadow-pop lg:block" />
        <div className="pattern-dots absolute -right-8 bottom-8 hidden h-28 w-28 rounded-full opacity-70 lg:block" />

        <div className="grid gap-10 px-8 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <ShapeBadge tone="secondary" className="px-4 py-4 text-[0.68rem] tracking-[0.24em]">
              Demo
            </ShapeBadge>
            <h2 className="font-display mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[color:var(--placedna-ink)] sm:text-5xl">
              Every place has a hidden identity.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--placedna-muted-foreground)]">
              Start with a point on the map. PlaceDNA turns it into a story, a
              score, and a collectible card.
            </p>
            <PopButton href="#demo-panel" size="lg" className="mt-8 pl-6 pr-3">
              <span>Open map demo</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[color:var(--placedna-accent)]">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </PopButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {demoStages.map((stage) => (
              <StickerCard
                key={stage.title}
                tone={stage.tone}
                shadowColor={stage.tone === "secondary" ? "#F472B6" : undefined}
              >
                <div className="p-5">
                  <ShapeBadge tone={stage.tone} soft className="px-3 py-2 text-[0.64rem] tracking-[0.2em]">
                    Stage
                  </ShapeBadge>
                  <p className="font-display mt-4 text-xl font-extrabold text-[color:var(--placedna-ink)]">
                    {stage.title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
                    {stage.description}
                  </p>
                </div>
              </StickerCard>
            ))}
          </div>
        </div>
      </StickerCard>
    </section>
  );
}
