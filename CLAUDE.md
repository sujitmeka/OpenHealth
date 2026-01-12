# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HealthAI is a privacy-first health dashboard with an AI agent. Runs on localhost using the user's own Anthropic API key. Zero data leaves the machine except Anthropic API calls.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript checking (tsc --noEmit)
npm run lint         # ESLint
```

## Architecture

**Tech Stack:** Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui, Claude Agent SDK, TypeScript strict mode

**No database** — all health data lives in memory, re-parsed from `/data` folder on each startup.

**Data flow:**
```
/data folder → Parsers → Extractors → HealthDataStore → Dashboard + Agent
```

**Key directories:**
- `lib/parsers/` — File parsing (pdf-parse, papaparse, xlsx)
- `lib/extractors/` — Biomarker extraction from parsed text
- `lib/calculations/` — PhenoAge scoring algorithms
- `lib/agent/` — Claude Agent SDK setup, system prompt, tool config
- `lib/store/` — In-memory HealthDataStore
- `components/ui/` — shadcn/ui components

**Agent configuration** in `lib/agent/health-agent.ts`:
- Allowed tools: Read, Bash, WebSearch, WebFetch
- Searches verified sources (NIH/PubMed, Bryan Johnson Blueprint)
- Health data summary prepended to user messages

## Coding Standards

- TypeScript strict mode, no `any`, explicit return types
- Functional components only, no classes
- Absolute imports with `@/` prefix (e.g., `@/lib/parsers/pdf`)
- One component per file, filename matches export
- camelCase for functions/variables, PascalCase for components/types

## Critical Constraints

1. **Privacy first:** No external API calls except Anthropic. No analytics, no tracking.
2. **No data persistence:** Health data parsed fresh from `/data` on startup.
3. **User provides API key:** Never bundle or proxy API keys.

## Common Tasks

**Adding new biomarkers:**
1. Add extraction patterns to `lib/extractors/biomarkers.ts`
2. Add reference range to `docs/HEALTH_KNOWLEDGE.md`
3. Update types in `lib/types/health.ts`

**Adding new file parser:**
1. Create parser in `lib/parsers/`
2. Register extension in `lib/files.ts`
3. Update HealthDataStore to use new parser

**Modifying agent behavior:**
1. Edit system prompt in `lib/agent/health-agent.ts`
2. Reference ranges live in `docs/HEALTH_KNOWLEDGE.md`

## Reference Documents

- `docs/ARCHITECTURE.md` — System design, data flow, component relationships
- `docs/PRODUCT_VISION.md` — Target user, success metrics
- `docs/HEALTH_KNOWLEDGE.md` — PhenoAge formula, biomarker reference ranges
- `AGENTS.md` — Accumulated learnings and patterns

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...   # Required. User's own key.
```
