/**
 * TypeScript type definitions for HiveCouncil
 */

export interface Provider {
  name: string;
  current_model: string | null;
  default_model: string;
  available_models: string[];
  configured: boolean;
}

export interface ProvidersResponse {
  providers: Record<string, Provider>;
  configured_count: number;
}

export interface ModelConfig {
  provider: string;
  model: string;
}

export interface SessionConfig {
  prompt: string;
  chair: string;
  iterations: number;
  template: 'analytical' | 'creative' | 'technical' | 'balanced';
  preset: 'creative' | 'balanced' | 'precise';
  system_prompt?: string;
  autopilot: boolean;
  model_configs?: ModelConfig[];
}

export interface SessionResponse {
  session_id: string;
  status: string;
  created_at: string;
}

export interface Response {
  id: string;
  created_at: string;
  session_id: string;
  provider: string;
  model: string;
  content: string;
  iteration: number;
  role: 'council' | 'chair';
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  response_time_ms: number;
  error?: string;
}

export interface Session {
  id: string;
  created_at: string;
  updated_at: string;
  prompt: string;
  current_prompt?: string;
  chair_provider: string;
  total_iterations: number;
  current_iteration: number;
  merge_template: string;
  preset: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  autopilot: boolean;
  system_prompt?: string;
  user_guidance?: string;
}

export interface StreamEvent {
  type: string;
  provider?: string;
  model?: string;
  content?: string;
  iteration?: number;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost?: number;
  error?: string;
  error_code?: string;
}

export type Template = 'analytical' | 'creative' | 'technical' | 'balanced';
export type Preset = 'creative' | 'balanced' | 'precise';
