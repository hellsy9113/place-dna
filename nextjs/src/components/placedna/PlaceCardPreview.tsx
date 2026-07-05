import { Globe2, Landmark, MapPinned, Sparkles, Star } from "lucide-react";

import { iconToneClasses, rarityToneMap, stripeToneClasses } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { PlaceCardPreviewData } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";
import { PlaceStatMeter } from "./PlaceStatMeter";
import { PlaceTraitList } from "./PlaceTraitList";
import { StickerCard } from "../ui/StickerCard";
import { RarityBadge } from "./RarityBadge";

type PlaceCardPreviewProps = {
  data: PlaceCardPreviewData;
  className?: string;
  id?: string;
};

export function PlaceCardPreview({
  data,
  className,
  id,
}: PlaceCardPreviewProps) {
  const tone = rarityToneMap[data.rarity];
  const liveability = data.stats.find((stat) => stat.label === "Liveability")?.value;

  return (
    <StickerCard tone={tone} className={cn("bg-white", className)} shadowColor="#F472B6">
      <article id={id} className="card-body gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <RarityBadge rarity={data.rarity} />
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[color:var(--placedna-muted-foreground)]">
              Collectible place card
            </p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] shadow-pop">
            <Star className="h-5 w-5" strokeWidth={2.5} />
          </span>
        </div>

        <div>
          <h3 className="font-display text-3xl font-extrabold tracking-[-0.05em] text-[color:var(--placedna-ink)]">
            {data.title}
          </h3>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)]">
            {data.regionType}
          </p>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem_2rem_1.2rem_1.2rem] border-2 border-[color:var(--placedna-ink)] p-4",
            stripeToneClasses[tone],
          )}
        >
          <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] shadow-pop" />
          <div className="absolute -left-2 bottom-6 h-10 w-10 rotate-12 rounded-[12px] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary)] shadow-pop" />
          <div className="relative rounded-[1.6rem_1.6rem_1rem_1rem] border-2 border-[color:var(--placedna-ink)] bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(244,114,182,0.16),rgba(251,191,36,0.22),rgba(255,255,255,0.8))] p-4">
            <ShapeBadge tone={tone} className="px-3 py-2 text-[0.62rem] tracking-[0.18em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
              Landmark artwork
            </ShapeBadge>
            <div className="mt-12 flex items-end gap-2">
              <span className="h-12 w-6 rounded-t-full bg-white/60" />
              <span className="h-18 w-8 rounded-t-full bg-white/85" />
              <span className="h-10 w-5 rounded-t-full bg-white/58" />
              <span className="h-14 w-7 rounded-t-full bg-white/72" />
              <span className="h-20 w-9 rounded-t-full bg-white/92" />
              <span className="h-11 w-5 rounded-t-full bg-white/55" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[color:var(--placedna-ink)]">
              {data.landmarkName}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent-soft)] p-4">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconToneClasses.accent}`}
            >
              <Globe2 className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)]">
              Region type
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--placedna-ink)]">
              {data.regionType}
            </p>
          </div>
          <div className="rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary-soft)] p-4">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconToneClasses.tertiary}`}
            >
              <Landmark className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)]">
              Nearby landmark
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--placedna-ink)]">
              {data.landmarkName}
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {data.stats.map((stat) => (
            <li key={stat.label}>
              <PlaceStatMeter {...stat} />
            </li>
          ))}
        </ul>

        <div className="border-t-2 border-dashed border-[color:var(--placedna-border)] pt-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[color:var(--placedna-muted-foreground)]">
            Traits
          </p>
          <div className="mt-3">
            <PlaceTraitList traits={data.traits} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)]">
          <span className="flex items-center gap-2">
            <MapPinned className="h-3.5 w-3.5" strokeWidth={2.5} />
            {data.coordinates}
          </span>
          <span className="text-[color:var(--placedna-ink)]">
            Liveability {liveability ?? "--"}
          </span>
        </div>
      </article>
    </StickerCard>
  );
}
