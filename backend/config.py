from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # Service Bus
    service_bus_namespace: str
    service_bus_queue_name: str

    # SQL
    sql_connection_string: str

    class Config:
        env_file = ".env"   # Used locally. In AKS, use environment variables.


settings = Settings()
