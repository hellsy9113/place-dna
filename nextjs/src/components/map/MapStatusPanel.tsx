import { LocateFixed, LoaderCircle, MapPinned, Sparkles, TriangleAlert } from "lucide-react";

import type { SelectedMapLocation } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

type MapStatusPanelProps = {
  error: string | null;
  isLoading: boolean;
  isLocating?: boolean;
  locationError?: string | null;
  radiusM?: number;
  selectedLocation: SelectedMapLocation | null;
};

export function MapStatusPanel({
  error,
  isLoading,
  isLocating = false,
  locationError = null,
  radiusM = 500,
  selectedLocation,
}: MapStatusPanelProps) {
  const hasSelection = selectedLocation !== null;
  const hasLocationError = locationError !== null;
  const isBusy = isLocating || isLoading;
  const panelTone = hasLocationError || error
    ? "secondary"
    : hasSelection
      ? "quaternary"
      : "neutral";
  const badgeTone = hasLocationError
    ? "secondary"
    : isBusy
      ? "accent"
      : hasSelection
        ? "quaternary"
        : "neutral";
  const statusLabel = isLocating
    ? "Finding location"
    : isLoading
      ? "Reading place DNA"
      : hasLocationError
        ? "Location unavailable"
        : error
          ? "Could not generate card"
          : hasSelection
            ? "Location selected"
            : "Ready to click";

  return (
    <StickerCard tone={panelTone} hoverable={false}>
      <div className="card-body gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <ShapeBadge
            tone={badgeTone}
            className="px-3 py-2 text-[0.64rem] tracking-[0.18em]"
            soft={!isBusy && !hasLocationError && !error}
          >
            {isLocating || isLoading ? (
              <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
            ) : hasLocationError || error ? (
              <TriangleAlert className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            ) : hasSelection ? (
              <LocateFixed className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <Sparkles className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {statusLabel}
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
            Start by clicking a point on the map or use your current browser
            location. We&apos;ll send that place to the backend and turn the
            response into a PlaceDNA card.
          </p>
        )}

        {locationError ? (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            {locationError}
          </p>
        ) : error ? (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            {error} Try another location.
          </p>
        ) : isLocating ? (
          <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
            Requesting your browser location and preparing the map view.
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
