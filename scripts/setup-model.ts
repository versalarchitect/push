#!/usr/bin/env bun
import { $ } from "bun";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const MODEL_URL = "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf";
const MODEL_DIR = "./models";
const MODEL_PATH = join(MODEL_DIR, "llama-2-7b-chat.Q4_K_M.gguf");

async function main() {
  try {
    // Create models directory if it doesn't exist
    await mkdir(MODEL_DIR, { recursive: true });

    console.log("🚀 Downloading Llama 2 model...");
    
    // Download the model
    const response = await fetch(MODEL_URL);
    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.statusText}`);
    }

    // Save the model
    const buffer = await response.arrayBuffer();
    await writeFile(MODEL_PATH, Buffer.from(buffer));

    console.log("✨ Model downloaded successfully!");
    
    // Download and build llama.cpp
    console.log("🔧 Building llama.cpp...");
    
    await $`git clone https://github.com/ggerganov/llama.cpp.git`;
    process.chdir("llama.cpp");
    
    // Build with appropriate flags
    if (process.platform === "darwin") {
      await $`make LLAMA_METAL=1`;  // Use Metal on macOS
    } else {
      await $`make`;  // Standard build for other platforms
    }

    // Copy the library to the right place
    const libName = process.platform === "darwin" ? "libllama.dylib" :
                   process.platform === "win32" ? "llama.dll" : "libllama.so";
                   
    await $`cp ${libName} ../${libName}`;
    
    // Clean up
    process.chdir("..");
    await $`rm -rf llama.cpp`;

    console.log("✅ Setup completed successfully!");
    console.log("You can now use the git push command with AI-powered commit messages!");
  } catch (error) {
    console.error("❌ Setup failed:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}

main(); 