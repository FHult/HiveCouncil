"""Grok (xAI) provider implementation."""
from openai import AsyncOpenAI
from typing import AsyncGenerator

from .base import AIProvider
from app.core.constants import PRICING, PROVIDER_CONFIGS


class GrokProvider(AIProvider):
    """Grok (xAI) API provider using OpenAI-compatible interface."""

    def __init__(self, api_key: str, model: str | None = None):
        """Initialize Grok provider."""
        super().__init__(api_key, model)
        # Grok uses OpenAI-compatible API with custom base URL
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=PROVIDER_CONFIGS["grok"]["base_url"]
        )
        self.name = "grok"

    async def stream_completion(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        image_data: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream completion from Grok."""
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            raise Exception(f"Grok API error: {str(e)}")

    def count_tokens(self, text: str) -> int:
        """Count tokens (rough estimate for Grok)."""
        try:
            # Rough estimate: 4 chars per token
            return len(text) // 4
        except Exception:
            return len(text) // 4

    def get_default_model(self) -> str:
        """Get default Grok model."""
        return PROVIDER_CONFIGS["grok"]["default_model"]

    def get_pricing(self) -> tuple[float, float]:
        """Get Grok pricing."""
        key = f"grok:{self.model}"
        return PRICING.get(key, (5.0, 15.0))  # Default to grok-beta pricing
