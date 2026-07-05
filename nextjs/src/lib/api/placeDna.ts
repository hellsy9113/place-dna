import type { PlaceDNAResponse } from "@/types/placedna";

type FetchPlaceDNAParams = {
  lat: number;
  lon: number;
  radiusM?: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchPlaceDNA({
  lat,
  lon,
  radiusM = 500,
}: FetchPlaceDNAParams): Promise<PlaceDNAResponse> {
  const url = new URL("/api/place-dna", API_BASE_URL);
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lon.toString());
  url.searchParams.set("radius_m", radiusM.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = "Failed to generate PlaceDNA card.";

    try {
      const errorData = (await response.json()) as { detail?: string; message?: string };
      message = errorData.detail ?? errorData.message ?? message;
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return (await response.json()) as PlaceDNAResponse;
}
