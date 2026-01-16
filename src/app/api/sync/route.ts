import { NextResponse } from 'next/server';
import { getDataFiles } from '@/lib/files';
import { parsePdf } from '@/lib/parsers/pdf';
import { extractBiomarkersWithAI } from '@/lib/extractors/ai-extractor';
import {
  writeCache,
  normalizeBiomarkerName,
  getDisplayName,
  type BiomarkerCache,
  type CachedBiomarker,
} from '@/lib/cache/biomarker-cache';
import { calculateFileHash } from '@/lib/cache/file-hash';
import { calculateDerivedBiomarkers } from '@/lib/biomarkers/calculations';

export async function POST(): Promise<NextResponse> {
  try {
    console.log('[Sync] Starting data sync...');

    const files = getDataFiles();
    console.log(`[Sync] Found ${files.length} data files`);

    // Find bloodwork PDF
    const bloodworkFile = files.find(
      (f) => f.type === 'bloodwork' && f.extension === '.pdf'
    );

    if (!bloodworkFile) {
      console.log('[Sync] No bloodwork PDF found');
      return NextResponse.json({
        success: true,
        message: 'No bloodwork PDF found in /data folder',
        biomarkersExtracted: 0,
      });
    }

    console.log(`[Sync] Processing: ${bloodworkFile.name}`);

    // Extract text from PDF
    const pdfText = await parsePdf(bloodworkFile.path);
    if (!pdfText) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse PDF' },
        { status: 500 }
      );
    }

    console.log(`[Sync] PDF parsed: ${pdfText.length} characters`);

    // Extract biomarkers using AI
    const extracted = await extractBiomarkersWithAI(pdfText);
    const rawBiomarkers = extracted.all ?? [];

    console.log(`[Sync] AI extracted ${rawBiomarkers.length} raw biomarkers`);

    // Deduplicate and normalize biomarkers
    const biomarkerMap = new Map<string, CachedBiomarker>();

    for (const marker of rawBiomarkers) {
      const id = normalizeBiomarkerName(marker.name);

      // Skip if we already have this biomarker (first occurrence wins)
      if (biomarkerMap.has(id)) {
        continue;
      }

      biomarkerMap.set(id, {
        id,
        name: getDisplayName(id, marker.name),
        value: marker.value,
        unit: marker.unit,
        referenceRange: marker.referenceRange,
        labStatus: marker.status,
        category: marker.category,
        source: 'measured',
      });
    }

    // Build raw values for calculated biomarkers
    const rawValues: Record<string, number> = {};
    for (const [id, marker] of biomarkerMap) {
      rawValues[id] = marker.value;
    }

    // Calculate derived biomarkers
    const calculatedBiomarkers = calculateDerivedBiomarkers(rawValues);
    console.log(`[Sync] Calculated ${calculatedBiomarkers.length} derived biomarkers`);

    for (const calc of calculatedBiomarkers) {
      // Don't overwrite measured values
      if (biomarkerMap.has(calc.id)) {
        continue;
      }

      biomarkerMap.set(calc.id, {
        id: calc.id,
        name: calc.name,
        value: calc.value,
        unit: calc.unit,
        category: 'calculated',
        source: 'calculated',
      });
    }

    // Create cache object
    const cache: BiomarkerCache = {
      version: 1,
      extractedAt: new Date().toISOString(),
      sourceFile: bloodworkFile.name,
      sourceHash: calculateFileHash(bloodworkFile.path),
      patientAge: extracted.patientAge,
      biomarkers: Array.from(biomarkerMap.values()),
    };

    // Write to cache file
    writeCache(cache);

    const measuredCount = cache.biomarkers.filter((b) => b.source === 'measured').length;
    const calculatedCount = cache.biomarkers.filter((b) => b.source === 'calculated').length;

    console.log(`[Sync] Complete: ${measuredCount} measured + ${calculatedCount} calculated = ${cache.biomarkers.length} total`);

    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      biomarkersExtracted: cache.biomarkers.length,
      measured: measuredCount,
      calculated: calculatedCount,
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
