import { spawnSync } from "node:child_process";
import type { GitError } from "../types";

export class GitService {
  private async execCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    const process = spawnSync(command, args, { encoding: 'utf8' });
    if (process.error) {
      throw process.error;
    }
    if (process.status !== 0) {
      throw new Error(`Command failed: ${process.stderr}`);
    }
    return {
      stdout: process.stdout || '',
      stderr: process.stderr || ''
    };
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
      // First check if remote exists and is accessible
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
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      return (
        errorMsg.includes('authentication failed') ||
        errorMsg.includes('permission denied') ||
        errorMsg.includes('403') ||
        errorMsg.includes('401')
      );
    }
    return false;
  }

  /**
   * Handles git command errors
   * @private
   */
  private handleGitError(error: unknown): GitError {
    if (this.isGitError(error)) {
      return error;
    }
    if (error instanceof Error) {
      return Object.assign(error, { code: 1 }) as GitError;
    }
    return new Error('Git operation failed') as GitError;
  }
} 