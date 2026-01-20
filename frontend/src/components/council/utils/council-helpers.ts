/**
 * Helper utilities for council member editor components
 */

// Re-export provider utilities from centralized location
export { PROVIDER_DISPLAY_NAMES, getProviderDisplayName } from '@/lib/providers';

export const CHAIR_RECOMMENDED_ARCHETYPES = ['synthesizer', 'strategist', 'balanced', 'analyst'];

/**
 * Generate a unique ID for a council member
 */
export const generateMemberId = (): string => {
  return `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Model RAM info type
 */
export interface ModelRAMInfo {
  [modelName: string]: {
    ram_required: number;
    can_run: boolean;
  };
}

/**
 * Get RAM requirements for a model (Ollama only)
 */
export const getModelRAM = (
  provider: string,
  model: string,
  modelRAMInfo: ModelRAMInfo
): { ram_required: number; can_run: boolean } | null => {
  if (provider !== 'ollama') return null;

  // Try exact match first
  if (modelRAMInfo[model]) {
    return modelRAMInfo[model];
  }

  // Try matching by base model name (before colon)
  // e.g., "llama3.1:latest" -> "llama3.1"
  const baseModel = model.split(':')[0];
  if (modelRAMInfo[baseModel]) {
    return modelRAMInfo[baseModel];
  }

  // Try fuzzy matching - check if any known model is a substring or vice versa
  for (const knownModel in modelRAMInfo) {
    if (model.includes(knownModel) || knownModel.includes(baseModel)) {
      return modelRAMInfo[knownModel];
    }
  }

  return null;
};
