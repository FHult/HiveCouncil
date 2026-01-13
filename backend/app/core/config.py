"""Application configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )

    # API Keys
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    google_api_key: str | None = None
    grok_api_key: str | None = None

    # Model Selection (optional - will use defaults if not specified)
    openai_model: str | None = None
    anthropic_model: str | None = None
    google_model: str | None = None
    grok_model: str | None = None

    # Database
    database_url: str = "sqlite+aiosqlite:///./hivecouncil.db"

    # Default Settings
    default_chair: str = "anthropic"
    default_iterations: int = 3
    default_template: str = "balanced"
    default_preset: str = "balanced"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @property
    def configured_providers(self) -> list[str]:
        """Return list of providers with valid API keys or local providers."""
        providers = []
        if self.openai_api_key:
            providers.append("openai")
        if self.anthropic_api_key:
            providers.append("anthropic")
        if self.google_api_key:
            providers.append("google")
        if self.grok_api_key:
            providers.append("grok")

        # Always include Ollama (local, no API key needed)
        providers.append("ollama")

        return providers


settings = Settings()
