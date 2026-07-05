import { rarityToneMap } from "@/lib/design";
import type { Rarity } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";

type RarityBadgeProps = {
  rarity: Rarity;
  className?: string;
};

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  return (
    <ShapeBadge tone={rarityToneMap[rarity]} className={className}>
      <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--placedna-ink)]" />
      {rarity}
    </ShapeBadge>
  );
}
