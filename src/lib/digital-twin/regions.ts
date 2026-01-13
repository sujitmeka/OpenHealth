/**
 * Body Region Data Mapping
 *
 * Maps body regions to their associated health data for tooltips.
 */

import { HighlightArea } from './types';
import { ExtractedBiomarkers } from '@/lib/extractors/biomarkers';
import { BodyComposition } from '@/lib/extractors/body-comp';

export interface RegionInfo {
  label: string;
  description: string;
}

/**
 * Static region information
 */
export const REGION_INFO: Record<HighlightArea, RegionInfo> = {
  'torso-core': {
    label: 'Core / Abdomen',
    description: 'Visceral fat and metabolic health',
  },
  'left-shoulder': {
    label: 'Left Shoulder',
    description: 'Joint health and inflammation',
  },
  'right-shoulder': {
    label: 'Right Shoulder',
    description: 'Joint health and inflammation',
  },
  'left-elbow': {
    label: 'Left Elbow',
    description: 'Joint health',
  },
  'right-elbow': {
    label: 'Right Elbow',
    description: 'Joint health',
  },
  'left-hip': {
    label: 'Left Hip',
    description: 'Joint health and mobility',
  },
  'right-hip': {
    label: 'Right Hip',
    description: 'Joint health and mobility',
  },
  'left-knee': {
    label: 'Left Knee',
    description: 'Joint health and inflammation',
  },
  'right-knee': {
    label: 'Right Knee',
    description: 'Joint health and inflammation',
  },
  head: {
    label: 'Head',
    description: 'Cognitive health and rest quality',
  },
};

export interface RegionHealthData {
  label: string;
  description: string;
  metrics: { name: string; value: string; status?: 'good' | 'warning' | 'critical' }[];
}

/**
 * Get health data for a specific body region
 */
export function getRegionHealthData(
  area: HighlightArea,
  biomarkers: ExtractedBiomarkers,
  bodyComp: BodyComposition
): RegionHealthData {
  const info = REGION_INFO[area];
  const metrics: { name: string; value: string; status?: 'good' | 'warning' | 'critical' }[] = [];

  if (area === 'torso-core') {
    // Visceral fat
    if (bodyComp.visceralFat !== undefined) {
      const vf = bodyComp.visceralFat;
      const status = vf > 2.0 ? 'critical' : vf > 1.5 ? 'warning' : 'good';
      metrics.push({ name: 'Visceral Fat', value: `${vf.toFixed(2)} lbs`, status });
    }
    // Body fat percentage
    if (bodyComp.bodyFatPercent !== undefined) {
      const bf = bodyComp.bodyFatPercent;
      const status = bf > 25 ? 'warning' : bf > 30 ? 'critical' : 'good';
      metrics.push({ name: 'Body Fat', value: `${bf.toFixed(1)}%`, status });
    }
  }

  // Joint areas - show CRP (inflammation)
  const jointAreas: HighlightArea[] = [
    'left-shoulder',
    'right-shoulder',
    'left-elbow',
    'right-elbow',
    'left-hip',
    'right-hip',
    'left-knee',
    'right-knee',
  ];

  if (jointAreas.includes(area)) {
    if (biomarkers.crp !== undefined) {
      const crp = biomarkers.crp;
      const status = crp > 3.0 ? 'critical' : crp > 1.0 ? 'warning' : 'good';
      metrics.push({ name: 'CRP (Inflammation)', value: `${crp.toFixed(2)} mg/L`, status });
    }
  }

  // Head - cognitive/rest markers
  if (area === 'head') {
    if (biomarkers.glucose !== undefined) {
      const gluc = biomarkers.glucose;
      const status = gluc > 100 ? 'warning' : gluc > 126 ? 'critical' : 'good';
      metrics.push({ name: 'Glucose', value: `${gluc} mg/dL`, status });
    }
  }

  // If no specific metrics, show general info
  if (metrics.length === 0) {
    metrics.push({ name: 'Status', value: 'No data available' });
  }

  return {
    label: info.label,
    description: info.description,
    metrics,
  };
}
