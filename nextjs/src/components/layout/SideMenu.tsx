import Link from "next/link";
import { ArrowRight, Home, Map, Radar, Sparkles } from "lucide-react";

import { iconToneClasses } from "@/lib/design";

import { ShapeBadge } from "../ui/ShapeBadge";
import { StickerCard } from "../ui/StickerCard";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    tone: "quaternary" as const,
  },
  {
    label: "Map Demo",
    href: "/map",
    icon: Map,
    tone: "accent" as const,
    current: true,
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    icon: Sparkles,
    tone: "tertiary" as const,
  },
];

export function SideMenu() {
  return (
    <>
      <header className="no-print px-3 pt-3 sm:px-4 sm:pt-4 lg:hidden">
        <StickerCard hoverable={false} tone="neutral" className="bg-white/95 p-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border-2 ${iconToneClasses.accent}`}
              >
                <Radar className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={2.5} />
              </span>
              <span className="min-w-0">
                <span className="font-display block text-lg font-extrabold tracking-[-0.03em] text-[color:var(--placedna-ink)]">
                  PlaceDNA
                </span>
                <span className="block truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[color:var(--placedna-muted-foreground)]">
                  Geo intelligence cards
                </span>
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] px-4 text-sm font-bold text-[color:var(--placedna-ink)] shadow-[3px_3px_0_#1E293B] transition-transform hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
              Home
            </Link>
          </div>
        </StickerCard>
      </header>

      <aside className="no-print hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:border-r-2 lg:border-[color:var(--placedna-ink)] lg:bg-white/70 lg:backdrop-blur-sm">
        <div className="flex h-full flex-col gap-5 p-5">
          <StickerCard
            hoverable={false}
            tone="neutral"
            className="relative overflow-hidden bg-white/95 p-5"
          >
            <div
              aria-hidden="true"
              className="absolute right-4 top-4 h-12 w-12 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] opacity-90"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-4 right-8 h-3 w-16 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)]"
            />

            <Link href="/" className="relative flex items-center gap-3">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] border-2 ${iconToneClasses.accent}`}
              >
                <Radar className="h-6 w-6" aria-hidden="true" strokeWidth={2.5} />
              </span>
              <span>
                <span className="font-display block text-2xl font-extrabold tracking-[-0.04em] text-[color:var(--placedna-ink)]">
                  PlaceDNA
                </span>
                <ShapeBadge tone="tertiary" className="mt-2 px-3 py-2 text-[0.62rem] tracking-[0.22em]">
                  Geo intelligence cards
                </ShapeBadge>
              </span>
            </Link>
          </StickerCard>

          <nav aria-label="Map navigation" className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`group flex min-h-12 items-center justify-between rounded-[1.2rem] border-2 border-[color:var(--placedna-ink)] px-4 py-3 text-[color:var(--placedna-ink)] shadow-pop transition-transform hover:-translate-y-0.5 ${
                    item.current
                      ? "bg-[color:var(--placedna-accent-soft)]"
                      : "bg-white/90"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconToneClasses[item.tone]}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                    strokeWidth={2.5}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
