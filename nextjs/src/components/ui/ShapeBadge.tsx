import type { ReactNode } from "react";

import { badgeToneClasses, softBadgeToneClasses } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { DecorTone } from "@/types/placedna";

type ShapeBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: DecorTone;
  soft?: boolean;
};

export function ShapeBadge({
  children,
  className,
  tone = "accent",
  soft = false,
}: ShapeBadgeProps) {
  return (
    <span
      className={cn(
        "badge rounded-full border-2 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em]",
        soft ? softBadgeToneClasses[tone] : badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
