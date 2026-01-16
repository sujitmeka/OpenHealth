// Cache Manifest
// Tracks which files have been processed and their hashes

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_DIR = path.join(DATA_DIR, '.cache');
const MANIFEST_FILE = path.join(CACHE_DIR, 'manifest.json');

export interface FileEntry {
  path: string;
  hash: string;
  extractedAt: string;
  type: 'bloodwork' | 'dexa' | 'activity';
}

export interface CacheManifest {
  version: number;
  lastUpdated: string;
  files: Record<string, FileEntry>; // keyed by relative path
}

const CURRENT_VERSION = 1;

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Read the cache manifest
 */
export function readManifest(): CacheManifest {
  try {
    if (fs.existsSync(MANIFEST_FILE)) {
      const data = fs.readFileSync(MANIFEST_FILE, 'utf-8');
      const manifest = JSON.parse(data) as CacheManifest;

      // Version check - if outdated, return empty manifest
      if (manifest.version !== CURRENT_VERSION) {
        console.log('[Cache] Manifest version mismatch, starting fresh');
        return createEmptyManifest();
      }

      return manifest;
    }
  } catch (error) {
    console.error('[Cache] Error reading manifest:', error);
  }

  return createEmptyManifest();
}

/**
 * Write the cache manifest
 */
export function writeManifest(manifest: CacheManifest): void {
  try {
    ensureCacheDir();
    manifest.lastUpdated = new Date().toISOString();
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log(`[Cache] Manifest updated with ${Object.keys(manifest.files).length} files`);
  } catch (error) {
    console.error('[Cache] Error writing manifest:', error);
  }
}

/**
 * Check if a file needs re-extraction
 */
export function needsExtraction(
  manifest: CacheManifest,
  relativePath: string,
  currentHash: string
): boolean {
  const entry = manifest.files[relativePath];

  if (!entry) {
    console.log(`[Cache] ${relativePath}: not in manifest, needs extraction`);
    return true;
  }

  if (entry.hash !== currentHash) {
    console.log(`[Cache] ${relativePath}: hash changed, needs extraction`);
    return true;
  }

  console.log(`[Cache] ${relativePath}: unchanged, using cache`);
  return false;
}

/**
 * Update manifest entry after successful extraction
 */
export function updateManifestEntry(
  manifest: CacheManifest,
  relativePath: string,
  hash: string,
  type: FileEntry['type']
): void {
  manifest.files[relativePath] = {
    path: relativePath,
    hash,
    extractedAt: new Date().toISOString(),
    type,
  };
}

function createEmptyManifest(): CacheManifest {
  return {
    version: CURRENT_VERSION,
    lastUpdated: new Date().toISOString(),
    files: {},
  };
}

/**
 * Clear the entire cache (manifest + all cached data)
 */
export function clearAllCache(): void {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true });
      console.log('[Cache] All cache cleared');
    }
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
  }
}
