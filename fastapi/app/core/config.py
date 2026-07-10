from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str

    overpass_api_url: str = "https://overpass-api.de/api/interpreter"
    wikidata_api_url: str = "https://www.wikidata.org/w/api.php"
    landmark_lookup_timeout_seconds: float = 8.0
    landmark_lookup_connect_timeout_seconds: float = 5.0
    landmark_lookup_read_timeout_seconds: float = 8.0
    landmark_lookup_write_timeout_seconds: float = 5.0
    landmark_lookup_pool_timeout_seconds: float = 5.0

    frontend_origin: str | None = None
    allowed_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "https://place-dna.vercel.app"
    )
    prewarm_enable_fixed_seeds: bool = True
    prewarm_enable_random_india: bool = True
    prewarm_random_count: int = 10
    prewarm_random_seed: int | None = None
    prewarm_batch_size: int = 20
    prewarm_sleep_seconds: float = 3.0
    prewarm_cache_distance_m: int = 300
    prewarm_max_age_days: int = 30
    prewarm_force_refresh: bool = False
    prewarm_dry_run: bool = False
    prewarm_min_certainty_score: float = 0.65
    prewarm_validate_candidates: bool = True
    prewarm_skip_vague_cards: bool = True
    production_validate_clicks: bool = True
    production_skip_external_api_for_invalid_clicks: bool = True
    production_cache_only_useful_cards: bool = True
    production_min_certainty_score: float = 0.25

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
