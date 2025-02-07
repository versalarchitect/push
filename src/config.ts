import type { AnimationConfig } from './types';

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
  // Operation Status
  NO_CHANGES: "✨ Working directory is clean - no changes to commit",
  AI_FAILED: "⚠️  AI commit message generation failed, falling back to default format",
  UNKNOWN_ERROR: "❌ An unexpected error occurred. Please try again or report this issue",
  
  // Authentication & Authorization
  AUTH_FAILED: "🔒 Authentication failed. Please check your credentials and try again",
  PERMISSION_DENIED: "🚫 Permission denied. Please check your repository access rights",
  
  // Remote Repository Issues
  NO_REMOTE: "🔗 Remote repository not configured. Run: git remote add origin <url>",
  REMOTE_NOT_FOUND: "❌ Remote repository not found. Please verify the repository URL",
  REMOTE_DISCONNECTED: "🔌 Lost connection to remote repository. Please check your internet connection",
  
  // Local Repository Issues
  NOT_A_GIT_REPOSITORY: "❗ Not a git repository. Run: git init",
  NO_COMMITS: "📝 No commits yet. Make your first commit to proceed",
  MERGE_CONFLICT: "⚠️  Merge conflicts detected. Please resolve conflicts and try again",
  UNCOMMITTED_CHANGES: "📋 You have uncommitted changes. Please commit or stash them first",
  
  // Network & System Issues
  NETWORK_ERROR: "🌐 Network error. Please check your internet connection",
  GIT_NOT_INSTALLED: "⚙️  Git is not installed. Please install Git and try again",
  TIMEOUT: "⏱️  Operation timed out. Please try again",
  
  // Detailed Help Messages
  AUTH_HELP: `
🔑 To fix authentication issues, try:
1. Use SSH instead of HTTPS:
   git remote set-url origin git@github.com:OWNER/REPO.git
2. Setup GitHub CLI:
   gh auth login
3. Configure git credentials:
   git config --global credential.helper store`,
   
  REMOTE_HELP: `
🔗 To configure remote repository:
1. Create a repository on GitHub/GitLab
2. Then run:
   git remote add origin <repository-url>
   git push -u origin main`,
   
  MERGE_HELP: `
🔍 To resolve merge conflicts:
1. View conflicting files:
   git status
2. Edit files to resolve conflicts
3. Stage resolved files:
   git add <file>
4. Complete the merge:
   git commit`
} as const; 