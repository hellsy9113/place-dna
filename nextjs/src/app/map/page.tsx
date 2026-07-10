import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

import { SideMenu } from "@/components/layout/SideMenu";
import { MapDemoClient } from "@/components/map/MapDemoClient";
import { PatternBackground } from "@/components/ui/PatternBackground";

export const metadata: Metadata = {
  title: "Generate a PlaceDNA Card",
  description:
    "Use the interactive map to generate a collectible location card for places in India using GIS-inspired context, landmarks, and place signals.",
  alternates: {
    canonical: "/map",
  },
  openGraph: {
    title: "Generate a PlaceDNA Card",
    description:
      "Click anywhere in India and generate a collectible GIS-inspired PlaceDNA card.",
    url: `${siteConfig.url}/map`,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "PlaceDNA map card generator preview",
      },
    ],
  },
};

export default function MapPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <PatternBackground />
      <div className="relative lg:grid lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <SideMenu />
        <main className="min-w-0">
          <MapDemoClient />
        </main>
      </div>
    </div>
  );
}
