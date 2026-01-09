"""OpenAI provider implementation."""
import tiktoken
from openai import AsyncOpenAI
from typing import AsyncGenerator

from .base import AIProvider
from app.core.constants import PRICING, PROVIDER_CONFIGS


class OpenAIProvider(AIProvider):
    """OpenAI API provider."""

    def __init__(self, api_key: str, model: str | None = None):
        """Initialize OpenAI provider."""
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)
        self.name = "openai"

        # Initialize tokenizer
        try:
            self.tokenizer = tiktoken.encoding_for_model(self.model)
        except KeyError:
            # Fallback to cl100k_base for unknown models
            self.tokenizer = tiktoken.get_encoding("cl100k_base")

    async def stream_completion(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> AsyncGenerator[str, None]:
        """Stream completion from OpenAI."""
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
            raise Exception(f"OpenAI API error: {str(e)}")

    def count_tokens(self, text: str) -> int:
        """Count tokens using tiktoken."""
        try:
            return len(self.tokenizer.encode(text))
        except Exception:
            # Fallback: rough estimate (4 chars per token)
            return len(text) // 4

    def get_default_model(self) -> str:
        """Get default OpenAI model."""
        return PROVIDER_CONFIGS["openai"]["default_model"]

    def get_pricing(self) -> tuple[float, float]:
        """Get OpenAI pricing."""
        key = f"openai:{self.model}"
        return PRICING.get(key, (5.0, 15.0))  # Default to gpt-4o pricing
