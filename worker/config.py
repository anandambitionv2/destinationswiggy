from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_bus_connection_string: str
    service_bus_queue_name: str

    model_config = SettingsConfigDict(
        case_sensitive=False
    )


settings = Settings()