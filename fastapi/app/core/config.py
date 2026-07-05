from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str

    overpass_api_url: str = "https://overpass-api.de/api/interpreter"
    wikidata_api_url: str = "https://www.wikidata.org/w/api.php"
    landmark_lookup_timeout_seconds: int = 8

    frontend_origin: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()