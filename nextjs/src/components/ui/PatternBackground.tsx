import { FloatingShapes } from "./FloatingShapes";

export function PatternBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-dot-grid absolute inset-0" />
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.34),transparent_68%)]" />
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.18),transparent_70%)]" />
      <FloatingShapes variant="page" />
    </div>
  );
}
