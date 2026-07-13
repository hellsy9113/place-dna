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
    <header className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-6 lg:px-8">
      <StickerCard hoverable={false} tone="neutral" className="bg-white/95 px-3 py-3 sm:px-4">
        <nav aria-label="Primary navigation" className="navbar min-h-0 gap-2 px-0 sm:gap-4">
          <div className="navbar-start min-w-0 gap-2 sm:gap-3">
            <a href={brandHref} className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border-2 sm:h-12 sm:w-12 sm:rounded-[18px] ${iconToneClasses.accent} wiggle-hover`}
              >
                <Radar className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
              </span>
              <span className="min-w-0">
                <span className="font-display block text-lg font-extrabold tracking-[-0.03em] text-[color:var(--placedna-ink)] sm:text-xl">
                  PlaceDNA
                </span>
                <ShapeBadge tone="tertiary" className="mt-1 hidden px-3 py-2 text-[0.65rem] tracking-[0.22em] min-[480px]:inline-flex">
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
            <PopButton href={ctaHref} size="md" className="min-h-11 pl-4 pr-2.5 sm:min-h-12 sm:pl-5 sm:pr-3">
              <span className="hidden min-[440px]:inline">{ctaLabel}</span>
              <span className="min-[440px]:hidden">Map</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[color:var(--placedna-accent)]">
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
              </span>
            </PopButton>
          </div>
        </nav>

        <div className="mt-4 hidden sm:block lg:hidden">
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
