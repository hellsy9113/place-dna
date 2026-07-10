"use client";

import { useRef, useState } from "react";
import { LoaderCircle, LocateFixed } from "lucide-react";

import { fetchPlaceDNA } from "@/lib/api/placeDna";
import type {
  MapFocusRequest,
  PlaceDNAResponse,
  SelectedMapLocation,
} from "@/types/placedna";

import { DownloadCardButton } from "../placedna/DownloadCardButton";
import { GeneratedPlaceCard } from "../placedna/GeneratedPlaceCard";
import { ShapeBadge } from "../ui/ShapeBadge";
import { MapStatusPanel } from "./MapStatusPanel";
import { PlaceMap } from "./PlaceMap";

const DEFAULT_RADIUS_M = 500;
const APPROXIMATE_LOCATION_THRESHOLD_M = 10000;
const UNSUPPORTED_LOCATION_MESSAGE =
  "This location is outside the currently supported PlaceDNA coverage area.";
const UNSUPPORTED_LOCATION_FRIENDLY_MESSAGE =
  "This location is not supported yet. Try another nearby land location.";

export function MapDemoClient() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedMapLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [card, setCard] = useState<PlaceDNAResponse | null>(null);
  const [focusRequest, setFocusRequest] = useState<MapFocusRequest | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const focusRequestIdRef = useRef(0);
  const hasDownloadableCard = card !== null && !isLoading && !error;

  function focusMapOnLocation(location: SelectedMapLocation) {
    const focusId = focusRequestIdRef.current + 1;
    focusRequestIdRef.current = focusId;

    setFocusRequest({
      id: focusId,
      location,
    });
  }

  function getApiErrorMessage(caughtError: unknown): string {
    if (caughtError instanceof Error) {
      if (caughtError.message === UNSUPPORTED_LOCATION_MESSAGE) {
        return UNSUPPORTED_LOCATION_FRIENDLY_MESSAGE;
      }
      if (caughtError.message.trim()) {
        return caughtError.message;
      }
    }

    return "Could not generate this PlaceDNA card. Try another location.";
  }

  function getApproximateLocationWarning(accuracyM: number) {
    const accuracyKm = accuracyM >= 1000
      ? `${(accuracyM / 1000).toFixed(1)} km`
      : `${Math.round(accuracyM)} m`;
    return `Your browser returned an approximate location (accuracy about ${accuracyKm}). You can click the map manually for better accuracy.`;
  }

  async function generateCardForCoordinates(
    lat: number,
    lon: number,
    source: "map_click" | "device_location",
  ) {
    const location = { lat, lon };

    setSelectedLocation(location);
    setIsLocating(false);
    setLocationError(null);
    if (source === "map_click") {
      setLocationWarning(null);
    }
    setIsLoading(true);
    setError(null);
    setCard(null);

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const result = await fetchPlaceDNA({
        lat,
        lon,
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

      setError(getApiErrorMessage(caughtError));
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
        setIsLocating(false);
      }
    }
  }

  function getGeolocationErrorMessage(locationIssue: GeolocationPositionError) {
    switch (locationIssue.code) {
      case locationIssue.PERMISSION_DENIED:
        return "Location permission was denied. You can still click anywhere on the map.";
      case locationIssue.POSITION_UNAVAILABLE:
        return "Your current location is unavailable right now. Try again in a moment.";
      case locationIssue.TIMEOUT:
        return "Location request timed out. Try again or select a point manually.";
      default:
        return "Could not get your location. Try again or click a point on the map.";
    }
  }

  function handleUseMyLocation() {
    setLocationWarning(null);

    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      setIsLocating(false);
      return;
    }

    setError(null);
    setLocationError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const location = {
          lat,
          lon,
        };

        console.log("Device geolocation result:", {
          lat,
          lon,
          accuracy,
        });

        focusMapOnLocation(location);
        setSelectedLocation(location);
        setIsLocating(false);
        setLocationError(null);

        if (accuracy > APPROXIMATE_LOCATION_THRESHOLD_M) {
          setLocationWarning(getApproximateLocationWarning(accuracy));
          setError(null);
          setCard(null);
          return;
        }

        setLocationWarning(null);
        void generateCardForCoordinates(lat, lon, "device_location");
      },
      (locationIssue) => {
        setIsLocating(false);
        setLocationError(getGeolocationErrorMessage(locationIssue));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
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

          <div className="flex flex-col gap-3 rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-white/90 p-4 shadow-pop sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <ShapeBadge tone="tertiary" soft className="px-3 py-2 text-[0.62rem] tracking-[0.2em]">
                Browser geolocation
              </ShapeBadge>
              <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
                Jump to your current spot and generate a live PlaceDNA card for it.
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--placedna-muted-foreground)]">
                Your location is used only to generate this card.
              </p>
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating || isLoading}
              className="btn inline-flex items-center justify-center gap-2 self-start rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)] px-5 font-bold text-[color:var(--placedna-ink)] shadow-[4px_4px_0_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1E293B] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1E293B] sm:self-center"
            >
              {isLocating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              ) : (
                <LocateFixed className="h-4 w-4" strokeWidth={2.5} />
              )}
              <span>{isLocating ? "Finding location..." : "Use my location"}</span>
            </button>
          </div>

          <PlaceMap
            focusRequest={focusRequest}
            onLocationSelect={(location) => {
              setError(null);
              setLocationError(null);
              setLocationWarning(null);
              void generateCardForCoordinates(location.lat, location.lon, "map_click");
            }}
          />
          <MapStatusPanel
            selectedLocation={selectedLocation}
            isLoading={isLoading}
            isLocating={isLocating}
            error={error}
            locationError={locationError}
            locationWarning={locationWarning}
            radiusM={DEFAULT_RADIUS_M}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="flex justify-start lg:justify-end">
            <DownloadCardButton
              cardRef={cardRef}
              placeCard={card}
              isGenerating={isLoading}
            />
          </div>

          <div
            ref={cardRef}
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
