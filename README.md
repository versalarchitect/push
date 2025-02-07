# Push

A beautiful git push CLI tool with AI-powered commit messages. This tool automatically generates meaningful commit messages using AI, stages your changes, and pushes them to your repository with a delightful animation.

## Features

- 🤖 AI-powered commit message generation
- ✨ Beautiful terminal animations
- 🚀 Simple one-command git workflow
- 🔒 Secure authentication handling
- 📝 Fallback to conventional commits

## Installation

```bash
# Install globally using bun
bun install -g @versalarchitect/push

# Or using npm
npm install -g @versalarchitect/push
```

## Usage

Simply run `push` in your git repository:

```bash
# Auto-generate commit message and push
push

# Or provide your own commit message
push "feat: add new awesome feature"
```

## Requirements

- Bun >= 1.0.0 or Node.js >= 18.0.0
- Git
- Ollama (for AI-powered commit messages)

## Configuration

The tool uses Ollama for AI commit message generation. Make sure you have Ollama running locally:

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the CodeLlama model
ollama pull codellama
```

## License

MIT
