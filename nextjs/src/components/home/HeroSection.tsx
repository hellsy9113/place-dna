import { ArrowRight, Sparkles } from "lucide-react";

import { heroPills } from "@/data/homepage";

import { PopButton } from "../ui/PopButton";
import { ShapeBadge } from "../ui/ShapeBadge";
import { HeroVisual } from "./HeroVisual";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="relative grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-2xl">
          <ShapeBadge tone="accent" className="px-4 py-4 text-sm tracking-[0.24em]">
            <Sparkles className="mr-1 h-4 w-4" strokeWidth={2.5} />
            Geo intelligence cards
          </ShapeBadge>

          <h1 className="font-display mt-7 text-5xl font-extrabold leading-[0.94] tracking-[-0.07em] text-[color:var(--placedna-ink)] sm:text-6xl lg:text-7xl">
            Click any{" "}
            <span className="relative inline-block">
              place
              <svg
                className="absolute -bottom-5 left-0 h-4 w-full text-[color:var(--placedna-quaternary)]"
                viewBox="0 0 140 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 10C22 2 36 18 54 10C70 4 88 17 106 10C120 5 132 11 136 10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
            <br />
            Reveal its{" "}
            <span className="relative inline-flex items-center gap-2 text-[color:var(--placedna-accent)]">
              DNA
              <span className="shape-confetti static h-4 w-4 rotate-12 rounded-[6px] bg-[color:var(--placedna-secondary)] shadow-[2px_2px_0_0_var(--placedna-ink)]" />
            </span>
            .
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[color:var(--placedna-muted-foreground)] sm:text-xl">
            PlaceDNA turns any map location into a collectible geospatial card
            using vegetation, population pressure, built-up density, water
            access, connectivity, and landmark intelligence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <PopButton href="/map" size="lg" className="pl-6 pr-3">
              <span>Try the map</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[color:var(--placedna-accent)]">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </PopButton>
            <PopButton
              href="#sample-card"
              variant="secondary"
              size="lg"
              className="justify-center"
            >
              See sample card
            </PopButton>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {heroPills.map((pill) => (
              <ShapeBadge key={pill.label} tone={pill.tone} className="px-4 py-4 text-sm normal-case tracking-normal">
                {pill.label}
              </ShapeBadge>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
