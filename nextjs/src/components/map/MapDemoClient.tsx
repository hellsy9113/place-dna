"use client";

import { useRef, useState } from "react";
import { LoaderCircle, LocateFixed } from "lucide-react";

import { fetchPlaceDNA, getFriendlyErrorMessage } from "@/lib/api/placeDna";
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
  const hasExportableCard = card !== null && !isLoading;
  const isShowingPreviousCard = card !== null && error !== null;

  function focusMapOnLocation(location: SelectedMapLocation) {
    const focusId = focusRequestIdRef.current + 1;
    focusRequestIdRef.current = focusId;

    setFocusRequest({
      id: focusId,
      location,
    });
  }

  function getApproximateLocationWarning() {
    return "Your browser returned an approximate location. Zoom in and click the exact spot manually.";
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
      setError(null);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setError(getFriendlyErrorMessage(caughtError));
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
        return "Location permission was denied. You can still click the map manually.";
      case locationIssue.POSITION_UNAVAILABLE:
        return "Could not get your location right now. Try again or click the map manually.";
      case locationIssue.TIMEOUT:
        return "Could not get your location quickly enough. Try again or click the map manually.";
      default:
        return "Could not get your location. Try again or click the map manually.";
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

        focusMapOnLocation(location);
        setSelectedLocation(location);
        setIsLocating(false);
        setLocationError(null);

        if (accuracy > APPROXIMATE_LOCATION_THRESHOLD_M) {
          setLocationWarning(getApproximateLocationWarning());
          setError(null);
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
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,26rem)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="order-1 max-w-2xl space-y-3">
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

          <div className="order-3 flex flex-col gap-3 rounded-[1.35rem] border-2 border-[color:var(--placedna-ink)] bg-white/95 p-4 shadow-pop sm:flex-row sm:items-center sm:justify-between lg:order-2">
            <div className="space-y-2">
              <ShapeBadge tone="tertiary" soft className="px-3 py-2 text-[0.62rem] tracking-[0.2em]">
                Find this device
              </ShapeBadge>
              <p className="text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
                Jump to your current spot and generate its PlaceDNA card.
              </p>
              <p className="max-w-lg text-xs font-medium leading-5 text-[color:var(--placedna-muted-foreground)]">
                Your browser asks for permission. This location is used to generate
                a PlaceDNA card.
              </p>
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating || isLoading}
              className="btn min-h-11 w-full gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)] px-5 font-bold text-[color:var(--placedna-ink)] shadow-[4px_4px_0_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1E293B] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1E293B] sm:w-auto sm:self-center"
            >
              {isLocating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              ) : (
                <LocateFixed className="h-4 w-4" strokeWidth={2.5} />
              )}
              <span>{isLocating ? "Finding location..." : "Use my location"}</span>
            </button>
          </div>

          <div className="order-2 lg:order-3">
            <PlaceMap
              focusRequest={focusRequest}
              onLocationSelect={(location) => {
                setError(null);
                setLocationError(null);
                setLocationWarning(null);
                void generateCardForCoordinates(location.lat, location.lon, "map_click");
              }}
            />
          </div>
          <div className="order-4">
            <MapStatusPanel
              selectedLocation={selectedLocation}
              isLoading={isLoading}
              isLocating={isLocating}
              error={error}
              locationError={locationError}
              locationWarning={locationWarning}
            />
          </div>
        </div>

        <aside aria-label="Generated PlaceDNA card" className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          {card ? (
            <div className="flex justify-stretch sm:justify-start lg:justify-end">
              <DownloadCardButton
                key={`${card.id}-${card.location.lat}-${card.location.lon}`}
                cardRef={cardRef}
                placeCard={card}
                isGenerating={isLoading}
              />
            </div>
          ) : null}

          {isShowingPreviousCard ? (
            <p
              role="status"
              className="no-print rounded-[1.1rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary-soft)] px-4 py-3 text-sm font-semibold leading-6 text-[color:var(--placedna-ink)]"
            >
              Showing your last generated card. Choose another supported land
              location to replace it.
            </p>
          ) : null}

          <div
            ref={cardRef}
            id={hasExportableCard ? "print-card-area" : undefined}
            className="w-full lg:ml-auto lg:max-w-[26rem]"
          >
            <GeneratedPlaceCard
              data={card}
              isLoading={isLoading}
              error={card ? null : error}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
