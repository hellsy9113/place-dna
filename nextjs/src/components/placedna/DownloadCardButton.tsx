"use client";

import { type RefObject, useState } from "react";

import { toPng } from "html-to-image";
import { Download, Printer } from "lucide-react";

import type { PlaceDNAResponse } from "@/types/placedna";

type DownloadCardButtonProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  placeCard: PlaceDNAResponse | null;
  isGenerating?: boolean;
};

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildFileName(placeCard: PlaceDNAResponse) {
  const rawName =
    placeCard.place_name ||
    placeCard.title ||
    placeCard.landmark.name ||
    "placedna-card";
  const safeName = sanitizeFilePart(rawName);

  return `${safeName || "placedna-card"}.png`;
}

async function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

async function renderCardToPng(target: HTMLElement) {
  await document.fonts.ready;

  const rect = target.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    throw new Error("Could not find a visible card to download.");
  }

  return await toPng(target, {
    cacheBust: true,
    pixelRatio: Math.max(window.devicePixelRatio, 2),
    backgroundColor: "#FFFDF5",
    canvasWidth: Math.ceil(rect.width * Math.max(window.devicePixelRatio, 2)),
    canvasHeight: Math.ceil(rect.height * Math.max(window.devicePixelRatio, 2)),
  });
}

async function downloadElementAsPng(target: HTMLElement, fileName: string) {
  const dataUrl = await renderCardToPng(target);
  await downloadDataUrl(dataUrl, fileName);
}

async function downloadElementAsPngWithoutExternalImages(
  target: HTMLElement,
  fileName: string,
) {
  target.dataset.exportMode = "fallback";
  try {
    const dataUrl = await renderCardToPng(target);
    await downloadDataUrl(dataUrl, fileName);
  } finally {
    delete target.dataset.exportMode;
  }
}

export function DownloadCardButton({
  cardRef,
  placeCard,
  isGenerating = false,
}: DownloadCardButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "secondary" | "quaternary">("neutral");
  const isDisabled = placeCard === null || isGenerating || isDownloading;

  async function handleDownload() {
    const target = cardRef.current;

    if (!placeCard || !(target instanceof HTMLElement)) {
      setStatusTone("secondary");
      setStatusMessage("Generate a card first.");
      return;
    }

    setIsDownloading(true);
    setStatusMessage(null);
    setStatusTone("neutral");

    try {
      await downloadElementAsPng(target, buildFileName(placeCard));
      setStatusTone("quaternary");
      setStatusMessage("PlaceDNA card downloaded.");
    } catch {
      try {
        await downloadElementAsPngWithoutExternalImages(target, buildFileName(placeCard));
        setStatusTone("quaternary");
        setStatusMessage("PlaceDNA card downloaded with a safe image fallback.");
      } catch {
        console.error("PlaceDNA card export failed.");
        setStatusTone("secondary");
        setStatusMessage("Download failed. Try Print / Save as PDF.");
      }
    } finally {
      setIsDownloading(false);
    }
  }

  function handlePrintFallback() {
    if (!placeCard) {
      setStatusTone("secondary");
      setStatusMessage("Generate a card first.");
      return;
    }

    setStatusTone("neutral");
    setStatusMessage("Opening Print / Save PDF...");
    window.print();
  }

  return (
    <div className="no-print w-full space-y-2 sm:w-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDisabled}
          aria-busy={isDownloading}
          className="btn min-h-11 w-full gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent)] px-5 font-bold text-white shadow-[4px_4px_0_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1E293B] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1E293B] sm:w-auto"
        >
          <Download className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
          <span>{isDownloading ? "Preparing..." : "Download Card"}</span>
        </button>
        <button
          type="button"
          onClick={handlePrintFallback}
          disabled={placeCard === null || isGenerating || isDownloading}
          className="btn min-h-11 w-full gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-white px-5 font-bold text-[color:var(--placedna-ink)] shadow-[4px_4px_0_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1E293B] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1E293B] sm:w-auto"
        >
          <Printer className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
          <span>Print / Save PDF</span>
        </button>
      </div>
      <p
        role={statusTone === "secondary" ? "alert" : "status"}
        aria-live={statusTone === "secondary" ? "assertive" : "polite"}
        className={`min-h-5 text-sm ${
          statusTone === "secondary"
            ? "font-semibold text-[color:var(--color-error)]"
            : statusTone === "quaternary"
              ? "font-semibold text-[color:var(--placedna-ink)]"
              : "text-[color:var(--placedna-muted-foreground)]"
        }`}
      >
        {statusMessage}
      </p>
    </div>
  );
}
