import type { DecorTone, Rarity, StatTone } from "@/types/placedna";

export const stickerToneClasses: Record<DecorTone, string> = {
  neutral: "[--sticker-shadow:#E2E8F0]",
  accent: "[--sticker-shadow:#C4B5FD]",
  secondary: "[--sticker-shadow:#F9A8D4]",
  tertiary: "[--sticker-shadow:#FDE68A]",
  quaternary: "[--sticker-shadow:#A7F3D0]",
};

export const badgeToneClasses: Record<DecorTone, string> = {
  neutral:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-muted)] text-[color:var(--placedna-ink)]",
  accent:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent)] text-white",
  secondary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary)] text-[color:var(--placedna-ink)]",
  tertiary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] text-[color:var(--placedna-ink)]",
  quaternary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)] text-[color:var(--placedna-ink)]",
};

export const softBadgeToneClasses: Record<DecorTone, string> = {
  neutral:
    "border-[color:var(--placedna-border)] bg-white text-[color:var(--placedna-ink)]",
  accent:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent-soft)] text-[color:var(--placedna-ink)]",
  secondary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary-soft)] text-[color:var(--placedna-ink)]",
  tertiary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary-soft)] text-[color:var(--placedna-ink)]",
  quaternary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary-soft)] text-[color:var(--placedna-ink)]",
};

export const iconToneClasses: Record<DecorTone, string> = {
  neutral:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-muted)] text-[color:var(--placedna-ink)]",
  accent:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-accent)] text-white",
  secondary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-secondary)] text-[color:var(--placedna-ink)]",
  tertiary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] text-[color:var(--placedna-ink)]",
  quaternary:
    "border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)] text-[color:var(--placedna-ink)]",
};

export const stripeToneClasses: Record<DecorTone, string> = {
  neutral:
    "bg-[repeating-linear-gradient(135deg,#ffffff_0_12px,#f8fafc_12px_24px)]",
  accent:
    "bg-[repeating-linear-gradient(135deg,#ede9fe_0_12px,#ddd6fe_12px_24px)]",
  secondary:
    "bg-[repeating-linear-gradient(135deg,#fdf2f8_0_12px,#fbcfe8_12px_24px)]",
  tertiary:
    "bg-[repeating-linear-gradient(135deg,#fffbeb_0_12px,#fde68a_12px_24px)]",
  quaternary:
    "bg-[repeating-linear-gradient(135deg,#ecfdf5_0_12px,#bbf7d0_12px_24px)]",
};

export const statFillClasses: Record<StatTone, string> = {
  neutral: "bg-[color:var(--placedna-muted-foreground)]",
  success: "bg-[color:var(--placedna-quaternary)]",
  info: "bg-[color:var(--placedna-accent)]",
  secondary: "bg-[color:var(--placedna-secondary)]",
  warning: "bg-[color:var(--placedna-tertiary)]",
  error: "bg-[color:var(--placedna-foreground)]",
};

export const rarityToneMap: Record<Rarity, DecorTone> = {
  Common: "neutral",
  Rare: "quaternary",
  Epic: "accent",
  Legendary: "tertiary",
  Vulnerable: "secondary",
};
