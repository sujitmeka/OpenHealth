# Ralph Loop Agent: Reference Guide for Implementation

> **Purpose**: This document provides context on the Ralph Loop methodology for AI agent persistence. Use this as a reference when implementing iterative AI coding workflows.

---

## Core Philosophy

**"Better to fail predictably than succeed unpredictably."** — Geoffrey Huntley

The fundamental problem Ralph solves: Standard AI tool loops stop when the **model thinks it's done**, not when the **task is objectively complete**. Ralph adds an outer verification loop that keeps the AI working until success criteria are actually met.

---

## The Two-Loop Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RALPH LOOP (OUTER)                               │
│   Iteration 1 → Iteration 2 → ... → Iteration N                     │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              AI SDK TOOL LOOP (INNER)                       │   │
│   │                                                             │   │
│   │   Prompt → LLM → Tool Call → Result → LLM → Tool → ...      │   │
│   │                                                             │   │
│   │   Stops when: Model finishes tool calls OR maxSteps hit     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              verifyCompletion()                             │   │
│   │                                                             │   │
│   │   "Is the TASK actually complete?"                          │   │
│   │   → Check preview URL loads (HTTP 200)                      │   │
│   │   → Check for build errors in logs                          │   │
│   │   → Check required files exist                              │   │
│   │   → Run tests if applicable                                 │   │
│   │                                                             │   │
│   │   Returns: { complete: boolean, reason: string }            │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│   complete === false?                                               │
│       → Inject "reason" as feedback into next iteration prompt      │
│       → Run another iteration                                       │
│                                                                     │
│   complete === true?                                                │
│       → Return final result to user                                 │
│                                                                     │
│   Stop conditions met (iterations/cost)?                            │
│       → Return with "maxIterations" or "costLimit" reason           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Distinction: Inner vs Outer Loop

| Aspect | Inner Loop (AI SDK) | Outer Loop (Ralph) |
|--------|---------------------|-------------------|
| **What it controls** | Individual tool calls within one "turn" | Multiple complete AI turns |
| **Stop condition** | `maxSteps` or model stops calling tools | `verifyCompletion()` returns `complete: true` |
| **Feedback mechanism** | Tool results feed back to model | Verification failure reason feeds back |
| **Question answered** | "Has the model finished calling tools?" | "Is the actual task accomplished?" |

---

## The Critical Innovation: Feedback Injection

When `verifyCompletion()` returns `{ complete: false, reason: "..." }`, the **reason string is injected into the next iteration's prompt**. This is what makes Ralph different from simple retry loops.

**Without feedback injection** (naive retry):
```
Iteration 1: AI writes broken code → "Done!"
Iteration 2: AI writes the same broken code → "Done!"
Iteration 3: Same thing...
```

**With feedback injection** (Ralph):
```
Iteration 1: AI writes broken code → "Done!"
verifyCompletion: "Build failed: Cannot find module 'react'"
Iteration 2: AI sees the error → Adds missing dependency → "Done!"
verifyCompletion: "Preview loads successfully"
Complete!
```

---

## RalphLoopAgent API (Vercel Labs)

```typescript
import { RalphLoopAgent, iterationCountIs, costIs } from 'ralph-loop-agent';
import { tool } from 'ai';

const agent = new RalphLoopAgent({
  // Model specification (AI Gateway format)
  model: 'anthropic/claude-sonnet-4-5',

  // System instructions for the AI
  instructions: 'You are an expert coder. Build working applications.',

  // Tools the AI can use (standard AI SDK tools)
  tools: {
    readFile: tool({ ... }),
    writeFile: tool({ ... }),
    runCommand: tool({ ... }),
  },

  // OUTER LOOP stop conditions (when to give up)
  stopWhen: [
    iterationCountIs(20),  // Max 20 Ralph iterations
    costIs(5.00),          // Max $5 in API costs
  ],

  // INNER LOOP limit (tool calls per iteration)
  toolStopWhen: stepCountIs(30),

  // THE KEY FUNCTION: Objective verification
  verifyCompletion: async ({ result, iteration }) => {
    // Check if task is ACTUALLY complete
    const previewWorks = await checkPreviewLoads();
    const noBuildErrors = await checkBuildLogs();

    if (previewWorks && noBuildErrors) {
      return {
        complete: true,
        reason: 'App builds and runs successfully'
      };
    }

    // Return specific feedback for next iteration
    return {
      complete: false,
      reason: `Build failed: ${extractErrors()}. Fix these issues.`
    };
  },

  // Lifecycle hooks (optional)
  onIterationStart: ({ iteration }) => console.log(`Starting iteration ${iteration}`),
  onIterationEnd: ({ iteration, duration }) => console.log(`Iteration ${iteration}: ${duration}ms`),
});

// Execute the loop
const result = await agent.loop({
  prompt: 'Build a todo app with local storage',
});

console.log(`Completed in ${result.iterations} iterations`);
console.log(`Reason: ${result.completionReason}`);
console.log(`Total tokens: ${result.totalUsage.totalTokens}`);
```

---

## Stop Conditions

### Built-in Stop Conditions

| Condition | Usage | Description |
|-----------|-------|-------------|
| `iterationCountIs(n)` | `stopWhen: [iterationCountIs(20)]` | Stop after N Ralph iterations |
| `tokenCountIs(n)` | `stopWhen: [tokenCountIs(100000)]` | Stop after N total tokens |
| `costIs(amount, rates?)` | `stopWhen: [costIs(5.00)]` | Stop when cost exceeds amount |

### Custom Stop Conditions

```typescript
const customStop = ({ iterations, totalUsage, allResults }) => {
  // Custom logic
  return iterations > 10 && totalUsage.totalTokens > 50000;
};

stopWhen: [customStop]
```

---

## verifyCompletion Function Signature

```typescript
verifyCompletion: async (context: {
  result: GenerateTextResult,  // Result from inner tool loop
  iteration: number,           // Current iteration number (1-indexed)
  allResults: GenerateTextResult[], // All previous results
}) => Promise<{
  complete: boolean,  // Is the task done?
  reason?: string,    // Feedback for next iteration (if not complete)
                      // OR success message (if complete)
}>
```

---

## Verification Strategies

### Strategy 1: Preview URL Check (Web Apps)

```typescript
verifyCompletion: async ({ result, iteration }) => {
  try {
    const response = await fetch(previewUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      return { complete: true, reason: 'Preview loads successfully' };
    }

    return {
      complete: false,
      reason: `Preview failed (HTTP ${response.status}). Check for build errors.`
    };
  } catch (error) {
    return {
      complete: false,
      reason: `Preview unreachable: ${error.message}. Server may still be starting.`
    };
  }
}
```

### Strategy 2: Build Output Check

```typescript
verifyCompletion: async ({ result, iteration }) => {
  const buildOutput = await runCommand('npm run build');

  if (buildOutput.exitCode === 0) {
    return { complete: true, reason: 'Build succeeded' };
  }

  return {
    complete: false,
    reason: `Build failed:\n${buildOutput.stderr}\n\nFix these errors.`
  };
}
```

### Strategy 3: Test Suite

```typescript
verifyCompletion: async ({ result, iteration }) => {
  const testResult = await runCommand('npm test');

  if (testResult.exitCode === 0) {
    return { complete: true, reason: 'All tests pass' };
  }

  return {
    complete: false,
    reason: `Tests failed:\n${testResult.stdout}\n\nFix failing tests.`
  };
}
```

### Strategy 4: Multi-Check Composite

```typescript
verifyCompletion: async ({ result, iteration }) => {
  const checks = [];

  // Check 1: Required files exist
  const hasPackageJson = await fileExists('package.json');
  checks.push({ name: 'package.json exists', passed: hasPackageJson });

  // Check 2: No TypeScript errors
  const tsc = await runCommand('npx tsc --noEmit');
  checks.push({ name: 'TypeScript valid', passed: tsc.exitCode === 0 });

  // Check 3: Build succeeds
  const build = await runCommand('npm run build');
  checks.push({ name: 'Build succeeds', passed: build.exitCode === 0 });

  // Aggregate
  const allPassed = checks.every(c => c.passed);
  const failed = checks.filter(c => !c.passed);

  if (allPassed) {
    return { complete: true, reason: 'All checks passed' };
  }

  return {
    complete: false,
    reason: `Failed checks:\n${failed.map(c => `- ${c.name}`).join('\n')}`
  };
}
```

---

## Integration Patterns

### Pattern 1: With Vercel AI SDK generateText

RalphLoopAgent wraps `generateText` internally. You provide tools in the same format:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const tools = {
  writeFile: tool({
    description: 'Write content to a file',
    parameters: z.object({
      path: z.string(),
      content: z.string(),
    }),
    execute: async ({ path, content }) => {
      await fs.writeFile(path, content);
      return { success: true };
    },
  }),
};
```

### Pattern 2: With MCP Tools

If using MCP (Model Context Protocol) tools from a service like Freestyle.sh:

```typescript
import { experimental_createMCPClient } from 'ai';

const mcpClient = await experimental_createMCPClient({
  transport: new StreamableHTTPClientTransport(mcpUrl),
});

const mcpTools = await mcpClient.getTools();

const agent = new RalphLoopAgent({
  model: 'anthropic/claude-sonnet-4-5',
  tools: mcpTools,  // MCP tools work directly
  // ...
});
```

### Pattern 3: With Sandbox (E2B/Daytona)

```typescript
import { Sandbox } from '@e2b/code-interpreter';

const sandbox = await Sandbox.create();

const tools = {
  runCode: tool({
    description: 'Execute code in sandbox',
    parameters: z.object({ code: z.string() }),
    execute: async ({ code }) => {
      const result = await sandbox.runCode(code);
      return { output: result.text, error: result.error };
    },
  }),
};

// Use sandbox state in verification
verifyCompletion: async ({ result }) => {
  const files = await sandbox.filesystem.list('/');
  // ...
}
```

---

## Critical Implementation Notes

### 1. Always Set Limits

**WARNING**: Without stop conditions, Ralph will loop indefinitely.

```typescript
// ALWAYS include at least one of these
stopWhen: [
  iterationCountIs(20),  // Iteration limit
  costIs(5.00),          // Cost limit
]
```

### 2. Feedback Must Be Actionable

Bad feedback:
```typescript
return { complete: false, reason: 'Something went wrong' };
```

Good feedback:
```typescript
return {
  complete: false,
  reason: `Build error on line 42: "Cannot find module 'lodash'".
           Add lodash to dependencies: npm install lodash`
};
```

### 3. Verification Should Be Objective

Bad (subjective):
```typescript
// AI can just say this without it being true
const aiSaysDone = result.text.includes('DONE');
return { complete: aiSaysDone };
```

Good (objective):
```typescript
// Actually test if the thing works
const response = await fetch(previewUrl);
return { complete: response.ok };
```

### 4. Handle Transient Failures

```typescript
verifyCompletion: async ({ result, iteration }) => {
  // Allow warm-up time for dev servers
  if (iteration === 1) {
    await sleep(3000);
  }

  // Retry fetch with backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(previewUrl);
      if (response.ok) return { complete: true };
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }

  return { complete: false, reason: 'Preview failed to load after retries' };
}
```

---

## Comparison: Ralph Implementations

| Feature | Ralph-Wiggum (Claude Code Plugin) | RalphLoopAgent (Vercel) |
|---------|-----------------------------------|-------------------------|
| **Runtime** | Claude Code CLI | Node.js / TypeScript |
| **Verification** | String match (`--completion-promise`) | Function (`verifyCompletion()`) |
| **Feedback injection** | None (just re-prompts) | Yes (reason → next iteration) |
| **Cost tracking** | Manual | Built-in `costIs()` |
| **Best for** | Terminal/CLI tasks | Web apps, API routes |

---

## When to Use Ralph

### Good Use Cases

- Large refactors (framework migrations)
- Multi-file changes with dependencies
- Test coverage expansion
- Bug fixes with clear reproduction
- Build system modifications
- Any task with **objective success criteria**

### Poor Use Cases

- Exploratory/creative work
- Ambiguous requirements
- Security-critical code (needs human review)
- Architectural decisions
- Tasks without verifiable completion

---

## Debugging Ralph Loops

### Logging Each Iteration

```typescript
onIterationStart: ({ iteration }) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`ITERATION ${iteration} STARTING`);
  console.log(`${'='.repeat(50)}\n`);
},

onIterationEnd: ({ iteration, duration, result }) => {
  console.log(`\nIteration ${iteration} completed in ${duration}ms`);
  console.log(`Tokens used: ${result.usage?.totalTokens}`);
}
```

### Tracking Verification History

```typescript
const verificationHistory = [];

verifyCompletion: async ({ result, iteration }) => {
  const checks = { /* ... */ };
  verificationHistory.push({ iteration, checks, timestamp: Date.now() });

  // Log for debugging
  console.log(`Verification ${iteration}:`, JSON.stringify(checks, null, 2));

  // ... return result
}
```

---

## Quick Reference

```typescript
// Minimal working example
import { RalphLoopAgent, iterationCountIs } from 'ralph-loop-agent';

const agent = new RalphLoopAgent({
  model: 'anthropic/claude-sonnet-4-5',
  instructions: 'You are a coding assistant.',
  tools: myTools,
  stopWhen: [iterationCountIs(10)],
  verifyCompletion: async ({ result }) => {
    const works = await checkIfItWorks();
    return {
      complete: works,
      reason: works ? 'Success!' : 'Still broken. Keep trying.'
    };
  },
});

const { text, iterations, completionReason } = await agent.loop({
  prompt: 'Build the thing',
});
```

---

## Resources

- **RalphLoopAgent Package**: https://github.com/vercel-labs/ralph-loop-agent
- **Vercel AI SDK**: https://ai-sdk.dev
- **Original Ralph-Wiggum Plugin**: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
- **MCP Protocol**: https://modelcontextprotocol.io

---

*This document is for reference when implementing Ralph Loop patterns. The key insight: Ralph doesn't replace AI judgment—it adds objective verification to ensure tasks are actually complete, not just declared complete.*
