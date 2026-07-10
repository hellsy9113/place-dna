"use client";

import { useRef, useState } from "react";

import { fetchPlaceDNA } from "@/lib/api/placeDna";
import type { PlaceDNAResponse, SelectedMapLocation } from "@/types/placedna";

import { DownloadCardButton } from "../placedna/DownloadCardButton";
import { GeneratedPlaceCard } from "../placedna/GeneratedPlaceCard";
import { ShapeBadge } from "../ui/ShapeBadge";
import { MapStatusPanel } from "./MapStatusPanel";
import { PlaceMap } from "./PlaceMap";

const DEFAULT_RADIUS_M = 500;

export function MapDemoClient() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedMapLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<PlaceDNAResponse | null>(null);
  const requestIdRef = useRef(0);
  const hasDownloadableCard = card !== null && !isLoading && !error;

  async function handleLocationSelect(location: SelectedMapLocation) {
    setSelectedLocation(location);
    setIsLoading(true);
    setError(null);
    setCard(null);

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const result = await fetchPlaceDNA({
        lat: location.lat,
        lon: location.lon,
        radiusM: DEFAULT_RADIUS_M,
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      setCard(result);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to generate PlaceDNA card.",
      );
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }

  return (
    <section
      id="map-demo"
      className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,26rem)] lg:items-start">
        <div className="space-y-5">
          <div className="max-w-2xl space-y-3">
            <ShapeBadge tone="accent" className="px-3 py-2 text-[0.62rem] tracking-[0.2em]">
              Live map demo
            </ShapeBadge>
            <h1 className="font-display text-4xl font-extrabold tracking-[-0.05em] text-[color:var(--placedna-ink)] sm:text-5xl">
              Generate a PlaceDNA card
            </h1>
            <p className="text-base leading-7 text-[color:var(--placedna-muted-foreground)] sm:text-lg sm:leading-8">
              Click any point on the map to reveal its geospatial identity.
            </p>
          </div>

          <PlaceMap onLocationSelect={handleLocationSelect} />
          <MapStatusPanel
            selectedLocation={selectedLocation}
            isLoading={isLoading}
            error={error}
            radiusM={DEFAULT_RADIUS_M}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {hasDownloadableCard ? (
            <div className="flex justify-start lg:justify-end">
              <DownloadCardButton
                title={card?.title}
                placeName={card?.place_name}
              />
            </div>
          ) : null}

          <div
            id={hasDownloadableCard ? "download-card-area" : undefined}
            className="w-full lg:ml-auto lg:max-w-[26rem]"
          >
            <GeneratedPlaceCard
              data={card}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
