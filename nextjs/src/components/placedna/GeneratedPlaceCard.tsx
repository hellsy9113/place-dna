import { Globe2, Landmark, LoaderCircle, MapPinned, TriangleAlert } from "lucide-react";

import { rarityToneMap } from "@/lib/design";
import type { PlaceDNAResponse } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";
import { LandmarkImage } from "./LandmarkImage";
import { PlaceStatMeter } from "./PlaceStatMeter";
import { PlaceTraitList } from "./PlaceTraitList";
import { RarityBadge } from "./RarityBadge";

type GeneratedPlaceCardProps = {
  data: PlaceDNAResponse | null;
  isLoading: boolean;
  error: string | null;
};

const statMeta = [
  { key: "green_cover", label: "Green Cover", tone: "success" },
  { key: "population_pressure", label: "Population Pressure", tone: "secondary" },
  { key: "built_up_density", label: "Built-up Density", tone: "secondary" },
  { key: "water_access", label: "Water Access", tone: "info" },
  { key: "connectivity", label: "Connectivity", tone: "info" },
  { key: "liveability", label: "Liveability", tone: "warning" },
] as const;

export function GeneratedPlaceCard({
  data,
  isLoading,
  error,
}: GeneratedPlaceCardProps) {
  if (isLoading) {
    return (
      <StickerCard tone="accent" hoverable={false} className="print:rounded-[1rem]">
        <div className="card-body items-center justify-center gap-4 p-8 text-center print:gap-3 print:p-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent-soft)] shadow-pop">
            <LoaderCircle className="h-7 w-7 animate-spin" strokeWidth={2.5} />
          </span>
          <h3 className="font-display text-3xl font-extrabold text-[color:var(--placedna-ink)] print:text-2xl">
            Reading the place DNA...
          </h3>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--placedna-muted-foreground)] print:text-xs print:leading-5">
            Pulling real geospatial signals from the backend and turning them into
            a collectible location card.
          </p>
        </div>
      </StickerCard>
    );
  }

  if (error) {
    return (
      <StickerCard tone="secondary" hoverable={false} shadowColor="#F472B6" className="print:rounded-[1rem]">
        <div className="card-body gap-4 p-8 text-center print:gap-3 print:p-5">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary-soft)] shadow-pop">
            <TriangleAlert className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <h3 className="font-display text-3xl font-extrabold text-[color:var(--placedna-ink)] print:text-2xl">
            Could not generate card
          </h3>
          <p className="text-sm leading-7 text-[color:var(--placedna-muted-foreground)] print:text-xs print:leading-5">
            {error}
          </p>
          <p className="text-sm font-semibold text-[color:var(--placedna-ink)]">
            Try another location.
          </p>
        </div>
      </StickerCard>
    );
  }

  if (!data) {
    return (
      <StickerCard tone="neutral" hoverable={false} className="print:rounded-[1rem]">
        <div className="card-body gap-5 p-8 text-center print:gap-3 print:p-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-muted)] shadow-pop">
            <MapPinned className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <h3 className="font-display text-3xl font-extrabold text-[color:var(--placedna-ink)] print:text-2xl">
            No card generated yet
          </h3>
          <p className="max-w-sm text-sm leading-7 text-[color:var(--placedna-muted-foreground)] print:text-xs print:leading-5">
            Click a location on the map to reveal its DNA.
          </p>
        </div>
      </StickerCard>
    );
  }

  const tone = rarityToneMap[data.rarity];
  const landmarkImageUrl = data.landmark.image_url?.trim() || null;
  const landmarkDistanceLabel =
    data.landmark.distance_m === null
      ? "Distance unavailable"
      : `${Math.round(data.landmark.distance_m)}m away`;

  return (
    <StickerCard
      tone={tone}
      shadowColor="#F472B6"
      className="print:rounded-[1rem]"
    >
      <article className="card-body gap-5 p-5 print:gap-3 print:p-3.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <RarityBadge rarity={data.rarity} />
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[color:var(--placedna-muted-foreground)] print:mt-2 print:text-[0.55rem]">
              {data.place_name}
            </p>
          </div>
          <ShapeBadge tone="quaternary" soft className="px-3 py-2 text-[0.62rem] tracking-[0.18em] print:px-2 print:py-1 print:text-[0.5rem]">
            API card
          </ShapeBadge>
        </div>

        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.05em] text-[color:var(--placedna-ink)] print:text-[1.55rem] print:leading-tight">
            {data.title}
          </h2>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)] print:mt-1 print:text-[0.62rem]">
            {data.region_type}
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem_2rem_1.2rem_1.2rem] border-2 border-[color:var(--placedna-ink)] bg-[repeating-linear-gradient(135deg,#ede9fe_0_12px,#fdf2f8_12px_24px,#fffbeb_24px_36px)] p-4 print:rounded-[1.3rem_1.3rem_0.9rem_0.9rem] print:p-2.5">
          <LandmarkImage
            key={landmarkImageUrl ?? data.landmark.name}
            alt={`Landmark view of ${data.landmark.name}`}
            imageUrl={landmarkImageUrl}
            landmarkName={data.landmark.name}
            tone={tone}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:mt-2 print:gap-2">
            <div className="space-y-1">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)] print:text-[0.55rem]">
                Nearby landmark
              </p>
              <p className="text-sm font-semibold text-[color:var(--placedna-ink)] print:text-[0.68rem]">
                {data.landmark.name}
              </p>
            </div>
            <ShapeBadge tone="tertiary" soft className="px-3 py-2 text-[0.62rem] tracking-[0.18em] print:px-2 print:py-1 print:text-[0.5rem]">
              {landmarkDistanceLabel}
            </ShapeBadge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 print:gap-2">
          <div className="rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent-soft)] p-4 print:rounded-[0.95rem] print:p-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent)] text-white print:h-8 print:w-8">
              <Globe2 className="h-4 w-4 print:h-3.5 print:w-3.5" strokeWidth={2.5} />
            </span>
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)] print:mt-2 print:text-[0.55rem]">
              Region type
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--placedna-ink)] print:mt-1 print:text-[0.68rem]">
              {data.region_type}
            </p>
          </div>
          <div className="rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary-soft)] p-4 print:rounded-[0.95rem] print:p-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] text-[color:var(--placedna-ink)] print:h-8 print:w-8">
              <Landmark className="h-4 w-4 print:h-3.5 print:w-3.5" strokeWidth={2.5} />
            </span>
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)] print:mt-2 print:text-[0.55rem]">
              Place name
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--placedna-ink)] print:mt-1 print:text-[0.68rem]">
              {data.place_name}
            </p>
          </div>
        </div>

        <p className="text-sm leading-7 text-[color:var(--placedna-muted-foreground)] print:text-[0.7rem] print:leading-5">
          {data.description}
        </p>

        <ul className="space-y-3 print:space-y-2">
          {statMeta.map((stat) => (
            <li key={stat.key}>
              <PlaceStatMeter
                label={stat.label}
                value={data.stats[stat.key]}
                tone={stat.tone}
              />
            </li>
          ))}
        </ul>

        <div className="border-t-2 border-dashed border-[color:var(--placedna-border)] pt-4 print:pt-2.5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[color:var(--placedna-muted-foreground)] print:text-[0.55rem]">
            Traits
          </p>
          <div className="mt-3 print:mt-2">
            <PlaceTraitList traits={data.traits} />
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--placedna-muted-foreground)] sm:grid-cols-2 print:gap-2 print:rounded-[0.95rem] print:px-3 print:py-2 print:text-[0.58rem]">
          <span className="flex items-center gap-2 print:gap-1.5">
            <MapPinned className="h-3.5 w-3.5 print:h-3 print:w-3" strokeWidth={2.5} />
            {data.location.lat.toFixed(4)}, {data.location.lon.toFixed(4)}
          </span>
          <span className="text-[color:var(--placedna-ink)] sm:text-right">
            Radius {data.location.radius_m}m
          </span>
        </div>
      </article>
    </StickerCard>
  );
}
