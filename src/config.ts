import { AnimationConfig } from './types';

export const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
export const OLLAMA_MODEL = 'codellama';

export const ANIMATION_CONFIG: AnimationConfig = {
  totalSpins: 4,
  speeds: [120, 100, 80, 60]
};

export const DEFAULT_COMMIT_PREFIX = 'update';

export const AI_PROMPT = `As an AI commit message generator, analyze the following git diff and create a concise, meaningful commit message following these rules:
1. Use conventional commits format (feat, fix, docs, style, refactor, test, chore)
2. Keep the message under 100 characters
3. Focus on the main purpose of the changes
4. Be specific but concise
5. Use present tense, imperative mood

Here's the diff:

`;

export const ERROR_MESSAGES = {
  NO_CHANGES: "No changes to commit",
  AI_FAILED: "⚠️  AI commit message generation failed, falling back to default format",
  UNKNOWN_ERROR: "❌ An unknown error occurred",
  GIT_ERROR: "❌ Git operation failed: "
} as const; 