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

const REQUEST_TIMEOUT_MS = 15_000;

class PlaceDNARequestTimeoutError extends Error {
  constructor() {
    super("PlaceDNA request timed out.");
    this.name = "PlaceDNARequestTimeoutError";
  }
}

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
  if (error instanceof PlaceDNARequestTimeoutError) {
    return "Network is slow. Please try again or click another nearby location.";
  }

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

  const controller = new AbortController();
  let didTimeOut = false;
  const timeoutId = globalThis.setTimeout(() => {
    didTimeOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  let response: Response;
  let payload: string;
  try {
    response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    payload = await response.text();
  } catch (error) {
    if (didTimeOut || (error instanceof DOMException && error.name === "AbortError")) {
      throw new PlaceDNARequestTimeoutError();
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const parsedError = parsePlaceDNAError(payload);
    throw new PlaceDNAApiError({
      ...parsedError,
      status: response.status,
    });
  }

  return JSON.parse(payload) as PlaceDNAResponse;
}
