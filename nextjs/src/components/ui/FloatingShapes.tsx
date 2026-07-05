import { cn } from "@/lib/utils";

type FloatingShapesProps = {
  className?: string;
  variant?: "page" | "hero" | "cta" | "visual";
};

const variantClasses: Record<NonNullable<FloatingShapesProps["variant"]>, string> = {
  page: "",
  hero: "",
  cta: "",
  visual: "",
};

export function FloatingShapes({
  className,
  variant = "page",
}: FloatingShapesProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 hidden lg:block", variantClasses[variant], className)}
    >
      <div className="shape-confetti left-[6%] top-20 h-10 w-10 rotate-12 rounded-[14px] bg-[color:var(--placedna-secondary)]" />
      <div className="shape-confetti left-[18%] top-44 h-56 w-56 rounded-full bg-[color:var(--placedna-tertiary)]" />
      <div className="shape-confetti right-[10%] top-28 h-6 w-28 rounded-full bg-[color:var(--placedna-quaternary)]" />
      <div className="shape-confetti right-[14%] top-[32rem] h-12 w-12 rotate-[18deg] rounded-[16px] bg-[color:var(--placedna-accent)]" />
      <div className="shape-confetti left-[9%] bottom-20 h-8 w-24 rounded-full bg-[color:var(--placedna-tertiary)]" />
      <svg
        className="absolute right-[20%] top-[12rem] h-20 w-24 text-[color:var(--placedna-accent)]"
        viewBox="0 0 120 80"
        fill="none"
      >
        <path
          d="M5 40C25 10 45 70 65 40C85 10 105 70 115 40"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <div className="pattern-dots absolute right-[6%] bottom-24 h-28 w-28 rounded-full opacity-70" />
    </div>
  );
}
