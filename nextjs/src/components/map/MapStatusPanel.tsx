import { LocateFixed, LoaderCircle, MapPinned, Sparkles, TriangleAlert } from "lucide-react";

import type { SelectedMapLocation } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

type MapStatusPanelProps = {
  selectedLocation: SelectedMapLocation | null;
  isLoading: boolean;
  error: string | null;
  radiusM?: number;
};

export function MapStatusPanel({
  selectedLocation,
  isLoading,
  error,
  radiusM = 500,
}: MapStatusPanelProps) {
  const hasSelection = selectedLocation !== null;

  return (
    <StickerCard tone={error ? "secondary" : hasSelection ? "quaternary" : "neutral"} hoverable={false}>
      <div className="card-body gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <ShapeBadge
            tone={error ? "secondary" : isLoading ? "accent" : hasSelection ? "quaternary" : "neutral"}
            className="px-3 py-2 text-[0.64rem] tracking-[0.18em]"
            soft={!isLoading && !error}
          >
            {isLoading ? (
              <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
            ) : error ? (
              <TriangleAlert className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            ) : hasSelection ? (
              <LocateFixed className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <Sparkles className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {isLoading ? "Reading place DNA" : error ? "Could not generate card" : hasSelection ? "Location selected" : "Ready to click"}
          </ShapeBadge>
          <ShapeBadge tone="tertiary" soft className="px-3 py-2 text-[0.64rem] tracking-[0.18em]">
            Radius {radiusM}m
          </ShapeBadge>
        </div>

        {selectedLocation ? (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--placedna-ink)]">
            <MapPinned className="h-4 w-4" strokeWidth={2.5} />
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
          </p>
        ) : (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            Start by clicking a point on the map. We&apos;ll send that location to
            the backend and turn the response into a PlaceDNA card.
          </p>
        )}

        {error ? (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            {error} Try another location.
          </p>
        ) : isLoading ? (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            Checking the layers around your selected point and composing the card.
          </p>
        ) : hasSelection ? (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            The latest selected point is ready. Click somewhere else to generate a
            new card.
          </p>
        ) : null}
      </div>
    </StickerCard>
  );
}
