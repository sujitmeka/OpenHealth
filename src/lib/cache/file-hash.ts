// File Hash Utilities
// Used to detect if files have changed since last extraction

import fs from 'fs';
import crypto from 'crypto';

/**
 * Calculate MD5 hash of a file's contents
 * Used to detect if a file has changed since last extraction
 */
export function calculateFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    console.error(`[Cache] Error hashing file ${filePath}:`, error);
    return '';
  }
}

/**
 * Calculate hash for a folder (based on file list + sizes + modification times)
 * Used for activity data folders (Whoop, Apple Health, etc.)
 */
export function calculateFolderHash(folderPath: string): string {
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    const fileInfo = files
      .filter((f) => f.isFile())
      .map((f) => {
        const stats = fs.statSync(`${folderPath}/${f.name}`);
        return `${f.name}:${stats.size}:${stats.mtimeMs}`;
      })
      .sort()
      .join('|');

    return crypto.createHash('md5').update(fileInfo).digest('hex');
  } catch (error) {
    console.error(`[Cache] Error hashing folder ${folderPath}:`, error);
    return '';
  }
}
