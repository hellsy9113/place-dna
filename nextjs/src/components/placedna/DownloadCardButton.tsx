"use client";

import { useState } from "react";

import html2canvas from "html2canvas";
import { Download } from "lucide-react";

type DownloadCardButtonProps = {
  placeName?: string;
  targetId?: string;
  title?: string;
};

const DEFAULT_TARGET_ID = "download-card-area";

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildFileName(title?: string, placeName?: string) {
  const parts = [title, placeName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map(sanitizeFilePart)
    .filter(Boolean);

  const suffix = parts.length > 0 ? parts.join("-") : "place-card";
  return `placedna-${suffix}.png`;
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Could not finish the card download."));
    }, "image/png");
  });
}

async function downloadElementAsPng(target: HTMLElement, fileName: string) {
  await document.fonts.ready;

  const rect = target.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    throw new Error("Could not find a visible card to download.");
  }

  const canvas = await html2canvas(target, {
    backgroundColor: null,
    logging: false,
    scale: Math.max(window.devicePixelRatio, 2),
    useCORS: true,
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  });
  const blob = await canvasToBlob(canvas);
  const downloadUrl = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(downloadUrl);
  }
}

export function DownloadCardButton({
  placeName,
  targetId = DEFAULT_TARGET_ID,
  title,
}: DownloadCardButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleDownload() {
    const target = document.getElementById(targetId);

    if (!(target instanceof HTMLElement)) {
      setStatusMessage("Card download is unavailable right now.");
      return;
    }

    setIsDownloading(true);
    setStatusMessage(null);

    try {
      await downloadElementAsPng(target, buildFileName(title, placeName));
      setStatusMessage("PlaceDNA card downloaded.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Could not download the PlaceDNA card.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="btn inline-flex items-center justify-center gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent)] px-5 font-bold text-white shadow-[4px_4px_0_#1E293B] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1E293B] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1E293B]"
      >
        <Download className="h-4 w-4" strokeWidth={2.5} />
        <span>{isDownloading ? "Preparing..." : "Download Card"}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
    </>
  );
}
