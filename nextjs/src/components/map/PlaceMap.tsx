"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, type MutableRefObject } from "react";
import maplibregl from "maplibre-gl";

import type { MapFocusRequest, SelectedMapLocation } from "@/types/placedna";

import { MapClickHint } from "./MapClickHint";

type PlaceMapProps = {
  focusRequest?: MapFocusRequest | null;
  onLocationSelect: (location: SelectedMapLocation) => void;
};

const initialCenter: [number, number] = [78.9629, 20.5937];
const indiaBounds: maplibregl.LngLatBoundsLike = [
  [66.0, 5.0],
  [99.5, 38.5],
];

// Use a satellite-first basemap so PlaceDNA focuses on geospatial identity,
// not political boundary labeling.
const satelliteMapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "esri-world-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri",
    },
  },
  layers: [
    {
      id: "esri-world-imagery-layer",
      type: "raster",
      source: "esri-world-imagery",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const neutralMapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "carto-light-nolabels": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        "https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-light-nolabels-layer",
      type: "raster",
      source: "carto-light-nolabels",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

function updateMarker(
  markerRef: MutableRefObject<maplibregl.Marker | null>,
  map: maplibregl.Map,
  location: SelectedMapLocation,
) {
  const coordinates: [number, number] = [location.lon, location.lat];

  if (markerRef.current) {
    markerRef.current.setLngLat(coordinates);
    return;
  }

  markerRef.current = new maplibregl.Marker({
    color: "#8B5CF6",
    scale: 1.2,
  })
    .setLngLat(coordinates)
    .addTo(map);
}

function applyFocusRequest(
  mapRef: MutableRefObject<maplibregl.Map | null>,
  markerRef: MutableRefObject<maplibregl.Marker | null>,
  appliedFocusRequestIdRef: MutableRefObject<number | null>,
  request: MapFocusRequest | null,
) {
  if (!request || appliedFocusRequestIdRef.current === request.id) {
    return;
  }

  const map = mapRef.current;

  if (!map) {
    return;
  }

  appliedFocusRequestIdRef.current = request.id;
  updateMarker(markerRef, map, request.location);
  map.flyTo({
    center: [request.location.lon, request.location.lat],
    zoom: 13,
    essential: true,
  });
}

export function PlaceMap({ focusRequest = null, onLocationSelect }: PlaceMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const focusRequestRef = useRef<MapFocusRequest | null>(focusRequest);
  const appliedFocusRequestIdRef = useRef<number | null>(null);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    focusRequestRef.current = focusRequest;
    applyFocusRequest(
      mapRef,
      markerRef,
      appliedFocusRequestIdRef,
      focusRequest,
    );
  }, [focusRequest]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let fallbackApplied = false;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: satelliteMapStyle,
      center: initialCenter,
      zoom: 4,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const fitIndiaView = () => {
      map.fitBounds(indiaBounds, {
        padding: 40,
        duration: 0,
      });
    };

    map.once("load", () => {
      fitIndiaView();
      applyFocusRequest(
        mapRef,
        markerRef,
        appliedFocusRequestIdRef,
        focusRequestRef.current,
      );
    });

    map.on("error", (event) => {
      if (fallbackApplied) {
        return;
      }

      const sourceId =
        "sourceId" in event && typeof event.sourceId === "string"
          ? event.sourceId
          : undefined;
      const errorMessage =
        "error" in event && event.error instanceof Error
          ? event.error.message
          : "";

      if (
        sourceId !== "esri-world-imagery" &&
        !errorMessage.includes("World_Imagery")
      ) {
        return;
      }

      fallbackApplied = true;
      map.setStyle(neutralMapStyle);
      map.once("styledata", () => {
        fitIndiaView();
      });
    });

    map.on("click", (event) => {
      const location = {
        lat: event.lngLat.lat,
        lon: event.lngLat.lng,
      };

      updateMarker(markerRef, map, location);
      onLocationSelectRef.current(location);
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative">
      <MapClickHint />
      <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-[color:var(--placedna-ink)] shadow-pop">
        <div ref={containerRef} className="h-[460px] w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[#FFFDF5]/10 mix-blend-soft-light" />
      </div>
    </div>
  );
}
