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
        reason?: string;
        certainty_score?: number;
      };
  message?: string;
};

type ParsedPlaceDNAError = {
  message: string | null;
  reason: string | null;
};

class PlaceDNAApiError extends Error {
  readonly reason: string | null;
  readonly status: number;

  constructor({
    message,
    reason,
    status,
  }: ParsedPlaceDNAError & { status: number }) {
    super(message ?? "Failed to generate PlaceDNA card.");
    this.name = "PlaceDNAApiError";
    this.reason = reason;
    this.status = status;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function parsePlaceDNAError(payload: string): ParsedPlaceDNAError {
  if (!payload) {
    return { message: null, reason: null };
  }

  try {
    const errorData = JSON.parse(payload) as PlaceDNAErrorResponse;
    if (typeof errorData.detail === "string" && errorData.detail.trim()) {
      return { message: errorData.detail.trim(), reason: null };
    }
    if (
      errorData.detail &&
      typeof errorData.detail === "object" &&
      typeof errorData.detail.message === "string" &&
      errorData.detail.message.trim()
    ) {
      return {
        message: errorData.detail.message.trim(),
        reason:
          typeof errorData.detail.reason === "string"
            ? errorData.detail.reason.trim()
            : null,
      };
    }
    if (typeof errorData.message === "string" && errorData.message.trim()) {
      return { message: errorData.message.trim(), reason: null };
    }
  } catch {
    if (payload.trim()) {
      return { message: payload.trim(), reason: null };
    }
  }

  return { message: null, reason: null };
}

export function getFriendlyErrorMessage(error: unknown): string {
  const source =
    error instanceof PlaceDNAApiError
      ? `${error.message} ${error.reason ?? ""}`
      : error instanceof Error
        ? error.message
        : "";
  const normalizedSource = source.toLowerCase();

  if (
    normalizedSource.includes("outside") ||
    normalizedSource.includes("unsupported") ||
    normalizedSource.includes("ocean") ||
    normalizedSource.includes("sea location") ||
    normalizedSource.includes("coverage") ||
    normalizedSource.includes("certainty")
  ) {
    return "This location is not supported yet. Try another land location in India.";
  }

  return "Could not generate this card right now. Try another location.";
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
    const parsedError = parsePlaceDNAError(payload);
    throw new PlaceDNAApiError({
      ...parsedError,
      status: response.status,
    });
  }

  return JSON.parse(payload) as PlaceDNAResponse;
}
