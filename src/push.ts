#!/usr/bin/env bun
import { GitService } from "./services/git";
import { AIService } from "./services/ai";
import { AnimationService } from "./services/animation";
import { ERROR_MESSAGES } from "./config";
import { frames, successFrame } from "./assets/frames";

async function main() {
  const git = new GitService();
  const ai = new AIService();
  const animation = new AnimationService(frames, successFrame);

  try {
    // Check for changes
    if (!await git.hasChanges()) {
      console.log(ERROR_MESSAGES.NO_CHANGES);
      process.exit(0);
    }

    // Stage changes
    await git.stageChanges();

    // Get commit message from args or generate with AI
    const message = process.argv[2] || await generateMessage(git, ai);
    
    // Commit and push
    await git.commit(message);
    console.log("🚀 Initiating push sequence...");
    await git.push();
    
    // Show success animation
    await animation.animate();
  } catch (error) {
    handleError(error, git);
  }
}

async function generateMessage(git: GitService, ai: AIService): Promise<string> {
  const diff = await git.getDiff();
  const aiMessage = await ai.generateCommitMessage(diff);
  
  if (aiMessage) {
    return aiMessage;
  }
  
  // Fallback to files list
  const files = await git.getStagedFiles();
  return git.formatDefaultMessage(files);
}

function handleError(error: unknown, git: GitService): never {
  if (git.isGitError(error)) {
    console.error(ERROR_MESSAGES.GIT_ERROR, error.message);
  } else if (error instanceof Error) {
    console.error("❌ Error:", error.message);
  } else {
    console.error(ERROR_MESSAGES.UNKNOWN_ERROR);
  }
  process.exit(1);
}

main(); 