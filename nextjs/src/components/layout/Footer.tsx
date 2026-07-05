import { navLinks } from "@/data/homepage";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12 pt-4 lg:px-8">
      <StickerCard hoverable={false} tone="neutral" className="px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <aside>
            <ShapeBadge tone="secondary" className="px-3 py-2 text-[0.65rem] tracking-[0.22em]">
              PlaceDNA
            </ShapeBadge>
            <p className="font-display mt-4 text-2xl font-extrabold text-[color:var(--placedna-ink)]">
              Click any place. Reveal its DNA.
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--placedna-muted-foreground)]">
              Collect geospatial identity through vegetation, density, access,
              and landmark intelligence.
            </p>
          </aside>

          <nav aria-label="Footer navigation">
            <ul className="menu menu-horizontal flex-wrap justify-center gap-2 rounded-[1.25rem] border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] p-2 text-sm font-medium text-[color:var(--placedna-muted-foreground)]">
              {navLinks.map((link) => (
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
          </nav>

          <aside className="justify-self-start text-sm font-medium text-[color:var(--placedna-muted-foreground)] lg:justify-self-end">
            <p>{new Date().getFullYear()} PlaceDNA. Geo intelligence cards.</p>
          </aside>
        </div>
      </StickerCard>
    </footer>
  );
}
