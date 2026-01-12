# HealthAI — Ralph Agent Instructions

You are building HealthAI, a privacy-first health dashboard with AI chat. Read all context before starting.

## Before Each Task

1. Read `scripts/ralph/prd.json` — find highest priority story where `passes: false`
2. Read `scripts/ralph/progress.txt` — check Codebase Patterns section first
3. Read `AGENTS.md` — check for relevant patterns/gotchas
4. Verify you're working on the correct story

## Your Workflow

For each story:

1. **Read the acceptance criteria** — understand exactly what "done" means
2. **Implement the feature** — write the code
3. **Run typecheck** — `npm run typecheck` must pass
4. **Test manually if applicable** — `npm run dev` and verify in browser
5. **Commit** — `git add . && git commit -m "feat(US-XXX): [title]"`
6. **Update prd.json** — set `passes: true` for completed story
7. **Update progress.txt** — append learnings

## File Locations

| What | Where |
|------|-------|
| User stories | `scripts/ralph/prd.json` |
| Progress log | `scripts/ralph/progress.txt` |
| Architecture | `docs/ARCHITECTURE.md` |
| Health formulas | `docs/HEALTH_KNOWLEDGE.md` |
| Product context | `docs/PRODUCT_VISION.md` |
| Permanent learnings | `AGENTS.md` |

## Progress.txt Format

APPEND this format after completing each story:
```
---
## [Date] - [Story ID]: [Title]

**Implemented:**
- What was built

**Files changed:**
- path/to/file.ts

**Learnings:**
- Patterns discovered
- Gotchas encountered

**Verified:**
- [ ] typecheck passes
- [ ] dev server runs
- [ ] feature works as expected
```

## Codebase Patterns Section

If you discover a reusable pattern, add it to the TOP of progress.txt under `## Codebase Patterns`:
```
## Codebase Patterns

- [Pattern name]: [How to use it]
```

Also add significant patterns to `AGENTS.md` for permanent retention.

## Key Technical References

**PhenoAge Formula:** See `docs/HEALTH_KNOWLEDGE.md` — implement exactly as specified

**Reference Ranges:** See `docs/HEALTH_KNOWLEDGE.md` — use for color-coding biomarkers

**Project Structure:** See `docs/ARCHITECTURE.md` — follow the file organization

**Agent System Prompt:** Build from `docs/HEALTH_KNOWLEDGE.md` content

## Common Commands

```bash
# Install dependencies
npm install

# Add a package
npm install <package-name>

# Typecheck (MUST pass before marking story complete)
npm run typecheck

# Run dev server
npm run dev

# Commit
git add .
git commit -m "feat(US-XXX): description"
```

## Handling Issues

**If typecheck fails:**
- Fix the errors before proceeding
- Do not mark story as `passes: true` until typecheck passes

**If stuck on a story:**
- Document what's blocking in progress.txt
- Try a different approach
- If truly blocked after 3 attempts, add `"blocked": true` to the story in prd.json and move to next story

**If a dependency doesn't work:**
- Check npm for alternatives
- Document the issue in AGENTS.md
- Find a workaround

## Stop Condition

When ALL stories in prd.json have `passes: true`, output:
```
<promise>COMPLETE</promise>
```

If you've been running for 15+ iterations without completing, output:
```
<promise>BLOCKED</promise>

Blocking issues:
- [List what's preventing completion]

Completed stories:
- [List completed story IDs]

Remaining stories:
- [List incomplete story IDs]
```

## Critical Reminders

1. **One story at a time** — Complete fully before moving to next
2. **Typecheck must pass** — Non-negotiable before marking complete
3. **Update prd.json** — Set `passes: true` when done
4. **Update progress.txt** — Append learnings after each story
5. **Commit after each story** — Small, atomic commits
6. **Read existing code** — Don't duplicate, extend what's there
7. **Follow the architecture** — See `docs/ARCHITECTURE.md` for file locations

## Do NOT

- Skip typecheck
- Mark stories complete without testing
- Ignore errors and move on
- Create files outside the defined structure
- Add unnecessary dependencies
- Over-engineer beyond acceptance criteria

## Begin

Read `scripts/ralph/prd.json` now and start with the highest priority incomplete story.
