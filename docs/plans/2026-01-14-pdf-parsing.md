# PDF Parsing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable HealthAI to parse PDF lab results and extract biomarkers from them.

**Architecture:** Add PDF support to the file detection system, create a PDF parser using pdf-parse library, and update HealthDataStore to handle PDF bloodwork files. The existing biomarker regex extraction will work on the extracted text.

**Tech Stack:** pdf-parse (PDF text extraction), vitest (testing), Node.js fs

---

## Problem Analysis

The PDF file `completed-lab-result-2025-12-26.pdf` exists in `/data` but is not being processed because:

1. **`src/lib/files.ts:34`** - `supportedExtensions = ['.txt', '.csv', '.xlsx']` - **PDF not included**
2. **No PDF parser exists** - Only `text.ts`, `csv.ts`, `xlsx.ts` exist
3. **`src/lib/store/health-data.ts:44`** - Only handles `.txt` extension for bloodwork

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install pdf-parse and vitest**

```bash
npm install pdf-parse
npm install -D vitest @vitest/ui
```

**Step 2: Add test script to package.json**

Add to `scripts`:
```json
"test": "vitest",
"test:ui": "vitest --ui"
```

**Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 4: Verify installation**

Run: `npm run test -- --run`
Expected: vitest runs (may show "no tests found")

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add pdf-parse and vitest dependencies"
```

---

### Task 2: Add PDF to Supported Extensions

**Files:**
- Modify: `src/lib/files.ts:34`
- Test: `src/lib/__tests__/files.test.ts`

**Step 1: Write the failing test**

Create `src/lib/__tests__/files.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

import fs from 'fs';
import { getDataFiles } from '../files';

describe('getDataFiles', () => {
  beforeEach(() => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({
      size: 1000,
      mtime: new Date('2024-01-01'),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should detect PDF files as supported', () => {
    vi.mocked(fs.readdirSync).mockReturnValue(['bloodwork.pdf'] as any);

    const files = getDataFiles();

    expect(files).toHaveLength(1);
    expect(files[0].extension).toBe('.pdf');
    expect(files[0].type).toBe('bloodwork');
  });

  it('should detect lab-result PDF as bloodwork type', () => {
    vi.mocked(fs.readdirSync).mockReturnValue(['completed-lab-result-2025-12-26.pdf'] as any);

    const files = getDataFiles();

    expect(files).toHaveLength(1);
    expect(files[0].type).toBe('bloodwork');
  });

  it('should support txt, csv, xlsx, and pdf extensions', () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      'blood.txt',
      'activity.csv',
      'data.xlsx',
      'labs.pdf',
    ] as any);

    const files = getDataFiles();

    expect(files).toHaveLength(4);
    expect(files.map((f) => f.extension)).toEqual(['.txt', '.csv', '.xlsx', '.pdf']);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/__tests__/files.test.ts --run`
Expected: FAIL - PDF files not being detected (only 3 files returned, not 4)

**Step 3: Add PDF to supported extensions**

Edit `src/lib/files.ts:34`:
```typescript
const supportedExtensions = ['.txt', '.csv', '.xlsx', '.pdf'];
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/__tests__/files.test.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/files.ts src/lib/__tests__/files.test.ts
git commit -m "feat: add PDF to supported file extensions"
```

---

### Task 3: Create PDF Parser

**Files:**
- Create: `src/lib/parsers/pdf.ts`
- Test: `src/lib/parsers/__tests__/pdf.test.ts`

**Step 1: Write the failing test**

Create `src/lib/parsers/__tests__/pdf.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

// We'll test the actual parser with a real PDF
describe('parsePdf', () => {
  it('should export parsePdf function', async () => {
    const { parsePdf } = await import('../pdf');
    expect(typeof parsePdf).toBe('function');
  });

  it('should return empty string for non-existent file', async () => {
    const { parsePdf } = await import('../pdf');
    const result = await parsePdf('/nonexistent/file.pdf');
    expect(result).toBe('');
  });

  it('should extract text from actual PDF in data folder', async () => {
    const { parsePdf } = await import('../pdf');
    const pdfPath = path.join(process.cwd(), 'data', 'completed-lab-result-2025-12-26.pdf');

    const result = await parsePdf(pdfPath);

    // Should contain some text
    expect(result.length).toBeGreaterThan(100);
    // Should contain common lab result terms
    expect(result.toLowerCase()).toMatch(/glucose|cholesterol|blood|lab/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/parsers/__tests__/pdf.test.ts --run`
Expected: FAIL - module not found

**Step 3: Create PDF parser**

Create `src/lib/parsers/pdf.ts`:
```typescript
import fs from 'fs';
import pdfParse from 'pdf-parse';

export async function parsePdf(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('[HealthAI] PDF file not found:', filePath);
      return '';
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    console.log('[HealthAI] Parsed PDF:', filePath, `(${data.numpages} pages, ${data.text.length} chars)`);

    return data.text;
  } catch (error) {
    console.error('[HealthAI] Error parsing PDF:', filePath, error);
    return '';
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/parsers/__tests__/pdf.test.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/parsers/pdf.ts src/lib/parsers/__tests__/pdf.test.ts
git commit -m "feat: add PDF parser using pdf-parse"
```

---

### Task 4: Update HealthDataStore to Handle PDF Bloodwork

**Files:**
- Modify: `src/lib/store/health-data.ts:44-45`
- Test: `src/lib/store/__tests__/health-data.test.ts`

**Step 1: Write the failing test**

Create `src/lib/store/__tests__/health-data.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules
vi.mock('@/lib/files', () => ({
  getDataFiles: vi.fn(),
}));

vi.mock('@/lib/parsers/text', () => ({
  parseTextFile: vi.fn(),
}));

vi.mock('@/lib/parsers/pdf', () => ({
  parsePdf: vi.fn(),
}));

vi.mock('@/lib/parsers/csv', () => ({
  parseCsv: vi.fn(),
}));

vi.mock('@/lib/extractors/biomarkers', () => ({
  extractBiomarkers: vi.fn(),
}));

vi.mock('@/lib/extractors/body-comp', () => ({
  extractBodyComposition: vi.fn(),
}));

vi.mock('@/lib/calculations/phenoage', () => ({
  calculatePhenoAge: vi.fn(),
}));

import { getDataFiles } from '@/lib/files';
import { parseTextFile } from '@/lib/parsers/text';
import { parsePdf } from '@/lib/parsers/pdf';
import { extractBiomarkers } from '@/lib/extractors/biomarkers';

describe('HealthDataStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should parse PDF bloodwork files', async () => {
    // Setup mocks
    vi.mocked(getDataFiles).mockReturnValue([
      {
        name: 'labs.pdf',
        type: 'bloodwork',
        path: '/data/labs.pdf',
        extension: '.pdf',
      },
    ]);
    vi.mocked(parsePdf).mockResolvedValue('Glucose: 95 mg/dL');
    vi.mocked(extractBiomarkers).mockReturnValue({ glucose: 95 });

    // Re-import to get fresh instance
    const { HealthDataStore } = await import('../health-data');

    // Force reload
    HealthDataStore.loadAllData();

    // Wait for async PDF parsing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(parsePdf).toHaveBeenCalledWith('/data/labs.pdf');
  });

  it('should still parse TXT bloodwork files', async () => {
    vi.mocked(getDataFiles).mockReturnValue([
      {
        name: 'blood.txt',
        type: 'bloodwork',
        path: '/data/blood.txt',
        extension: '.txt',
      },
    ]);
    vi.mocked(parseTextFile).mockReturnValue('Glucose: 95');
    vi.mocked(extractBiomarkers).mockReturnValue({ glucose: 95 });

    const { HealthDataStore } = await import('../health-data');
    HealthDataStore.loadAllData();

    expect(parseTextFile).toHaveBeenCalledWith('/data/blood.txt');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/store/__tests__/health-data.test.ts --run`
Expected: FAIL - parsePdf not being called for .pdf files

**Step 3: Update HealthDataStore to handle PDF**

Edit `src/lib/store/health-data.ts`:

First, add import at top (after line 3):
```typescript
import { parsePdf } from '@/lib/parsers/pdf';
```

Then modify `loadAllData()` method. Change lines 43-45 from:
```typescript
    for (const file of files) {
      if (file.type === 'bloodwork' && file.extension === '.txt') {
        biomarkerText = parseTextFile(file.path);
```

To:
```typescript
    for (const file of files) {
      if (file.type === 'bloodwork') {
        if (file.extension === '.txt') {
          biomarkerText = parseTextFile(file.path);
        } else if (file.extension === '.pdf') {
          // PDF parsing is async, but we handle it synchronously for now
          // by using a sync wrapper pattern
          biomarkerText = await this.loadPdfText(file.path);
        }
```

And add helper method to the class (before `ensureLoaded`):
```typescript
  private async loadPdfText(filePath: string): Promise<string> {
    try {
      return await parsePdf(filePath);
    } catch (error) {
      console.error('[HealthAI] Failed to load PDF:', error);
      return '';
    }
  }
```

**Note:** Since `loadAllData` will need to become async, we need to refactor. Here's the full updated method:

```typescript
  async loadAllData(): Promise<void> {
    const files = getDataFiles();

    let biomarkerText = '';
    let bodyCompText = '';
    const activityRows: CsvRow[] = [];

    for (const file of files) {
      if (file.type === 'bloodwork') {
        if (file.extension === '.txt') {
          biomarkerText = parseTextFile(file.path);
        } else if (file.extension === '.pdf') {
          biomarkerText = await parsePdf(file.path);
        }
      } else if (file.type === 'dexa' && file.extension === '.txt') {
        bodyCompText = parseTextFile(file.path);
      } else if (file.type === 'activity' && file.extension === '.csv') {
        const rows = parseCsv(file.path);
        activityRows.push(...rows);
      }
    }

    // Extract biomarkers
    this.data.biomarkers = extractBiomarkers(biomarkerText);

    // Get patient age from biomarkers extraction
    this.data.chronologicalAge = this.data.biomarkers.patientAge ?? null;

    // Extract body composition
    this.data.bodyComp = extractBodyComposition(bodyCompText);

    // Parse activity data
    this.data.activity = activityRows.map((row) => ({
      date: String(row.date ?? ''),
      hrv: Number(row.hrv_ms ?? 0),
      rhr: Number(row.rhr_bpm ?? 0),
      sleepHours: Number(row.sleep_hours ?? 0),
      sleepScore: row.sleep_score !== undefined ? Number(row.sleep_score) : undefined,
      strain: row.strain !== undefined ? Number(row.strain) : undefined,
    }));

    // Calculate PhenoAge if we have age and biomarkers
    if (this.data.chronologicalAge !== null) {
      this.data.phenoAge = calculatePhenoAge(
        this.data.biomarkers,
        this.data.chronologicalAge
      );
    }

    this.loaded = true;
    console.log('[HealthAI] Health data loaded successfully');
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.loadAllData();
    }
  }
```

Also update all getter methods to be async or use sync initialization. Since Next.js server components can use async/await, update getters:

```typescript
  async getBiomarkers(): Promise<ExtractedBiomarkers> {
    await this.ensureLoaded();
    return this.data.biomarkers;
  }

  async getBodyComp(): Promise<BodyComposition> {
    await this.ensureLoaded();
    return this.data.bodyComp;
  }

  async getActivity(): Promise<ActivityData[]> {
    await this.ensureLoaded();
    return this.data.activity;
  }

  async getPhenoAge(): Promise<PhenoAgeResult | null> {
    await this.ensureLoaded();
    return this.data.phenoAge;
  }

  async getChronologicalAge(): Promise<number | null> {
    await this.ensureLoaded();
    return this.data.chronologicalAge;
  }

  async getHealthSummary(): Promise<string> {
    await this.ensureLoaded();
    // ... rest of method unchanged
  }
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/store/__tests__/health-data.test.ts --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/store/health-data.ts src/lib/store/__tests__/health-data.test.ts
git commit -m "feat: add PDF bloodwork support to HealthDataStore"
```

---

### Task 5: Update All Consumers of HealthDataStore

**Files:**
- Modify: All files importing from `@/lib/store/health-data`

Since HealthDataStore methods are now async, update all consumers:

**Step 1: Find all consumers**

```bash
grep -r "HealthDataStore" --include="*.ts" --include="*.tsx" src/
```

**Step 2: Update each file to use await**

Files to update:
- `src/app/(main)/biomarkers/page.tsx`
- `src/app/(main)/goals/page.tsx`
- `src/app/(main)/body-comp/page.tsx`
- `src/app/(main)/lifestyle/page.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/app/page.tsx`
- `src/app/api/chat/route.ts`
- `src/app/api/sync/route.ts`
- `src/app/api/goals/chat/route.ts`

Example change for `biomarkers/page.tsx`:
```typescript
// Before
function getBiomarkers(): ... {
  return HealthDataStore.getBiomarkers();
}

// After
async function getBiomarkers(): Promise<...> {
  return await HealthDataStore.getBiomarkers();
}
```

**Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: update all HealthDataStore consumers to async"
```

---

### Task 6: Test End-to-End with Real PDF

**Step 1: Run the dev server**

```bash
npm run dev
```

**Step 2: Verify in browser**

1. Navigate to http://localhost:3000/biomarkers
2. Verify biomarkers are extracted from the PDF
3. Check console for `[HealthAI] Parsed PDF:` log message

**Step 3: Run all tests**

```bash
npm run test -- --run
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify PDF parsing works end-to-end"
```

---

## Summary of Changes

1. **Dependencies**: Added `pdf-parse` and `vitest`
2. **`src/lib/files.ts`**: Added `.pdf` to supported extensions
3. **`src/lib/parsers/pdf.ts`**: New PDF parser using pdf-parse
4. **`src/lib/store/health-data.ts`**: Made async, added PDF handling for bloodwork
5. **All consumers**: Updated to use async/await pattern
6. **Tests**: Added for files.ts, pdf.ts, and health-data.ts
