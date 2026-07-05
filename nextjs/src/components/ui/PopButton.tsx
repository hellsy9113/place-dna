import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PopButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
};

const variantClasses = {
  primary:
    "candy-button candy-button--primary btn-primary text-white hover:text-white",
  secondary:
    "candy-button candy-button--secondary btn-secondary text-[color:var(--placedna-ink)]",
  ghost:
    "btn-ghost border-2 border-[color:var(--placedna-ink)] bg-white/70 text-[color:var(--placedna-ink)] shadow-none hover:bg-[color:var(--placedna-muted)]",
};

const sizeClasses = {
  md: "min-h-12 px-5 text-sm sm:text-base",
  lg: "min-h-14 px-6 text-base sm:text-lg",
};

export function PopButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
}: PopButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "btn inline-flex items-center justify-center gap-3 rounded-full border-2 font-bold normal-case tracking-[-0.01em] no-underline",
        "focus-visible:outline-none focus-visible:ring-0",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
