import type { OllamaResponse } from "../types";
import { OLLAMA_API_URL, OLLAMA_MODEL, AI_PROMPT, ERROR_MESSAGES } from "../config";

export class AIService {
  private readonly url: string;
  private readonly model: string;

  constructor(url: string = OLLAMA_API_URL, model: string = OLLAMA_MODEL) {
    this.url = url;
    this.model = model;
  }

  /**
   * Generates a commit message using AI based on git diff
   * @param diff - The git diff to analyze
   * @returns Generated commit message or empty string if generation fails
   */
  async generateCommitMessage(diff: string): Promise<string> {
    if (!diff) {
      console.warn(ERROR_MESSAGES.AI_FAILED);
      return '';
    }

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: AI_PROMPT + diff,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as OllamaResponse;
      const message = data.response.trim();

      if (!message) {
        throw new Error('Empty response from AI service');
      }

      return message;
    } catch (error) {
      console.warn(ERROR_MESSAGES.AI_FAILED, error instanceof Error ? `: ${error.message}` : '');
      return '';
    }
  }
} 