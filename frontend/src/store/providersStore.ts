/**
 * Zustand store for provider and model management
 */
import { create } from 'zustand';
import { providersApi } from '@/lib/api';
import type { Provider, ModelConfig } from '@/types';

interface ProvidersState {
  providers: Record<string, Provider>;
  selectedModels: Record<string, string>; // provider -> model
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProviders: () => Promise<void>;
  setModelForProvider: (provider: string, model: string) => void;
  getModelConfigs: () => ModelConfig[];
  resetToDefaults: () => void;
}

export const useProvidersStore = create<ProvidersState>((set, get) => ({
  providers: {},
  selectedModels: {},
  isLoading: false,
  error: null,

  loadProviders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await providersApi.getProviders();

      // Initialize selectedModels with current models
      const selectedModels: Record<string, string> = {};
      Object.entries(data.providers).forEach(([name, provider]) => {
        if (provider.configured && provider.current_model) {
          selectedModels[name] = provider.current_model;
        } else {
          selectedModels[name] = provider.default_model;
        }
      });

      set({
        providers: data.providers,
        selectedModels,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load providers',
        isLoading: false,
      });
    }
  },

  setModelForProvider: (provider, model) => {
    set((state) => ({
      selectedModels: {
        ...state.selectedModels,
        [provider]: model,
      },
    }));
  },

  getModelConfigs: () => {
    const { providers, selectedModels } = get();
    const configs: ModelConfig[] = [];

    Object.entries(selectedModels).forEach(([provider, model]) => {
      // Only include configured providers
      if (providers[provider]?.configured) {
        configs.push({ provider, model });
      }
    });

    return configs;
  },

  resetToDefaults: () => {
    const { providers } = get();
    const selectedModels: Record<string, string> = {};

    Object.entries(providers).forEach(([name, provider]) => {
      selectedModels[name] = provider.default_model;
    });

    set({ selectedModels });
  },
}));
