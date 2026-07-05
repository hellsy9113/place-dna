import { iconToneClasses } from "@/lib/design";
import { cn } from "@/lib/utils";
import { rarityTiers } from "@/data/homepage";

import { SectionShell } from "../layout/SectionShell";
import { RarityBadge } from "../placedna/RarityBadge";
import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

export function RaritySystemSection() {
  return (
    <SectionShell
      id="rarity"
      eyebrow="Rarity system"
      title="Five playful rarity tiers for real-world places"
      description="Rarity highlights whether a place feels ordinary, standout, iconic, or under pressure, while always keeping the language readable and inviting."
      tone="accent"
    >
      <div className="grid gap-5 xl:grid-cols-5">
        {rarityTiers.map((tier) => {
          const Icon = tier.icon;

          return (
            <StickerCard
              key={tier.name}
              tone={tier.tone}
              className={cn(
                "overflow-visible",
                tier.spotlight && "xl:-translate-y-4 xl:scale-[1.04]",
              )}
            >
              <div className="card-body p-5">
                {tier.spotlight ? (
                  <ShapeBadge
                    tone="tertiary"
                    className="absolute -right-2 -top-4 rotate-[12deg] px-3 py-2 text-[0.62rem] tracking-[0.2em] shadow-pop"
                  >
                    Star tier
                  </ShapeBadge>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <RarityBadge rarity={tier.name} />
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconToneClasses[tier.tone]} wiggle-hover`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </div>
                <p className="font-display mt-5 text-2xl font-extrabold text-[color:var(--placedna-ink)]">
                  {tier.description}
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--placedna-muted-foreground)]">
                  {tier.signal}
                </p>
              </div>
            </StickerCard>
          );
        })}
      </div>
    </SectionShell>
  );
}
