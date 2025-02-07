# Git Push CLI

A beautiful git push CLI tool with AI-powered commit messages. This tool makes git commits and pushes more enjoyable with:

- 🎨 Beautiful ASCII art animations
- 🤖 AI-powered commit message generation (using Ollama)
- 🚀 Simple one-command workflow
- ✨ Automatic staging of changes

## Installation

```bash
# Install globally with bun
bun install -g @charlesjackson/git-push

# Install Ollama (optional, for AI commit messages)
curl https://ollama.ai/install.sh | sh
ollama pull codellama
```

## Usage

Simply run in any git repository:

```bash
push
```

Or with a custom commit message:

```bash
push "feat: add new awesome feature"
```

### Features

1. **AI-Powered Commit Messages**
   - If Ollama is installed, it automatically generates meaningful commit messages based on your changes
   - Falls back to listing changed files if AI generation is not available

2. **Beautiful Animations**
   - Shows a fun ASCII art animation while pushing
   - Displays a success message with style

3. **Simple Workflow**
   - Automatically stages all changes
   - Generates commit message (AI or fallback)
   - Pushes to remote
   - All in one command!

## Requirements

- Bun 1.0.0 or higher
- Git
- Ollama (optional, for AI commit messages)

## License

MIT
