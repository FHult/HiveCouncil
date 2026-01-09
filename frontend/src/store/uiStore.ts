/**
 * Zustand store for UI state
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  showModelSelector: boolean;
  showAdvancedOptions: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleModelSelector: () => void;
  toggleAdvancedOptions: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      showModelSelector: false,
      showAdvancedOptions: false,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) => set({ theme }),

      toggleModelSelector: () =>
        set((state) => ({ showModelSelector: !state.showModelSelector })),

      toggleAdvancedOptions: () =>
        set((state) => ({ showAdvancedOptions: !state.showAdvancedOptions })),
    }),
    {
      name: 'hivecouncil-ui',
    }
  )
);
