import type { CSSProperties, ReactNode } from "react";

import { stickerToneClasses } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { DecorTone } from "@/types/placedna";

type StickerCardProps = {
  children: ReactNode;
  className?: string;
  tone?: DecorTone;
  shadowColor?: string;
  hoverable?: boolean;
};

export function StickerCard({
  children,
  className,
  tone = "neutral",
  shadowColor,
  hoverable = true,
}: StickerCardProps) {
  return (
    <div
      style={
        shadowColor
          ? ({ ["--sticker-shadow" as string]: shadowColor } as CSSProperties)
          : undefined
      }
      className={cn(
        "card sticker-card relative overflow-hidden rounded-[1.5rem] border-2 border-[color:var(--placedna-ink)] bg-white",
        stickerToneClasses[tone],
        hoverable && "sticker-card--interactive",
        className,
      )}
    >
      {children}
    </div>
  );
}
