import { dlopen, FFIType, suffix } from "bun:ffi";

const path = `llama${suffix}`;  // Will be .dylib on macOS, .so on Linux, .dll on Windows

const {
  symbols: llama
} = dlopen(path, {
  llama_init_from_file: {
    args: [FFIType.ptr],
    returns: FFIType.ptr
  },
  llama_eval: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.i32
  },
  llama_free: {
    args: [FFIType.ptr],
    returns: FFIType.void
  }
});

type ChangeType = 'add' | 'modify' | 'delete';

interface FileChange {
  type: ChangeType;
  path: string;
  content?: string;
}

export class CommitAnalyzer {
  private readonly MODEL_PATH = "./models/llama-2-7b-chat.Q4_K_M.gguf";
  private readonly MAX_TOKENS = 2048;
  private readonly TEMPERATURE = 0.7;

  private readonly PROMPT_TEMPLATE = `Analyze the following git changes and create a concise, meaningful commit message following the conventional commits specification.

Changes:
{changes}

Rules:
1. Use one of: feat, fix, docs, style, refactor, test, chore
2. Add scope in parentheses if clear from context
3. Keep message under 100 characters
4. Be specific but concise
5. Use present tense, imperative mood
6. Focus on the WHY and WHAT, not just files changed

Example good messages:
- feat(auth): implement OAuth2 login flow
- fix(api): resolve race condition in user sessions
- docs: update deployment instructions
- style(ui): improve button consistency
- refactor: simplify data processing pipeline
- test(core): add unit tests for user service
- chore(deps): update dependencies

Generate commit message:`;

  async analyzeDiff(diff: string, files: string[]): Promise<string> {
    try {
      // Initialize llama.cpp with our model
      const model = llama.llama_init_from_file(Buffer.from(this.MODEL_PATH));
      if (!model) {
        console.warn("⚠️  Local AI initialization failed, falling back to basic analysis");
        return this.fallbackAnalysis(diff, files);
      }

      // Prepare the changes summary
      const changes = this.prepareChangesSummary(diff, files);
      
      // Create the full prompt
      const prompt = this.PROMPT_TEMPLATE.replace("{changes}", changes);
      
      // Get AI response
      const response = await this.generateResponse(model, prompt);
      
      // Clean up
      llama.llama_free(model);
      
      // Process and validate the response
      const message = this.processResponse(response);
      return message || this.fallbackAnalysis(diff, files);
    } catch (error) {
      console.warn("⚠️  AI analysis failed, falling back to basic analysis");
      return this.fallbackAnalysis(diff, files);
    }
  }

  private prepareChangesSummary(diff: string, files: string[]): string {
    const changes = this.parseChanges(diff, files);
    let summary = "";

    // Group changes by type
    const grouped = changes.reduce((acc, change) => {
      acc[change.type] = acc[change.type] || [];
      acc[change.type].push(change.path);
      return acc;
    }, {} as Record<ChangeType, string[]>);

    // Create a human-readable summary
    if (grouped.add?.length) {
      summary += `Added files:\n${grouped.add.map(f => `+ ${f}`).join('\n')}\n\n`;
    }
    if (grouped.modify?.length) {
      summary += `Modified files:\n${grouped.modify.map(f => `• ${f}`).join('\n')}\n\n`;
    }
    if (grouped.delete?.length) {
      summary += `Deleted files:\n${grouped.delete.map(f => `- ${f}`).join('\n')}\n\n`;
    }

    // Add diff summary for modified files
    const diffSummary = this.summarizeDiff(diff);
    if (diffSummary) {
      summary += `Changes summary:\n${diffSummary}`;
    }

    return summary;
  }

  private parseChanges(diff: string, files: string[]): FileChange[] {
    return files.map(file => {
      const type = diff.includes(`+++ b/${file}`) ? 'add' :
                  diff.includes(`--- a/${file}`) ? 'delete' : 'modify';
      return { type, path: file };
    });
  }

  private summarizeDiff(diff: string): string {
    // Extract the most meaningful parts of the diff
    const lines = diff.split('\n');
    let summary = '';
    let currentFile = '';

    for (const line of lines) {
      if (line.startsWith('+++')) {
        currentFile = line.split('/').pop() || '';
        continue;
      }
      if (line.startsWith('+') && !line.startsWith('+++')) {
        summary += `[${currentFile}] Added: ${line.slice(1).trim()}\n`;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        summary += `[${currentFile}] Removed: ${line.slice(1).trim()}\n`;
      }
    }

    return summary;
  }

  private async generateResponse(model: any, prompt: string): Promise<string> {
    // Convert prompt to buffer
    const promptBuffer = Buffer.from(prompt);
    
    // Allocate buffer for response
    const responseBuffer = Buffer.alloc(2048);
    
    // Generate response
    const result = await llama.llama_eval(
      model,
      promptBuffer,
      promptBuffer.length,
      this.MAX_TOKENS,
      this.TEMPERATURE
    );

    if (result !== 0) {
      throw new Error("Failed to generate response");
    }

    return responseBuffer.toString().trim();
  }

  private processResponse(response: string): string | null {
    // Validate that the response follows conventional commit format
    const commitPattern = /^(feat|fix|docs|style|refactor|test|chore)(\([a-z-]+\))?: .{1,100}$/;
    
    // Clean up the response
    const cleaned = response
      .split('\n')[0]  // Take first line only
      .trim()
      .replace(/['"]/g, '');  // Remove quotes
    
    return commitPattern.test(cleaned) ? cleaned : null;
  }

  private fallbackAnalysis(diff: string, files: string[]): string {
    const changes = this.parseChanges(diff, files);
    const type = this.determineChangeType(changes);
    const scope = this.determineScope(changes);
    const description = this.createDescription(changes);
    return this.formatCommitMessage(type, scope, description);
  }

  private determineChangeType(changes: FileChange[]): string {
    const paths = changes.map(c => c.path.toLowerCase());
    
    if (paths.some(p => /\.(md|txt|doc|pdf)$/i.test(p))) return 'docs';
    if (paths.some(p => /\.(css|scss|sass|less|styl)$/i.test(p))) return 'style';
    if (paths.some(p => /\.(test|spec)\.(ts|js|jsx|tsx)$/i.test(p))) return 'test';
    if (paths.some(p => /\.(config|rc|json|yml|yaml)$/i.test(p))) return 'chore';
    
    return changes.some(c => c.type === 'add') ? 'feat' : 'fix';
  }

  private determineScope(changes: FileChange[]): string | null {
    const dirs = new Set(changes.map(c => {
      const parts = c.path.split('/');
      return parts.length > 1 ? parts[0] : null;
    }).filter((dir): dir is string => dir !== null));

    return dirs.size === 1 ? Array.from(dirs)[0] : null;
  }

  private createDescription(changes: FileChange[]): string {
    const addCount = changes.filter(c => c.type === 'add').length;
    const modifyCount = changes.filter(c => c.type === 'modify').length;
    const deleteCount = changes.filter(c => c.type === 'delete').length;

    const parts = [];
    if (addCount) parts.push(`add ${this.pluralize('file', addCount)}`);
    if (modifyCount) parts.push(`update ${this.pluralize('file', modifyCount)}`);
    if (deleteCount) parts.push(`remove ${this.pluralize('file', deleteCount)}`);

    return parts.join(', ');
  }

  private formatCommitMessage(type: string, scope: string | null, description: string): string {
    const scopePart = scope ? `(${scope})` : '';
    return `${type}${scopePart}: ${description}`;
  }

  private pluralize(word: string, count: number): string {
    return `${count} ${word}${count === 1 ? '' : 's'}`;
  }
} 