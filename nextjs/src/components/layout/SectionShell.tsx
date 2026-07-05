import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { DecorTone } from "@/types/placedna";

import { FloatingShapes } from "../ui/FloatingShapes";
import { ShapeBadge } from "../ui/ShapeBadge";

type SectionShellProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: DecorTone;
};

const decorationClasses: Record<DecorTone, string> = {
  neutral: "bg-[color:var(--placedna-muted)]",
  accent: "bg-[color:var(--placedna-accent)]",
  secondary: "bg-[color:var(--placedna-secondary)]",
  tertiary: "bg-[color:var(--placedna-tertiary)]",
  quaternary: "bg-[color:var(--placedna-quaternary)]",
};

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
  tone = "accent",
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto max-w-6xl px-6 py-24 lg:px-8", className)}
    >
      <FloatingShapes className="opacity-35" />
      <div
        className={cn(
          "shape-confetti left-2 top-10 hidden h-8 w-8 rounded-[12px] rotate-12 lg:block",
          decorationClasses[tone],
        )}
      />
      <div
        className={cn(
          "shape-confetti right-12 top-24 hidden h-5 w-20 rounded-full lg:block",
          decorationClasses[tone],
        )}
      />
      <div className="pattern-dots absolute right-14 top-0 hidden h-24 w-24 rounded-full opacity-65 lg:block" />

      <div className="relative max-w-3xl">
        <ShapeBadge tone={tone} soft className="px-4 py-4 text-[0.7rem] tracking-[0.28em]">
          {eyebrow}
        </ShapeBadge>
        <h2 className="font-display mt-5 text-3xl font-extrabold tracking-[-0.05em] text-[color:var(--placedna-ink)] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-8 text-[color:var(--placedna-muted-foreground)] sm:text-lg">
          {description}
        </p>
      </div>

      <div className={cn("relative mt-12", contentClassName)}>{children}</div>
    </section>
  );
}
