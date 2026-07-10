"use client";

import { useState } from "react";

import type { DecorTone } from "@/types/placedna";

import { ShapeBadge } from "../ui/ShapeBadge";

type LandmarkImageProps = {
  alt: string;
  imageUrl: string | null;
  landmarkName: string;
  tone: DecorTone;
};

export function LandmarkImage({
  alt,
  imageUrl,
  landmarkName,
  tone,
}: LandmarkImageProps) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <div className="relative h-52 rounded-[1.5rem_1.5rem_1rem_1rem] border-2 border-[color:var(--placedna-ink)] bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(244,114,182,0.16),rgba(251,191,36,0.22),rgba(255,255,255,0.8))] p-4 print:h-28 print:rounded-[1rem_1rem_0.75rem_0.75rem] print:p-2.5">
        <ShapeBadge
          tone={tone}
          className="px-3 py-2 text-[0.62rem] tracking-[0.18em] print:px-2 print:py-1 print:text-[0.5rem]"
        >
          No landmark image available
        </ShapeBadge>
        <div className="mt-14 flex items-end gap-2 print:mt-6 print:gap-1.5">
          <span className="h-10 w-5 rounded-t-full bg-white/55 print:h-5 print:w-3" />
          <span className="h-14 w-7 rounded-t-full bg-white/70 print:h-7 print:w-4" />
          <span className="h-8 w-4 rounded-t-full bg-white/50 print:h-4 print:w-2.5" />
          <span className="h-18 w-8 rounded-t-full bg-white/82 print:h-9 print:w-4.5" />
          <span className="h-12 w-6 rounded-t-full bg-white/64 print:h-6 print:w-3.5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[color:var(--placedna-ink)] print:mt-2 print:text-[0.68rem]">
          {landmarkName}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative h-52 w-full overflow-hidden rounded-[1.5rem_1.5rem_1rem_1rem] border-2 border-[color:var(--placedna-ink)] bg-white/70 print:h-28 print:rounded-[1rem_1rem_0.75rem_0.75rem]"
      data-landmark-image-frame
    >
      <div
        className="pointer-events-none absolute inset-0 hidden h-full w-full bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(244,114,182,0.16),rgba(251,191,36,0.22),rgba(255,255,255,0.8))] p-4 print:p-2.5"
        data-landmark-image-export-fallback
      >
        <ShapeBadge
          tone={tone}
          className="px-3 py-2 text-[0.62rem] tracking-[0.18em] print:px-2 print:py-1 print:text-[0.5rem]"
        >
          No landmark image available
        </ShapeBadge>
        <div className="mt-14 flex items-end gap-2 print:mt-6 print:gap-1.5">
          <span className="h-10 w-5 rounded-t-full bg-white/55 print:h-5 print:w-3" />
          <span className="h-14 w-7 rounded-t-full bg-white/70 print:h-7 print:w-4" />
          <span className="h-8 w-4 rounded-t-full bg-white/50 print:h-4 print:w-2.5" />
          <span className="h-18 w-8 rounded-t-full bg-white/82 print:h-9 print:w-4.5" />
          <span className="h-12 w-6 rounded-t-full bg-white/64 print:h-6 print:w-3.5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[color:var(--placedna-ink)] print:mt-2 print:text-[0.68rem]">
          {landmarkName}
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        data-landmark-image
        onError={() => setFailed(true)}
      />
    </div>
  );
}
