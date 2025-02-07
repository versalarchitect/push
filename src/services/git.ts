import { spawnSync } from "node:child_process";
import type { GitError } from "../types";
import { GitErrorCode, GitOperationError } from "../types";

export class GitService {
  private async execCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    const process = spawnSync(command, args, { encoding: 'utf8' });
    
    // Handle process errors (e.g. git not found)
    if (process.error) {
      const error = process.error as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        throw new GitOperationError(
          GitErrorCode.UNKNOWN,
          'Git is not installed or not in PATH'
        );
      }
      throw new GitOperationError(
        GitErrorCode.NETWORK_ERROR,
        error.message,
        error
      );
    }

    // Handle non-zero exit codes
    if (process.status !== 0) {
      const stderr = process.stderr?.toString() || '';
      throw new GitOperationError(
        this.determineErrorCode(stderr),
        stderr || 'Command failed without error message',
        new Error(stderr)
      );
    }

    // Handle missing output
    if (!process.stdout && !process.stderr) {
      throw new GitOperationError(
        GitErrorCode.UNKNOWN,
        'Command produced no output'
      );
    }

    return {
      stdout: process.stdout?.toString() || '',
      stderr: process.stderr?.toString() || ''
    };
  }

  private determineErrorCode(stderr: string): GitErrorCode {
    const errorMessage = stderr.toLowerCase();
    
    if (errorMessage.includes('authentication') || errorMessage.includes('authorization')) {
      return GitErrorCode.AUTH_FAILED;
    }
    if (errorMessage.includes('remote') && errorMessage.includes('not found')) {
      return GitErrorCode.NO_REMOTE;
    }
    if (errorMessage.includes('merge conflict')) {
      return GitErrorCode.MERGE_CONFLICT;
    }
    if (errorMessage.includes('uncommitted changes')) {
      return GitErrorCode.UNCOMMITTED_CHANGES;
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return GitErrorCode.NETWORK_ERROR;
    }
    return GitErrorCode.UNKNOWN;
  }

  private handleGitError(error: unknown): never {
    if (error instanceof GitOperationError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new GitOperationError(
        GitErrorCode.UNKNOWN,
        error.message,
        error
      );
    }
    
    throw new GitOperationError(
      GitErrorCode.UNKNOWN,
      'An unknown error occurred during git operation'
    );
  }

  /**
   * Checks if remote origin exists
   * @private
   */
  private async hasRemoteOrigin(): Promise<boolean> {
    try {
      await this.execCommand('git', ['remote', 'get-url', 'origin']);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stages all changes in the working directory
   * @throws {GitError} If git add fails
   */
  async stageChanges(): Promise<void> {
    try {
      await this.execCommand('git', ['add', '.']);
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Gets the staged diff
   * @returns The git diff of staged changes
   * @throws {GitError} If git diff fails
   */
  async getDiff(): Promise<string> {
    try {
      const { stdout } = await this.execCommand('git', ['diff', '--staged']);
      return stdout.trim();
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Gets list of staged files
   * @returns Array of staged file paths
   * @throws {GitError} If git diff fails
   */
  async getStagedFiles(): Promise<string[]> {
    try {
      const { stdout } = await this.execCommand('git', ['diff', '--staged', '--name-only']);
      const files = stdout.trim();
      return files ? files.split('\n') : [];
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Creates a commit with the given message
   * @param message - The commit message
   * @throws {GitError} If git commit fails
   */
  async commit(message: string): Promise<void> {
    try {
      await this.execCommand('git', ['commit', '-m', message]);
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Pushes commits to remote
   * @throws {GitError} If push fails due to authentication or other issues
   */
  async push(): Promise<void> {
    try {
      // First check if remote origin exists
      if (!await this.hasRemoteOrigin()) {
        throw new Error(
          'No remote origin configured. Please set up a remote repository:\n\n' +
          '1. Create a repository on GitHub/GitLab/etc.\n' +
          '2. Then run one of these commands:\n\n' +
          '   # For a new repository:\n' +
          '   git remote add origin <repository-url>\n\n' +
          '   # For an existing repository:\n' +
          '   git remote set-url origin <repository-url>'
        );
      }

      // Get remote URL
      const { stdout: remoteUrl } = await this.execCommand('git', ['remote', 'get-url', 'origin']);
      
      // Check if using HTTPS
      const isHttps = remoteUrl.toString().startsWith('https://');
      
      if (isHttps) {
        // Try to push
        try {
          await this.execCommand('git', ['push']);
        } catch (error) {
          if (this.isAuthError(error)) {
            throw new Error(
              'GitHub authentication failed. Please try:\n' +
              '1. Use SSH instead of HTTPS: git remote set-url origin git@github.com:OWNER/REPO.git\n' +
              '2. Or setup GitHub CLI: gh auth login\n' +
              '3. Or configure git credentials: git config --global credential.helper store'
            );
          }
          throw error;
        }
      } else {
        // SSH or other protocol
        await this.execCommand('git', ['push']);
      }
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Checks if there are any changes in the working directory
   * @returns True if there are changes, false otherwise
   * @throws {GitError} If git status fails
   */
  async hasChanges(): Promise<boolean> {
    try {
      const { stdout } = await this.execCommand('git', ['status', '--porcelain']);
      return stdout.trim().length > 0;
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Formats a default commit message from file list
   * @param files - Array of file paths
   * @returns Formatted commit message
   */
  formatDefaultMessage(files: string[]): string {
    return `update: ${files.join(', ')}`;
  }

  /**
   * Type guard for GitError
   */
  isGitError(error: unknown): error is GitError {
    return error instanceof Error && 'code' in error;
  }

  /**
   * Checks if the error is an authentication error
   * @private
   */
  private isAuthError(error: unknown): boolean {
    if (error instanceof GitOperationError) {
      return error.code === GitErrorCode.AUTH_FAILED;
    }
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('authentication') || message.includes('authorization');
    }
    return false;
  }
} 