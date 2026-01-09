/**
 * Zustand store for session management
 */
import { create } from 'zustand';
import { sessionApi } from '@/lib/api';
import type { Session, Response, SessionConfig, StreamEvent } from '@/types';

interface SessionState {
  currentSession: Session | null;
  responses: Map<string, Response>; // provider -> response
  consensus: Response | null;
  isStreaming: boolean;
  isIterating: boolean;
  error: string | null;

  // Actions
  createSession: (config: SessionConfig) => Promise<void>;
  clearSession: () => void;
  handleStreamEvent: (event: StreamEvent) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  responses: new Map(),
  consensus: null,
  isStreaming: false,
  isIterating: false,
  error: null,

  createSession: async (config: SessionConfig) => {
    set({ error: null, isStreaming: true, responses: new Map(), consensus: null });

    try {
      const response = await sessionApi.createSession(config);

      // Create a basic session object
      const session: Session = {
        id: response.session_id,
        created_at: response.created_at,
        updated_at: response.created_at,
        prompt: config.prompt,
        chair_provider: config.chair,
        total_iterations: config.iterations,
        current_iteration: 0,
        merge_template: config.template,
        preset: config.preset,
        status: response.status as Session['status'],
        autopilot: config.autopilot,
        system_prompt: config.system_prompt,
      };

      set({ currentSession: session });

      // Note: Streaming will be implemented in Phase 4
      // For now, we'll just show the session was created
      setTimeout(() => {
        set({ isStreaming: false });
      }, 1000);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create session',
        isStreaming: false,
      });
    }
  },

  clearSession: () => {
    set({
      currentSession: null,
      responses: new Map(),
      consensus: null,
      isStreaming: false,
      isIterating: false,
      error: null,
    });
  },

  handleStreamEvent: (event: StreamEvent) => {
    // This will be implemented when we add SSE streaming in Phase 4
    console.log('Stream event:', event);
  },
}));
