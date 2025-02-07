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

export enum GitErrorCode {
  // Authentication & Authorization
  AUTH_FAILED = 'AUTH_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Remote Repository Issues
  NO_REMOTE = 'NO_REMOTE',
  REMOTE_NOT_FOUND = 'REMOTE_NOT_FOUND',
  REMOTE_DISCONNECTED = 'REMOTE_DISCONNECTED',
  
  // Local Repository Issues
  NOT_A_GIT_REPOSITORY = 'NOT_A_GIT_REPOSITORY',
  NO_COMMITS = 'NO_COMMITS',
  MERGE_CONFLICT = 'MERGE_CONFLICT',
  UNCOMMITTED_CHANGES = 'UNCOMMITTED_CHANGES',
  
  // Network & System Issues
  NETWORK_ERROR = 'NETWORK_ERROR',
  GIT_NOT_INSTALLED = 'GIT_NOT_INSTALLED',
  TIMEOUT = 'TIMEOUT',
  
  // Other
  UNKNOWN = 'UNKNOWN'
}

export class GitOperationError extends Error {
  constructor(
    public code: GitErrorCode,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GitOperationError';
  }
}

export type AnimationFrame = string;
export type AnimationSpeed = number;

export interface AnimationConfig {
  totalSpins: number;
  speeds: AnimationSpeed[];
} 