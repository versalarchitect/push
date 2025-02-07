import { setTimeout } from "node:timers/promises";
import type { AnimationFrame, AnimationConfig } from "../types";
import { ANIMATION_CONFIG } from "../config";

export class AnimationService {
  private readonly frames: AnimationFrame[];
  private readonly successFrame: AnimationFrame;
  private readonly config: AnimationConfig;

  constructor(
    frames: AnimationFrame[],
    successFrame: AnimationFrame,
    config: AnimationConfig = ANIMATION_CONFIG
  ) {
    if (!frames.length) {
      throw new Error('Animation frames array cannot be empty');
    }

    this.frames = frames;
    this.successFrame = successFrame;
    this.config = this.validateConfig(config);
  }

  /**
   * Runs the animation sequence
   * @throws {Error} If animation is interrupted
   */
  async animate(): Promise<void> {
    try {
      let frameIndex = 0;
      const totalFrames = this.frames.length * this.config.totalSpins;
      
      while (frameIndex < totalFrames) {
        await this.renderFrame(frameIndex);
        frameIndex++;
      }

      this.renderSuccessFrame();
    } catch (error) {
      console.error('Animation interrupted:', error instanceof Error ? error.message : 'Unknown error');
      this.clearScreen();
    }
  }

  /**
   * Validates and normalizes animation config
   * @private
   */
  private validateConfig(config: AnimationConfig): AnimationConfig {
    if (config.totalSpins < 1) {
      throw new Error('Total spins must be at least 1');
    }
    if (!config.speeds.length) {
      throw new Error('Speeds array cannot be empty');
    }
    return {
      totalSpins: Math.max(1, config.totalSpins),
      speeds: config.speeds.map(speed => Math.max(1, speed))
    };
  }

  /**
   * Renders a single animation frame
   * @private
   */
  private async renderFrame(frameIndex: number): Promise<void> {
    this.clearScreen();
    console.log(this.frames[frameIndex % this.frames.length]);
    
    const speedIndex = Math.min(
      Math.floor(frameIndex / this.frames.length),
      this.config.speeds.length - 1
    );
    await setTimeout(this.config.speeds[speedIndex]);
  }

  /**
   * Renders the success frame
   * @private
   */
  private renderSuccessFrame(): void {
    this.clearScreen();
    console.log(this.successFrame);
  }

  /**
   * Clears the console screen
   * @private
   */
  private clearScreen(): void {
    console.clear();
  }
} 