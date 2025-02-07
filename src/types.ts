export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_duration: number;
}

export interface GitError extends Error {
  code: number;
  cmd?: string;
}

export type AnimationFrame = string;
export type AnimationSpeed = number;

export interface AnimationConfig {
  totalSpins: number;
  speeds: AnimationSpeed[];
} 