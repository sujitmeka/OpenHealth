// Body Composition Cache
// Persists extracted DEXA scan data to avoid re-extraction

import fs from 'fs';
import path from 'path';
import { BodyComposition } from '@/lib/extractors/body-comp';

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_DIR = path.join(DATA_DIR, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'body-composition.json');

export interface BodyCompCache {
  version: number;
  extractedAt: string;
  sourceFile: string;
  sourceHash: string;
  data: BodyComposition;
}

const CURRENT_VERSION = 1;

/**
 * Check if body composition data is valid (not empty)
 */
function isValidBodyCompData(data: BodyComposition): boolean {
  // Must have at least one meaningful field
  return !!(
    data.bodyFatPercent ||
    data.leanMass ||
    data.fatMass ||
    data.boneMineralContent ||
    data.totalMass
  );
}

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Read body composition from cache
 */
export function readBodyCompCache(): BodyCompCache | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null;
    }
    const data = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache = JSON.parse(data) as BodyCompCache;

    if (cache.version !== CURRENT_VERSION) {
      return null;
    }

    // Validate cached data is not empty
    if (!isValidBodyCompData(cache.data)) {
      console.log('[Cache] Body comp cache contains invalid/empty data, ignoring');
      return null;
    }

    return cache;
  } catch (error) {
    console.error('[Cache] Error reading body comp cache:', error);
    return null;
  }
}

/**
 * Write body composition to cache
 */
export function writeBodyCompCache(
  data: BodyComposition,
  sourceFile: string,
  sourceHash: string
): void {
  try {
    ensureCacheDir();
    const cache: BodyCompCache = {
      version: CURRENT_VERSION,
      extractedAt: new Date().toISOString(),
      sourceFile,
      sourceHash,
      data,
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('[Cache] Body composition saved to cache');
  } catch (error) {
    console.error('[Cache] Error writing body comp cache:', error);
  }
}

/**
 * Check if cached body comp matches current file hash
 */
export function isBodyCompCacheValid(currentHash: string): boolean {
  const cache = readBodyCompCache();
  return cache !== null && cache.sourceHash === currentHash;
}

/**
 * Clear the body composition cache
 */
export function clearBodyCompCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      console.log('[Cache] Body composition cache cleared');
    }
  } catch (error) {
    console.error('[Cache] Error clearing body comp cache:', error);
  }
}
