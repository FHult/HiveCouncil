"""Provider API routes."""
from fastapi import APIRouter

from app.services.ai_providers import ProviderFactory
from app.core.constants import PROVIDER_CONFIGS

router = APIRouter()


@router.get("/providers")
async def get_providers():
    """
    Get list of configured providers and their available models.

    Returns:
        dict: Provider configuration information
    """
    factory = ProviderFactory()

    providers_info = {}
    for provider_name in factory.get_provider_names():
        provider = factory.get_provider(provider_name)
        available_models = PROVIDER_CONFIGS[provider_name].get("available_models", [])
        default_model = PROVIDER_CONFIGS[provider_name].get("default_model")

        providers_info[provider_name] = {
            "name": provider_name,
            "current_model": provider.get_model_name(),
            "default_model": default_model,
            "available_models": available_models,
            "configured": True,
        }

    # Add unconfigured providers
    for provider_name, config in PROVIDER_CONFIGS.items():
        if provider_name not in providers_info:
            providers_info[provider_name] = {
                "name": provider_name,
                "current_model": None,
                "default_model": config.get("default_model"),
                "available_models": config.get("available_models", []),
                "configured": False,
            }

    return {
        "providers": providers_info,
        "configured_count": len(factory.get_provider_names()),
    }


@router.get("/providers/{provider_name}/models")
async def get_provider_models(provider_name: str):
    """
    Get available models for a specific provider.

    Args:
        provider_name: Name of the provider (openai, anthropic, google, grok)

    Returns:
        dict: Available models for the provider
    """
    if provider_name not in PROVIDER_CONFIGS:
        return {"error": f"Provider '{provider_name}' not found"}, 404

    config = PROVIDER_CONFIGS[provider_name]

    return {
        "provider": provider_name,
        "default_model": config.get("default_model"),
        "available_models": config.get("available_models", []),
    }
