"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

import type { SelectedMapLocation } from "@/types/placedna";

import { MapClickHint } from "./MapClickHint";

type PlaceMapProps = {
  onLocationSelect: (location: SelectedMapLocation) => void;
};

const initialCenter: [number, number] = [78.9629, 20.5937];

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

export function PlaceMap({ onLocationSelect }: PlaceMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: initialCenter,
      zoom: 4,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("click", (event) => {
      const location = {
        lat: event.lngLat.lat,
        lon: event.lngLat.lng,
      };

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new maplibregl.Marker({
        color: "#8B5CF6",
        scale: 1.2,
      })
        .setLngLat(event.lngLat)
        .addTo(map);

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
      <div
        ref={containerRef}
        className="h-[460px] w-full rounded-[1.75rem] border-2 border-[color:var(--placedna-ink)]"
      />
    </div>
  );
}
