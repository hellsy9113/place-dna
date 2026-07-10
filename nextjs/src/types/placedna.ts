import type { LucideIcon } from "lucide-react";

export type Rarity =
  | "Common"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Vulnerable";

export type DecorTone =
  | "neutral"
  | "accent"
  | "secondary"
  | "tertiary"
  | "quaternary";

export type StatTone =
  | "neutral"
  | "success"
  | "info"
  | "secondary"
  | "warning"
  | "error";

export type PlaceStat = {
  label: string;
  value: number;
  tone?: StatTone;
};

export type PlaceCardPreviewData = {
  title: string;
  rarity: Rarity;
  regionType: string;
  landmarkName: string;
  coordinates: string;
  stats: PlaceStat[];
  traits: string[];
};

export type PlaceDNAStats = {
  green_cover: number;
  population_pressure: number;
  built_up_density: number;
  water_access: number;
  connectivity: number;
  liveability: number;
};

export type PlaceDNALandmark = {
  name: string;
  distance_m: number | null;
  image_url: string | null;
};

export type PlaceDNALocation = {
  lat: number;
  lon: number;
  radius_m: number;
};

export type PlaceDNAResponse = {
  id: string;
  place_name: string;
  title: string;
  rarity: Rarity;
  region_type: string;
  stats: PlaceDNAStats;
  traits: string[];
  description: string;
  landmark: PlaceDNALandmark;
  location: PlaceDNALocation;
};

export type SelectedMapLocation = {
  lat: number;
  lon: number;
};

export type MapFocusRequest = {
  id: number;
  location: SelectedMapLocation;
};

export type NavLink = {
  label: string;
  href: string;
};

export type HeroPill = {
  label: string;
  tone: DecorTone;
};

export type ContentCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: DecorTone;
  label?: string;
};

export type RarityTier = {
  name: Rarity;
  description: string;
  signal: string;
  icon: LucideIcon;
  tone: DecorTone;
  spotlight?: boolean;
};

export type DemoStage = {
  title: string;
  description: string;
  tone: DecorTone;
};
