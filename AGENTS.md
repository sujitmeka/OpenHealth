# AGENTS.md — Accumulated Learnings

This document captures patterns, gotchas, and decisions discovered while building HealthAI. Update this as you learn.

---

## Codebase Patterns

<!-- Add reusable patterns here as you discover them -->

### File Parsing
- (To be filled during development)

### React Components
- (To be filled during development)

### Agent Configuration
- (To be filled during development)

---

## Gotchas & Fixes

<!-- Document problems encountered and how they were solved -->

### PDF Parsing
- (To be filled during development)

### Biomarker Extraction
- (To be filled during development)

### Claude Agent SDK
- (To be filled during development)

---

## Decisions Made

<!-- Record architectural decisions and why -->

| Decision | Rationale | Date |
|----------|-----------|------|
| No database for V1 | Simplicity, privacy — re-parse from /data each time | — |
| Levine PhenoAge formula | Most cited, Bryan Johnson uses it, 9 common biomarkers | — |
| Claude Agent SDK over raw API | Built-in tools (Read, WebSearch), agent loop handled | — |

---

## Known Limitations

<!-- Document what doesn't work or isn't supported -->

- PDF parsing works best with text-based PDFs; scanned images may fail
- (Add more as discovered)

---

## Future Improvements

<!-- Ideas that came up during development but are out of scope -->

- (To be filled during development)

---

## Useful Commands

```bash
# Typecheck
npm run typecheck

# Dev server
npm run dev

# Check parsed biomarkers (once implemented)
# (Add debugging commands as you create them)
```

---

## File Reference

Quick reference for key files:

| Purpose | File |
|---------|------|
| Main dashboard | `app/page.tsx` |
| Chat API | `app/api/chat/route.ts` |
| Health agent | `lib/agent/health-agent.ts` |
| PhenoAge calc | `lib/calculations/phenoage.ts` |
| Biomarker extraction | `lib/extractors/biomarkers.ts` |
| Data store | `lib/store/health-data.ts` |
| Reference ranges | `docs/HEALTH_KNOWLEDGE.md` |

---

*Last updated: (auto-update during development)*
