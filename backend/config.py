from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_bus_connection_string: str
    service_bus_queue_name: str

    class Config:
        env_file = ".env"  # Used locally. In AKS, use environment variables.


settings = Settings()