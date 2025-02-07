import { setTimeout } from "node:timers/promises";
import type { AnimationConfig } from "../types";
import { ANIMATION_CONFIG } from "../config";

const CUBE_FRAMES = [
  // Frame 1: Front view
  `
     ┌───────────┐
     │  PUSHING  │
     │    TO     │
     │   GIT     │
     │   ...     │
     └───────────┘
  `,
  // Frame 2: Right tilt
  `
     ┌───────────┐
     │  PUSHING ╱│
     │    TO   ╱ │
     │   GIT  ╱  │
     │  ...  ╱   │
     └──────╱────┘
  `,
  // Frame 3: Full right
  `
     ┌───────────┐
     │╲  PUSHING │
     │ ╲   TO    │
     │  ╲  GIT   │
     │   ╲ ...   │
     └────╲──────┘
  `,
  // Frame 4: Left tilt
  `
     ┌───────────┐
     │╱ PUSHING  │
     │╱   TO     │
     │╱   GIT    │
     │╱   ...    │
     └╱──────────┘
  `
];

export class AnimationService {
  private readonly config: AnimationConfig;
  private isAnimating = false;

  constructor(config: AnimationConfig = ANIMATION_CONFIG) {
    this.config = this.validateConfig(config);
  }

  /**
   * Runs the animation sequence
   * @throws {Error} If animation is interrupted
   */
  async animate(): Promise<void> {
    if (this.isAnimating) {
      return;
    }

    try {
      this.isAnimating = true;
      let frameIndex = 0;
      const totalFrames = CUBE_FRAMES.length * this.config.totalSpins;

      // Clear any previous output
      console.clear();
      
      while (frameIndex < totalFrames && this.isAnimating) {
        const currentFrame = CUBE_FRAMES[frameIndex % CUBE_FRAMES.length];
        if (currentFrame) {
          this.renderFrame(currentFrame);
          await setTimeout(this.getSpeed(frameIndex));
        }
        frameIndex++;
      }

      // Show success message
      if (this.isAnimating) {
        console.clear();
        console.log(`
     ✨ Push completed! ✨
     
     ┌─────────────┐
     │  SUCCESS!   │
     │   🚀 → 🌟   │
     └─────────────┘
        `);
      }
    } catch (error) {
      console.error('Animation interrupted:', error instanceof Error ? error.message : 'Unknown error');
      this.clearScreen();
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Stops the animation
   */
  stop(): void {
    this.isAnimating = false;
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
   * Gets the current animation speed based on progress
   * @private
   */
  private getSpeed(frameIndex: number): number {
    const progress = frameIndex / (CUBE_FRAMES.length * this.config.totalSpins);
    const speedIndex = Math.min(
      Math.floor(progress * this.config.speeds.length),
      this.config.speeds.length - 1
    );
    return this.config.speeds[speedIndex] ?? 100; // Fallback to 100ms if undefined
  }

  /**
   * Renders a single animation frame
   * @private
   */
  private renderFrame(frame: string): void {
    this.clearScreen();
    console.log("\n");  // Add some padding
    console.log(frame);
    console.log("\n");
  }

  /**
   * Clears the console screen
   * @private
   */
  private clearScreen(): void {
    console.clear();
  }
} 