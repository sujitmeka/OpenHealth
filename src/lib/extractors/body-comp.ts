export interface BodyComposition {
  bodyFatPercent?: number;
  leanMass?: number;
  fatMass?: number;
  boneMineralContent?: number;
  visceralFat?: number;
  boneDensityTScore?: number;
  almi?: number;
}

interface BodyCompPattern {
  key: keyof BodyComposition;
  patterns: RegExp[];
}

const BODY_COMP_PATTERNS: BodyCompPattern[] = [
  {
    key: 'bodyFatPercent',
    patterns: [
      /total body fat[:\s]+(\d+\.?\d*)%?/i,
      /body fat[:\s]+(\d+\.?\d*)%?/i,
    ],
  },
  {
    key: 'leanMass',
    patterns: [
      /total lean mass[:\s]+(\d+\.?\d*)\s*lbs?/i,
      /lean mass[:\s]+(\d+\.?\d*)\s*lbs?/i,
    ],
  },
  {
    key: 'fatMass',
    patterns: [
      /total fat mass[:\s]+(\d+\.?\d*)\s*lbs?/i,
      /fat mass[:\s]+(\d+\.?\d*)\s*lbs?/i,
    ],
  },
  {
    key: 'boneMineralContent',
    patterns: [
      /bone mineral content[:\s]+(\d+\.?\d*)\s*lbs?/i,
      /bmc[:\s]+(\d+\.?\d*)\s*lbs?/i,
    ],
  },
  {
    key: 'visceralFat',
    patterns: [
      /visceral adipose tissue[^:]*[:\s]+(\d+\.?\d*)\s*lbs?/i,
      /vat[:\s]+(\d+\.?\d*)\s*lbs?/i,
      /visceral fat[:\s]+(\d+\.?\d*)\s*lbs?/i,
    ],
  },
  {
    key: 'boneDensityTScore',
    patterns: [
      /whole body t-score[:\s]+(-?\d+\.?\d*)/i,
      /t-score[:\s]+(-?\d+\.?\d*)/i,
      /lumbar spine t-score[:\s]+(-?\d+\.?\d*)/i,
    ],
  },
  {
    key: 'almi',
    patterns: [/almi[:\s]+(\d+\.?\d*)/i],
  },
];

export function extractBodyComposition(text: string): BodyComposition {
  const bodyComp: BodyComposition = {};

  for (const { key, patterns } of BODY_COMP_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          bodyComp[key] = value;
          break;
        }
      }
    }
  }

  return bodyComp;
}
