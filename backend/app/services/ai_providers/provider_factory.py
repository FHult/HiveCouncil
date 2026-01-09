"""Factory for creating AI provider instances."""
from .base import AIProvider
from .openai_provider import OpenAIProvider
from app.core.config import settings


class ProviderFactory:
    """Factory for creating and managing AI providers."""

    def __init__(self):
        """Initialize provider factory."""
        self._providers: dict[str, AIProvider] = {}
        self._initialize_providers()

    def _initialize_providers(self):
        """Initialize all configured providers."""
        if settings.openai_api_key:
            self._providers["openai"] = OpenAIProvider(settings.openai_api_key)

        # Anthropic will be added in next phase
        # if settings.anthropic_api_key:
        #     self._providers["anthropic"] = AnthropicProvider(settings.anthropic_api_key)

        # Google will be added in next phase
        # if settings.google_api_key:
        #     self._providers["google"] = GoogleProvider(settings.google_api_key)

        # Grok will be added in next phase
        # if settings.grok_api_key:
        #     self._providers["grok"] = GrokProvider(settings.grok_api_key)

    def get_provider(self, name: str) -> AIProvider:
        """
        Get a provider by name.

        Args:
            name: Provider name (e.g., 'openai')

        Returns:
            AIProvider: The provider instance

        Raises:
            ValueError: If provider not found or not configured
        """
        if name not in self._providers:
            raise ValueError(f"Provider '{name}' not found or not configured")
        return self._providers[name]

    def get_all_providers(self) -> list[AIProvider]:
        """
        Get all configured providers.

        Returns:
            list[AIProvider]: List of all providers
        """
        return list(self._providers.values())

    def get_provider_names(self) -> list[str]:
        """
        Get names of all configured providers.

        Returns:
            list[str]: List of provider names
        """
        return list(self._providers.keys())

    def is_provider_configured(self, name: str) -> bool:
        """
        Check if a provider is configured.

        Args:
            name: Provider name

        Returns:
            bool: True if provider is configured
        """
        return name in self._providers
