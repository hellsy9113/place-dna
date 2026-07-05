from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictFloat, StrictInt, StrictStr

Rarity = Literal["Common", "Rare", "Epic", "Legendary", "Vulnerable"]


class PlaceDNAStats(BaseModel):
    model_config = ConfigDict(extra="forbid")

    green_cover: StrictInt = Field(ge=0, le=100)
    population_pressure: StrictInt = Field(ge=0, le=100)
    built_up_density: StrictInt = Field(ge=0, le=100)
    water_access: StrictInt = Field(ge=0, le=100)
    connectivity: StrictInt = Field(ge=0, le=100)
    liveability: StrictInt = Field(ge=0, le=100)


class PlaceDNALandmark(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: StrictStr
    distance_m: float | None = Field(default=None, ge=0)
    image_url: StrictStr | None = None
    source: StrictStr | None = None
    osm_type: StrictStr | None = None
    osm_id: StrictInt | None = None
    wikidata_id: StrictStr | None = None


class PlaceDNALocation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lat: StrictFloat = Field(ge=-90, le=90)
    lon: StrictFloat = Field(ge=-180, le=180)
    radius_m: StrictInt = Field(ge=100, le=2000)


class PlaceDNAResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID | None = None
    place_name: StrictStr
    title: StrictStr
    rarity: Rarity
    region_type: StrictStr
    stats: PlaceDNAStats
    traits: list[StrictStr]
    description: StrictStr
    landmark: PlaceDNALandmark
    location: PlaceDNALocation
