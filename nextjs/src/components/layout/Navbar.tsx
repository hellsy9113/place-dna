import { ArrowRight, Radar } from "lucide-react";

import { iconToneClasses } from "@/lib/design";
import { navLinks as homeNavLinks } from "@/data/homepage";
import type { NavLink } from "@/types/placedna";

import { PopButton } from "../ui/PopButton";
import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

type NavbarProps = {
  brandHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  links?: NavLink[];
};

export function Navbar({
  brandHref = "/",
  ctaHref = "/map",
  ctaLabel = "Generate Card",
  links = homeNavLinks,
}: NavbarProps) {
  return (
    <header className="mx-auto max-w-6xl px-6 pt-6 lg:px-8">
      <StickerCard hoverable={false} tone="neutral" className="bg-white/95 px-4 py-3">
        <nav aria-label="Primary navigation" className="navbar min-h-0 gap-4 px-0">
          <div className="navbar-start gap-3">
            <a href={brandHref} className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-[18px] border-2 ${iconToneClasses.accent} wiggle-hover`}
              >
                <Radar className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="min-w-0">
                <span className="font-display block text-xl font-extrabold tracking-[-0.03em] text-[color:var(--placedna-ink)]">
                  PlaceDNA
                </span>
                <ShapeBadge tone="tertiary" className="mt-1 px-3 py-2 text-[0.65rem] tracking-[0.22em]">
                  Geo intelligence cards
                </ShapeBadge>
              </span>
            </a>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] p-2 text-sm font-medium text-[color:var(--placedna-muted-foreground)]">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="rounded-full px-4 py-2 transition-colors hover:bg-[color:var(--placedna-muted)] hover:text-[color:var(--placedna-ink)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="navbar-end">
            <PopButton href={ctaHref} size="md" className="pl-5 pr-3">
              <span>{ctaLabel}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[color:var(--placedna-accent)]">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </PopButton>
          </div>
        </nav>

        <div className="mt-4 lg:hidden">
          <ul className="menu menu-horizontal flex-wrap justify-center gap-2 rounded-[1.25rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] p-2 text-sm font-medium text-[color:var(--placedna-muted-foreground)]">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 transition-colors hover:bg-[color:var(--placedna-muted)] hover:text-[color:var(--placedna-ink)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </StickerCard>
    </header>
  );
}
