#!/usr/bin/env bun
import { GitService } from "./services/git";
import { AIService } from "./services/ai";
import { AnimationService } from "./services/animation";
import { ERROR_MESSAGES } from "./config";
import { frames, successFrame } from "./assets/frames";
import { GitOperationError, GitErrorCode } from "./types";

class PushCLI {
  private readonly git: GitService;
  private readonly ai: AIService;
  private readonly animation: AnimationService;

  constructor() {
    this.git = new GitService();
    this.ai = new AIService();
    this.animation = new AnimationService(frames, successFrame);
  }

  /**
   * Runs the push sequence
   */
  async run(): Promise<void> {
    try {
      await this.ensureChangesExist();
      await this.git.stageChanges();
      
      const message = await this.getCommitMessage();
      await this.commitAndPush(message);
      await this.animation.animate();
      
      process.exit(0);
    } catch (error) {
      this.handleError(error);
      process.exit(1);
    }
  }

  /**
   * Ensures there are changes to commit
   * @private
   */
  private async ensureChangesExist(): Promise<void> {
    if (!await this.git.hasChanges()) {
      console.log(ERROR_MESSAGES.NO_CHANGES);
      process.exit(0);
    }
  }

  /**
   * Gets commit message from args or generates with AI
   * @private
   */
  private async getCommitMessage(): Promise<string> {
    const userMessage = process.argv[2];
    if (userMessage) {
      return userMessage;
    }

    const diff = await this.git.getDiff();
    const aiMessage = await this.ai.generateCommitMessage(diff);
    
    if (aiMessage) {
      return aiMessage;
    }

    const files = await this.git.getStagedFiles();
    return this.git.formatDefaultMessage(files);
  }

  /**
   * Commits changes and pushes to remote
   * @private
   */
  private async commitAndPush(message: string): Promise<void> {
    await this.git.commit(message);
    console.log("🚀 Initiating push sequence...");
    await this.git.push();
  }

  /**
   * Handles errors and exits process
   * @private
   */
  private handleError(error: unknown): void {
    if (error instanceof GitOperationError) {
      // Log the main error message
      switch (error.code) {
        case GitErrorCode.AUTH_FAILED:
        case GitErrorCode.PERMISSION_DENIED:
          console.error(ERROR_MESSAGES[error.code]);
          console.log(ERROR_MESSAGES.AUTH_HELP);
          break;
          
        case GitErrorCode.NO_REMOTE:
        case GitErrorCode.REMOTE_NOT_FOUND:
        case GitErrorCode.REMOTE_DISCONNECTED:
          console.error(ERROR_MESSAGES[error.code]);
          console.log(ERROR_MESSAGES.REMOTE_HELP);
          break;
          
        case GitErrorCode.MERGE_CONFLICT:
          console.error(ERROR_MESSAGES.MERGE_CONFLICT);
          console.log(ERROR_MESSAGES.MERGE_HELP);
          break;
          
        case GitErrorCode.GIT_NOT_INSTALLED:
          console.error(ERROR_MESSAGES.GIT_NOT_INSTALLED);
          break;
          
        default:
          console.error(ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      // Log additional debug information if available
      if (error.originalError && process.env.DEBUG) {
        console.debug('Original error:', error.originalError);
      }
    } else if (error instanceof Error) {
      console.error(ERROR_MESSAGES.UNKNOWN_ERROR);
      if (process.env.DEBUG) {
        console.debug('Error details:', error);
      }
    } else {
      console.error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
}

// Run the CLI
new PushCLI().run().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
}); 