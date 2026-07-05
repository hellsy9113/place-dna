import type { ReactNode } from "react";

import type { NavLink } from "@/types/placedna";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PatternBackground } from "../ui/PatternBackground";

type AppShellProps = {
  children: ReactNode;
  brandHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  links?: NavLink[];
  showFooter?: boolean;
};

export function AppShell({
  children,
  brandHref = "/",
  ctaHref = "/map",
  ctaLabel = "Generate Card",
  links,
  showFooter = false,
}: AppShellProps) {
  return (
    <main id="top" className="relative overflow-x-clip pb-6">
      <PatternBackground />
      <Navbar
        brandHref={brandHref}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        links={links}
      />
      {children}
      {showFooter ? <Footer /> : null}
    </main>
  );
}
