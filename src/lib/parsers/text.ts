import fs from 'fs';

export function parseTextFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('[HealthAI] Error reading text file:', filePath, error);
    return '';
  }
}
