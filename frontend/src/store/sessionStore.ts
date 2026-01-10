/**
 * Zustand store for session management with SSE streaming
 */
import { create } from 'zustand';
import type { SessionConfig, StreamEvent, CouncilResponse, SessionState as SessionStateType } from '@/types';

interface SessionStore extends SessionStateType {
  // Actions
  startSession: (config: SessionConfig) => Promise<void>;
  clearSession: () => void;
  handleStreamEvent: (event: StreamEvent) => void;
}

const API_BASE_URL = 'http://localhost:8000/api';

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionId: null,
  status: 'idle',
  currentIteration: 1,
  totalIterations: 1,
  responses: [],
  mergedResponses: [],
  statusMessage: '',
  totalCost: 0,
  totalTokens: { input: 0, output: 0 },
  error: undefined,

  startSession: async (config: SessionConfig) => {
    // Reset state
    set({
      sessionId: null,
      status: 'running',
      currentIteration: 1,
      totalIterations: config.iterations,
      responses: [],
      mergedResponses: [],
      statusMessage: 'Initializing council session...',
      totalCost: 0,
      totalTokens: { input: 0, output: 0 },
      error: undefined,
    });

    try {
      // Create SSE connection
      const response = await fetch(`${API_BASE_URL}/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        // Process each line
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event: StreamEvent = JSON.parse(data);
              get().handleStreamEvent(event);
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
      }
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to create session',
        statusMessage: 'Session failed',
      });
    }
  },

  handleStreamEvent: (event: StreamEvent) => {
    const state = get();

    switch (event.type) {
      case 'session_created':
        set({
          sessionId: event.session_id || null,
          statusMessage: 'Session created, starting council...',
        });
        break;

      case 'status':
        set({
          statusMessage: event.message || '',
        });
        break;

      case 'initial_response':
        if (event.done && event.provider && event.content) {
          const newResponse: CouncilResponse = {
            id: event.response_id || Date.now(),
            provider: event.provider,
            content: event.content,
            iteration: event.iteration || 1,
            type: 'initial_response',
            tokens: event.tokens || { input: 0, output: 0 },
            cost: event.cost || 0,
          };

          set({
            responses: [...state.responses, newResponse],
            totalCost: state.totalCost + (event.cost || 0),
            totalTokens: {
              input: state.totalTokens.input + (event.tokens?.input || 0),
              output: state.totalTokens.output + (event.tokens?.output || 0),
            },
            statusMessage: `Received response from ${event.provider}`,
          });
        }
        break;

      case 'merge':
        if (event.done && event.provider && event.content) {
          const mergedResponse: CouncilResponse = {
            id: event.response_id || Date.now(),
            provider: event.provider,
            content: event.content,
            iteration: event.iteration || 1,
            type: 'merge',
            tokens: event.tokens || { input: 0, output: 0 },
            cost: event.cost || 0,
          };

          set({
            mergedResponses: [...state.mergedResponses, mergedResponse],
            totalCost: state.totalCost + (event.cost || 0),
            totalTokens: {
              input: state.totalTokens.input + (event.tokens?.input || 0),
              output: state.totalTokens.output + (event.tokens?.output || 0),
            },
            statusMessage: `Chair merged responses for iteration ${event.iteration}`,
            currentIteration: event.iteration || 1,
          });
        }
        break;

      case 'feedback':
        if (event.done && event.provider && event.content) {
          const feedbackResponse: CouncilResponse = {
            id: event.response_id || Date.now(),
            provider: event.provider,
            content: event.content,
            iteration: event.iteration || 1,
            type: 'feedback',
            tokens: event.tokens || { input: 0, output: 0 },
            cost: event.cost || 0,
          };

          set({
            responses: [...state.responses, feedbackResponse],
            totalCost: state.totalCost + (event.cost || 0),
            totalTokens: {
              input: state.totalTokens.input + (event.tokens?.input || 0),
              output: state.totalTokens.output + (event.tokens?.output || 0),
            },
            statusMessage: `Received feedback from ${event.provider} for iteration ${event.iteration}`,
          });
        }
        break;

      case 'complete':
        set({
          status: 'completed',
          statusMessage: 'Council session completed!',
        });
        break;

      case 'error':
        set({
          status: 'error',
          error: event.message || 'Unknown error occurred',
          statusMessage: 'Session failed',
        });
        break;
    }
  },

  clearSession: () => {
    set({
      sessionId: null,
      status: 'idle',
      currentIteration: 1,
      totalIterations: 1,
      responses: [],
      mergedResponses: [],
      statusMessage: '',
      totalCost: 0,
      totalTokens: { input: 0, output: 0 },
      error: undefined,
    });
  },
}));
