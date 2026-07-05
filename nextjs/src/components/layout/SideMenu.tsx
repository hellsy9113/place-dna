import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Home,
  Map,
  Radar,
  Sparkles,
} from "lucide-react";

import { iconToneClasses } from "@/lib/design";

import { PopButton } from "../ui/PopButton";
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
      <div className="no-print px-4 pt-4 lg:hidden">
        <StickerCard hoverable={false} tone="neutral" className="bg-white/95 p-4">
          <div className="flex items-start justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-[18px] border-2 ${iconToneClasses.accent}`}
              >
                <Radar className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="min-w-0">
                <span className="font-display block text-xl font-extrabold tracking-[-0.03em] text-[color:var(--placedna-ink)]">
                  PlaceDNA
                </span>
                <ShapeBadge tone="tertiary" className="mt-1 px-3 py-2 text-[0.62rem] tracking-[0.22em]">
                  Geo intelligence cards
                </ShapeBadge>
              </span>
            </Link>

            <PopButton href="#map-demo" size="md" className="pl-4 pr-3">
              <span>Generate</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[color:var(--placedna-accent)]">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </PopButton>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-paper)] px-4 py-2 text-sm font-semibold text-[color:var(--placedna-ink)] transition-transform hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[color:var(--placedna-ink)] bg-white/70 px-4 py-2 text-sm font-semibold text-[color:var(--placedna-muted-foreground)]">
              <BookMarked className="h-4 w-4" strokeWidth={2.5} />
              <span>Saved Cards</span>
              <ShapeBadge tone="secondary" soft className="px-2 py-1 text-[0.54rem] tracking-[0.16em]">
                Soon
              </ShapeBadge>
            </span>
          </div>
        </StickerCard>
      </div>

      <aside className="no-print hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:border-r-2 lg:border-[color:var(--placedna-ink)] lg:bg-white/70 lg:backdrop-blur-sm">
        <div className="flex h-full flex-col gap-5 p-5">
          <StickerCard
            hoverable={false}
            tone="neutral"
            className="relative overflow-hidden bg-white/95 p-5"
          >
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-tertiary)] opacity-90" />
            <div className="absolute bottom-4 right-8 h-3 w-16 rounded-full border-2 border-[color:var(--placedna-ink)] bg-[color:var(--placedna-quaternary)]" />

            <Link href="/" className="relative flex items-center gap-3">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] border-2 ${iconToneClasses.accent}`}
              >
                <Radar className="h-6 w-6" strokeWidth={2.5} />
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
                  className="group flex items-center justify-between rounded-[1.2rem] border-2 border-[color:var(--placedna-ink)] bg-white/90 px-4 py-3 text-[color:var(--placedna-ink)] shadow-pop transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconToneClasses[item.tone]}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                </Link>
              );
            })}

            <div className="rounded-[1.2rem] border-2 border-dashed border-[color:var(--placedna-ink)] bg-white/80 px-4 py-3 text-[color:var(--placedna-ink)]">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${iconToneClasses.secondary}`}
                  >
                    <BookMarked className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="font-semibold">Saved Cards</span>
                </span>
                <ShapeBadge tone="secondary" soft className="px-2 py-1 text-[0.54rem] tracking-[0.16em]">
                  Soon
                </ShapeBadge>
              </div>
            </div>
          </nav>

          <div className="mt-auto space-y-4">
            <PopButton href="#map-demo" size="lg" className="w-full justify-between pl-6 pr-3">
              <span>Generate Card</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[color:var(--placedna-accent)]">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </PopButton>

            <StickerCard
              hoverable={false}
              tone="quaternary"
              className="bg-[color:var(--placedna-quaternary-soft)] p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${iconToneClasses.quaternary}`}
                >
                  <Sparkles className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--placedna-muted-foreground)]">
                    Field note
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--placedna-ink)]">
                    Click anywhere on the map to reveal a place card.
                  </p>
                </div>
              </div>
            </StickerCard>
          </div>
        </div>
      </aside>
    </>
  );
}
