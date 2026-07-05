import { SideMenu } from "@/components/layout/SideMenu";
import { MapDemoClient } from "@/components/map/MapDemoClient";
import { PatternBackground } from "@/components/ui/PatternBackground";

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
