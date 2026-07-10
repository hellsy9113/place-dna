import { SectionShell } from "../layout/SectionShell";
import { StickerCard } from "../ui/StickerCard";

const intelligenceNotes = [
  {
    title: "GIS-inspired place context",
    description:
      "PlaceDNA translates map coordinates into a readable place summary using vegetation, built-up density, water access, and connectivity-style signals.",
  },
  {
    title: "Remote-sensing friendly storytelling",
    description:
      "The cards are designed to feel collectible and playful while still reflecting location context rather than claiming formal scientific certification.",
  },
  {
    title: "Made for map exploration in India",
    description:
      "The current experience focuses on places in India so you can click, compare, and share location cards across cities, towns, and regional landscapes.",
  },
] as const;

export function LocationIntelligenceSection() {
  return (
    <SectionShell
      id="location-intelligence"
      eyebrow="Location intelligence"
      title="Built with GIS, maps, and location intelligence"
      description="PlaceDNA combines map interaction with GIS-inspired signals so every generated card stays readable, playful, and grounded in place context."
      tone="tertiary"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <StickerCard tone="neutral" hoverable={false}>
          <div className="card-body gap-4 p-6">
            <p className="text-base leading-8 text-[color:var(--placedna-muted-foreground)]">
              PlaceDNA is a map-first web app for exploring places in India
              through collectible cards. It turns clicked coordinates into a
              compact mix of place signals, nearby landmark context, and
              easy-to-scan scores that feel shareable without pretending to be a
              formal planning tool.
            </p>
            <p className="text-base leading-8 text-[color:var(--placedna-muted-foreground)]">
              Ready to try it?{" "}
              <a
                href="/map"
                className="font-bold text-[color:var(--placedna-accent)] underline decoration-2 underline-offset-4"
              >
                Generate your PlaceDNA card
              </a>{" "}
              and compare how different locations across India reveal different
              place identities.
            </p>
          </div>
        </StickerCard>

        <div className="grid gap-4">
          {intelligenceNotes.map((note) => (
            <StickerCard key={note.title} tone="secondary" hoverable={false}>
              <div className="card-body p-5">
                <h3 className="font-display text-xl font-extrabold text-[color:var(--placedna-ink)]">
                  {note.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--placedna-muted-foreground)]">
                  {note.description}
                </p>
              </div>
            </StickerCard>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
