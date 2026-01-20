/**
 * Provider-related constants and utilities
 * Centralized to avoid duplication across components
 */

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google Gemini',
  grok: 'Grok',
  ollama: 'Ollama (Local)',
};

export const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  openai: 'GPT-4, GPT-4o - Industry leading models with strong reasoning',
  anthropic: 'Claude - Long context window, excellent for complex analysis',
  google: 'Gemini - Free tier available, multimodal capabilities',
  grok: 'Grok - X.AI models with real-time information',
  ollama: 'Local LLMs - No cost, complete privacy, runs on your machine',
};

export const PROVIDER_DOCS: Record<string, string> = {
  openai: 'https://platform.openai.com/docs',
  anthropic: 'https://docs.anthropic.com/',
  google: 'https://ai.google.dev/docs',
  grok: 'https://docs.x.ai/',
  ollama: 'https://ollama.ai/',
};

/**
 * Get display name for a provider
 */
export const getProviderDisplayName = (providerName: string): string => {
  return PROVIDER_DISPLAY_NAMES[providerName] || providerName;
};

/**
 * Get short description for a provider
 */
export const getProviderDescription = (providerName: string): string => {
  return PROVIDER_DESCRIPTIONS[providerName] || 'AI Provider';
};
