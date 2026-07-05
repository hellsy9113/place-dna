import {
  Building2,
  Gem,
  Globe2,
  Landmark,
  Layers3,
  Leaf,
  LocateFixed,
  MapPinned,
  Network,
  Radar,
  ShieldAlert,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";

import type {
  ContentCard,
  DemoStage,
  HeroPill,
  NavLink,
  PlaceCardPreviewData,
  RarityTier,
} from "@/types/placedna";

export const navLinks: NavLink[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Card DNA", href: "#card-dna" },
  { label: "Rarity", href: "#rarity" },
  { label: "Demo", href: "#demo" },
];

export const heroPills: HeroPill[] = [
  { label: "Remote sensing", tone: "quaternary" },
  { label: "GIS scoring", tone: "accent" },
  { label: "Landmark intelligence", tone: "secondary" },
  { label: "Rarity engine", tone: "tertiary" },
];

export const workflowSteps: ContentCard[] = [
  {
    title: "Click a spot",
    description:
      "Pick any point on the map and drop a marker to start the place scan.",
    icon: MapPinned,
    tone: "tertiary",
    label: "Step 01",
  },
  {
    title: "Analyze geospatial layers",
    description:
      "Vegetation, density, routes, water, and context combine into a readable location profile.",
    icon: Layers3,
    tone: "accent",
    label: "Step 02",
  },
  {
    title: "Generate a PlaceDNA card",
    description:
      "The clicked location becomes a playful collectible with traits, stats, and rarity.",
    icon: Sparkles,
    tone: "quaternary",
    label: "Step 03",
  },
];

export const revealCards: ContentCard[] = [
  {
    title: "Vegetation",
    description: "Green cover and ecological texture around the selected point.",
    icon: Leaf,
    tone: "quaternary",
    label: "Layer 01",
  },
  {
    title: "Population pressure",
    description: "Human intensity and crowding pressure close to the chosen place.",
    icon: Users,
    tone: "secondary",
    label: "Layer 02",
  },
  {
    title: "Built-up density",
    description: "How compact, vertical, and infrastructure-heavy the place feels.",
    icon: Building2,
    tone: "accent",
    label: "Layer 03",
  },
  {
    title: "Water access",
    description: "Relative nearness to rivers, lakes, coastlines, or water-linked comfort.",
    icon: Waves,
    tone: "tertiary",
    label: "Layer 04",
  },
  {
    title: "Connectivity",
    description: "Street access, movement links, and route reach around the point.",
    icon: Network,
    tone: "quaternary",
    label: "Layer 05",
  },
  {
    title: "Region type",
    description: "Urban, peri-urban, rural, ecological, industrial, or mixed identity.",
    icon: Globe2,
    tone: "accent",
    label: "Layer 06",
  },
  {
    title: "Nearby landmark",
    description: "The strongest local anchor that gives the place its story.",
    icon: Landmark,
    tone: "secondary",
    label: "Layer 07",
  },
  {
    title: "Rarity",
    description: "A collectible tier based on uniqueness, intensity, and pressure.",
    icon: Gem,
    tone: "tertiary",
    label: "Layer 08",
  },
];

export const rarityTiers: RarityTier[] = [
  {
    name: "Common",
    description: "Ordinary balanced places.",
    signal: "Steady, everyday places with familiar local patterns.",
    icon: Radar,
    tone: "neutral",
  },
  {
    name: "Rare",
    description: "Places with one standout trait.",
    signal: "A single signal clearly rises above the surrounding baseline.",
    icon: LocateFixed,
    tone: "quaternary",
  },
  {
    name: "Epic",
    description: "Strong mix of multiple traits.",
    signal: "Several geospatial layers reinforce each other into a memorable profile.",
    icon: Sparkles,
    tone: "accent",
  },
  {
    name: "Legendary",
    description: "Iconic or exceptional places.",
    signal: "Landmarks, context, and intensity combine into a standout identity.",
    icon: Gem,
    tone: "tertiary",
    spotlight: true,
  },
  {
    name: "Vulnerable",
    description: "Stressed or pressure-zone places.",
    signal: "Signals point to fragility, low comfort, or environmental pressure.",
    icon: ShieldAlert,
    tone: "secondary",
  },
];

export const samplePlaceCard: PlaceCardPreviewData = {
  title: "Heritage Urban Core",
  rarity: "Legendary",
  regionType: "Urban / Heritage",
  landmarkName: "Nearby: India Gate",
  coordinates: "28.6129N / 77.2295E",
  stats: [
    { label: "Green Cover", value: 58, tone: "success" },
    { label: "Population Pressure", value: 72, tone: "secondary" },
    { label: "Built-up Density", value: 81, tone: "secondary" },
    { label: "Water Access", value: 34, tone: "info" },
    { label: "Connectivity", value: 91, tone: "info" },
    { label: "Liveability", value: 63, tone: "warning" },
  ],
  traits: ["Urban", "Heritage", "Dense", "Connected"],
};

export const demoStages: DemoStage[] = [
  {
    title: "Point selection",
    description: "Choose a real-world location and pin it as the input signal.",
    tone: "tertiary",
  },
  {
    title: "Layer intelligence",
    description:
      "Vegetation, density, routes, water, and landmarks get turned into a score stack.",
    tone: "accent",
  },
  {
    title: "Trait synthesis",
    description:
      "The place receives readable traits so the outcome feels like a story, not a spreadsheet.",
    tone: "quaternary",
  },
  {
    title: "Rarity reveal",
    description:
      "Each place lands in a collectible rarity tier that makes the result memorable.",
    tone: "secondary",
  },
];
