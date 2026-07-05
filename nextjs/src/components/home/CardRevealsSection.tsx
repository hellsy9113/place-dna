import { iconToneClasses } from "@/lib/design";
import { revealCards } from "@/data/homepage";

import { SectionShell } from "../layout/SectionShell";
import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

export function CardRevealsSection() {
  return (
    <SectionShell
      id="card-dna"
      eyebrow="Card DNA"
      title="What the card reveals"
      description="Every card turns spatial signals into a compact, readable identity for the clicked place."
      tone="secondary"
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {revealCards.map((item) => {
          const Icon = item.icon;

          return (
            <StickerCard key={item.title} tone={item.tone} className="pt-6">
              <div className="card-body p-5">
                <div
                  className={`absolute left-5 top-0 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 ${iconToneClasses[item.tone]} wiggle-hover`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <ShapeBadge tone={item.tone} soft className="w-fit px-3 py-2 text-[0.64rem] tracking-[0.2em]">
                  {item.label}
                </ShapeBadge>
                <h3 className="font-display mt-5 text-xl font-extrabold text-[color:var(--placedna-ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--placedna-muted-foreground)]">
                  {item.description}
                </p>
              </div>
            </StickerCard>
          );
        })}
      </div>
    </SectionShell>
  );
}
