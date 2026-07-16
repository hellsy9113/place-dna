import {
  LocateFixed,
  LoaderCircle,
  MapPinned,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import type { SelectedMapLocation } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

type MapStatusPanelProps = {
  error: string | null;
  isLoading: boolean;
  isLocating?: boolean;
  locationError?: string | null;
  locationWarning?: string | null;
  selectedLocation: SelectedMapLocation | null;
};

function formatCoordinate(
  value: number,
  positiveDirection: "N" | "E",
  negativeDirection: "S" | "W",
) {
  const direction = value >= 0 ? positiveDirection : negativeDirection;
  return `${Math.abs(value).toFixed(4)}\u00B0${direction}`;
}

export function MapStatusPanel({
  error,
  isLoading,
  isLocating = false,
  locationError = null,
  locationWarning = null,
  selectedLocation,
}: MapStatusPanelProps) {
  const hasSelection = selectedLocation !== null;
  const hasLocationError = locationError !== null;
  const hasLocationWarning = locationWarning !== null;
  const isBusy = isLocating || isLoading;
  const hasError = hasLocationError || error !== null;
  const panelTone = hasError
    ? "secondary"
    : hasLocationWarning
      ? "tertiary"
      : hasSelection
        ? "quaternary"
        : "neutral";
  const badgeTone = hasLocationError
    ? "secondary"
    : hasLocationWarning
      ? "tertiary"
    : isBusy
      ? "accent"
      : hasSelection
        ? "quaternary"
        : "neutral";
  const statusLabel = isLocating
    ? "Finding location"
    : isLoading
      ? "Generating quick card"
      : hasLocationError
        ? "Location unavailable"
        : hasLocationWarning
          ? "Approximate location"
        : error
          ? "Could not generate card"
          : hasSelection
            ? "Location selected"
            : "Ready to click";
  const statusMessage = locationError
    ? locationError
    : locationWarning
      ? locationWarning
      : error
        ? error
        : isLocating
          ? "Finding your location..."
          : isLoading
            ? "Generating a quick card..."
            : hasSelection
              ? "Card ready. Click another point to reveal a new place."
              : "Click anywhere on the map in India to generate a PlaceDNA card.";

  return (
    <StickerCard tone={panelTone} hoverable={false}>
      <div
        role={hasError ? "alert" : "status"}
        aria-atomic="true"
        aria-live={hasError ? "assertive" : "polite"}
        className="card-body min-h-[9.5rem] gap-4 p-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <ShapeBadge
            tone={badgeTone}
            className="px-3 py-2 text-[0.64rem] tracking-[0.18em]"
            soft={!isBusy && !hasLocationError && !hasLocationWarning && !error}
          >
            {isLocating || isLoading ? (
              <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
            ) : hasLocationError || hasLocationWarning || error ? (
              <TriangleAlert className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            ) : hasSelection ? (
              <LocateFixed className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <Sparkles className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {statusLabel}
          </ShapeBadge>
        </div>

        {selectedLocation ? (
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--placedna-muted-foreground)]">
            <MapPinned className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.5} />
            {formatCoordinate(selectedLocation.lat, "N", "S")},{" "}
            {formatCoordinate(selectedLocation.lon, "E", "W")}
          </p>
        ) : null}

        <p className="text-sm font-medium leading-6 text-[color:var(--placedna-muted-foreground)]">
          {statusMessage}
        </p>
      </div>
    </StickerCard>
  );
}
