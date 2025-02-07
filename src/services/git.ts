import { $ } from "bun";
import type { GitError } from "../types";

export class GitService {
  /**
   * Stages all changes in the working directory
   * @throws {GitError} If git add fails
   */
  async stageChanges(): Promise<void> {
    try {
      await $`git add .`;
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
      const { stdout } = await $`git diff --staged`;
      return stdout.toString().trim();
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
      const { stdout } = await $`git diff --staged --name-only`;
      const files = stdout.toString().trim();
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
      await $`git commit -m ${message}`;
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Pushes commits to remote
   * @throws {GitError} If git push fails
   */
  async push(): Promise<void> {
    try {
      await $`git push`;
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
      const { stdout } = await $`git status --porcelain`;
      return stdout.toString().trim().length > 0;
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
   * Handles git command errors
   * @private
   */
  private handleGitError(error: unknown): GitError {
    if (this.isGitError(error)) {
      return error;
    }
    return new Error('Git operation failed') as GitError;
  }
} 