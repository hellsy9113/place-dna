CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS place_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    search_radius_m INTEGER NOT NULL DEFAULT 500,

    place_name TEXT,
    title TEXT,
    rarity TEXT,
    region_type TEXT,

    green_score INTEGER,
    population_pressure INTEGER,
    built_up_score INTEGER,
    water_access_score INTEGER,
    connectivity_score INTEGER,
    liveability_score INTEGER,

    traits JSONB DEFAULT '[]'::jsonb,
    description TEXT,

    landmark_name TEXT,
    landmark_distance_m DOUBLE PRECISION,
    landmark_image_url TEXT,

    geom GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_place_cards_geom
ON place_cards
USING GIST (geom);