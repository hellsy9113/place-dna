import { ShapeBadge } from "@/components/ui/ShapeBadge";

type PlaceTraitListProps = {
  traits: string[];
};

const traitTones = ["accent", "secondary", "tertiary", "quaternary"] as const;

export function PlaceTraitList({ traits }: PlaceTraitListProps) {
  return (
    <div className="flex flex-wrap gap-2 print:gap-1.5">
      {traits.map((trait, index) => (
        <ShapeBadge
          key={trait}
          tone={traitTones[index % traitTones.length]}
          className="px-3 py-3 text-[0.68rem] tracking-[0.18em] print:px-2 print:py-1.5 print:text-[0.52rem]"
        >
          {trait}
        </ShapeBadge>
      ))}
    </div>
  );
}
