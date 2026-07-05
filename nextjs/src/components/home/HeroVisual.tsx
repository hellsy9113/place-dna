import { samplePlaceCard } from "@/data/homepage";

import { MockMapPanel } from "../placedna/MockMapPanel";
import { PlaceCardPreview } from "../placedna/PlaceCardPreview";
import { FloatingShapes } from "../ui/FloatingShapes";

export function HeroVisual() {
  return (
    <div id="demo-panel" className="relative mx-auto w-full max-w-[700px]">
      <FloatingShapes variant="visual" className="opacity-70" />
      <div className="pattern-dots absolute -left-6 top-10 hidden h-48 w-48 rounded-full opacity-65 md:block" />

      <div className="relative min-h-[640px]">
        <div className="md:pr-24">
          <MockMapPanel />
        </div>
        <div className="relative -mt-[4.75rem] ml-auto w-[92%] max-w-[390px] md:absolute md:-bottom-4 md:right-0 md:mt-0 md:rotate-[4deg]">
          <PlaceCardPreview data={samplePlaceCard} id="sample-card" />
        </div>
      </div>
    </div>
  );
}
