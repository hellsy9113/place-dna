import type { PlaceDNAResponse } from "@/types/placedna";

type FetchPlaceDNAParams = {
  lat: number;
  lon: number;
  radiusM?: number;
};

type PlaceDNAErrorResponse = {
  detail?:
    | string
    | {
        message?: string;
      };
  message?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function extractPlaceDNAMessage(payload: string): string | null {
  if (!payload) {
    return null;
  }

  try {
    const errorData = JSON.parse(payload) as PlaceDNAErrorResponse;
    if (typeof errorData.detail === "string" && errorData.detail.trim()) {
      return errorData.detail;
    }
    if (
      errorData.detail &&
      typeof errorData.detail === "object" &&
      typeof errorData.detail.message === "string" &&
      errorData.detail.message.trim()
    ) {
      return errorData.detail.message;
    }
    if (typeof errorData.message === "string" && errorData.message.trim()) {
      return errorData.message;
    }
  } catch {
    if (payload.trim()) {
      return payload.trim();
    }
  }

  return null;
}

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

  const payload = await response.text();

  if (!response.ok) {
    throw new Error(
      extractPlaceDNAMessage(payload) ?? "Failed to generate PlaceDNA card.",
    );
  }

  return JSON.parse(payload) as PlaceDNAResponse;
}
