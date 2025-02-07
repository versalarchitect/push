#!/usr/bin/env bun
import { $ } from "bun";
import { setTimeout } from "node:timers/promises";

const frames = [
  `
       ┌───────────────────┐
       │  ░░░░░░░░░░░░░░░ │▒
       │  ░    PUSH    ░░░ │▒
       │  ░░░░░░░░░░░░░░░ │▒
       │                   │▒
       │  ▒▒▒▒▒▒▒▒▒▒▒▒▒   │▒
       │  ▒ PUSHING! ▒    │▒
       │  ▒▒▒▒▒▒▒▒▒▒▒▒▒   │▒
       │                   │▒
       │   ███████████    │▒
       │   █ TO GIT █     │▒
       │   ███████████    │▒
       └───────────────────┘▒
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
         ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
  `,
  `
       ┌───────────────────┐
       │  ███████████████  │░
       │  █    PUSH    █  │░
       │  ███████████████  │░
       │                   │░
       │  ░░░░░░░░░░░░░   │░
       │  ░ PUSHING! ░    │░
       │  ░░░░░░░░░░░░░   │░
       │                   │░
       │   ▒▒▒▒▒▒▒▒▒     │░
       │   ▒ TO GIT ▒     │░
       │   ▒▒▒▒▒▒▒▒▒     │░
       └───────────────────┘░
        ░░░░░░░░░░░░░░░░░░░░
         ░░░░░░░░░░░░░░░░░░
  `,
  `
       ┌───────────────────┐
       │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │█
       │  ▒    PUSH    ▒  │█
       │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │█
       │                   │█
       │  ███████████████  │█
       │  █  PUSHING! █   │█
       │  ███████████████  │█
       │                   │█
       │   ░░░░░░░░░░░    │█
       │   ░ TO GIT  ░    │█
       │   ░░░░░░░░░░░    │█
       └───────────────────┘█
        ████████████████████
         ██████████████████
  `,
  `
         ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
        ▒░░░░░░░░░░░░░░░░▒
       ▒│   ░░░░░░░░░   │▒
       ▒│   ░  PUSH  ░   │▒
       ▒│   ░░░░░░░░░   │▒
       ▒│                │▒
       ▒│   ▒▒▒▒▒▒▒▒▒   │▒
       ▒│   ▒PUSHING!▒   │▒
       ▒│   ▒▒▒▒▒▒▒▒▒   │▒
       ▒│                │▒
       ▒│   █████████   │▒
       ▒│   █TO GIT█    │▒
       ▒│   █████████   │▒
        ▒└──────────────┘▒
         ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
  `,
  `
         ██████████████████
        █░░░░░░░░░░░░░░░░█
       █│    ▒▒▒▒▒▒▒    │█
       █│    ▒ PUSH ▒    │█
       █│    ▒▒▒▒▒▒▒    │█
       █│                │█
       █│    ░░░░░░░    │█
       █│   ░PUSHING░    │█
       █│    ░░░░░░░    │█
       █│                │█
       █│    ███████    │█
       █│    █TO GIT    │█
       █│    ███████    │█
        █└──────────────┘█
         ██████████████████
  `
];

const successFrame = `
                      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
                      ⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿
                      ⣿⣿⣿⣿⠟⢉⣠⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣄⡈⠻⣿⣿⣿⣿⣿⣿
                      ⣿⣿⡿⠁⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠈⢿⣿⣿⣿⣿
                      ⣿⣿⠁⣴⣿⣿⣿⣿⣿⡿⠋⣉⠉⠙⢿⣿⡿⠋⣉⠉⠙⢿⣿⣿⣧⠈⣿⣿⣿⣿
                      ⣿⡟⢠⣿⣿⣿⣿⡿⠋⣠⣾⣿⣷⣄⠈⢿⠃⣰⣿⣿⣦⠈⢿⣿⣿⡄⢹⣿⣿⣿
                      ⣿⡇⢸⣿⣿⣿⣿⠁⣾⣿⣿⣿⣿⣿⣇⠘⢰⣿⣿⣿⣿⣧⠘⣿⣿⡇⢸⣿⣿⣿
                      ⣿⡇⢸⣿⣿⣿⣿⠘⣿⣿⣿⣿⣿⣿⡿⢀⣿⣿⣿⣿⣿⡿⢀⣿⣿⡇⢸⣿⣿⣿
                      ⣿⡇⢸⣿⣿⣿⣿⣧⠈⢿⣿⣿⣿⡟⢠⣾⣿⣿⣿⣿⠟⢠⣾⣿⣿⡇⢸⣿⣿⣿
                      ⣿⣧⠈⣿⣿⣿⣿⣿⣦⠈⠻⠟⢋⣴⣿⣿⣿⣿⠟⢋⣴⣿⣿⣿⣿⠀⣼⣿⣿⣿
                      ⣿⣿⡄⠘⢿⣿⣿⣿⣿⣷⣤⣴⣿⣿⣿⣿⣿⣥⣴⣿⣿⣿⣿⡿⠃⢠⣿⣿⣿⣿
                      ⣿⣿⣿⣄⠈⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⢀⣴⣿⣿⣿⣿⣿
                      ⣿⣿⣿⣿⣷⣤⣀⠉⠛⠿⢿⣿⣿⣿⣿⡿⠿⠛⢋⣁⣤⣴⣾⣿⣿⣿⣿⣿⣿⣿
                      ⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣤⣤⣤⣤⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
                                                          
                    ✨ Successfully pushed changes! ✨
                       🚀 Your code is in orbit! 🚀
                    💫 Commit message added with style 💫
`;

async function animate() {
  let i = 0;
  const totalSpins = 4; // Number of complete spins
  const totalFrames = frames.length * totalSpins;
  const speeds = [120, 100, 80, 60]; // Variable speeds for dynamic effect
  
  while (i < totalFrames) {
    console.clear();
    console.log(frames[i % frames.length]);
    // Speed up the animation gradually
    const speedIndex = Math.min(Math.floor(i / frames.length), speeds.length - 1);
    await setTimeout(speeds[speedIndex]);
    i++;
  }
  console.clear();
  console.log(successFrame);
}

async function generateCommitMessage(diff: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'codellama',
        prompt: `Given the following git diff, write a concise and descriptive commit message following the conventional commits specification. Focus on the main changes and their purpose. Keep it under 100 characters. Here's the diff:\n\n${diff}`,
        stream: false
      })
    });

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.log('⚠️  AI commit message generation failed, falling back to default format');
    return '';
  }
}

async function main() {
  try {
    // Stage all changes
    await $`git add .`;
    
    // Get the diff for AI analysis
    const { stdout: diffOutput } = await $`git diff --staged`;
    const diff = diffOutput.toString().trim();
    
    // Get list of staged files
    const { stdout: filesOutput } = await $`git diff --staged --name-only`;
    const files = filesOutput.toString().trim();
    
    if (!files) {
      console.log("No changes to commit");
      process.exit(0);
    }

    // Try to generate AI commit message
    const aiMessage = await generateCommitMessage(diff);
    
    // Use AI message if available, otherwise fall back to files list
    const commitMessage = aiMessage || `update: ${files.split('\n').join(', ')}`;
    
    // Commit changes
    await $`git commit -m ${commitMessage}`;
    
    // Push changes with animation
    console.log("🚀 Initiating push sequence...");
    await $`git push`;
    
    // Show success animation
    await animate();
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error:", error.message);
    } else {
      console.error("❌ An unknown error occurred");
    }
    process.exit(1);
  }
}

main(); 