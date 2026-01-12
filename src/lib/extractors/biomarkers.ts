export interface ExtractedBiomarkers {
  // Levine PhenoAge biomarkers
  albumin?: number;
  creatinine?: number;
  glucose?: number;
  crp?: number;
  lymphocytePercent?: number;
  mcv?: number;
  rdw?: number;
  alkalinePhosphatase?: number;
  wbc?: number;

  // Lipid panel
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  totalCholesterol?: number;

  // Additional markers
  vitaminD?: number;
  hba1c?: number;
  fastingInsulin?: number;
  homocysteine?: number;
  ferritin?: number;

  // Thyroid
  tsh?: number;
  freeT4?: number;
  freeT3?: number;

  // Metadata
  patientAge?: number;
}

interface BiomarkerPattern {
  key: keyof ExtractedBiomarkers;
  patterns: RegExp[];
}

const BIOMARKER_PATTERNS: BiomarkerPattern[] = [
  // Levine PhenoAge biomarkers
  {
    key: 'albumin',
    patterns: [/albumin[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'creatinine',
    patterns: [/creatinine[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'glucose',
    patterns: [
      /glucose[,\s]*fasting[:\s]+(\d+\.?\d*)/i,
      /fasting[,\s]*glucose[:\s]+(\d+\.?\d*)/i,
      /glucose[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'crp',
    patterns: [
      /c-reactive protein[^:]*[:\s]+(\d+\.?\d*)/i,
      /crp[:\s]+(\d+\.?\d*)/i,
      /hs-crp[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'lymphocytePercent',
    patterns: [
      /lymphocyte percent[:\s]+(\d+\.?\d*)/i,
      /lymphocyte[s]?[:\s]+(\d+\.?\d*)%/i,
      /lymphocyte[s]?[:\s]+(\d+\.?\d*)\s*%/i,
    ],
  },
  {
    key: 'mcv',
    patterns: [
      /mean cell volume[^:]*[:\s]+(\d+\.?\d*)/i,
      /mcv[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'rdw',
    patterns: [
      /red cell distribution width[^:]*[:\s]+(\d+\.?\d*)/i,
      /rdw[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'alkalinePhosphatase',
    patterns: [
      /alkaline phosphatase[:\s]+(\d+\.?\d*)/i,
      /alk phos[:\s]+(\d+\.?\d*)/i,
      /alp[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'wbc',
    patterns: [
      /white blood cell count[^:]*[:\s]+(\d+\.?\d*)/i,
      /wbc[:\s]+(\d+\.?\d*)/i,
    ],
  },

  // Lipid panel
  {
    key: 'ldl',
    patterns: [
      /ldl cholesterol[:\s]+(\d+\.?\d*)/i,
      /ldl[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'hdl',
    patterns: [
      /hdl cholesterol[:\s]+(\d+\.?\d*)/i,
      /hdl[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'triglycerides',
    patterns: [/triglycerides[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'totalCholesterol',
    patterns: [
      /total cholesterol[:\s]+(\d+\.?\d*)/i,
      /^cholesterol[:\s]+(\d+\.?\d*)/im,
    ],
  },

  // Additional markers
  {
    key: 'vitaminD',
    patterns: [
      /vitamin d[,\s]*25-oh[:\s]+(\d+\.?\d*)/i,
      /25-oh[,\s]*vitamin d[:\s]+(\d+\.?\d*)/i,
      /vitamin d[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'hba1c',
    patterns: [/hba1c[:\s]+(\d+\.?\d*)/i, /hemoglobin a1c[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'fastingInsulin',
    patterns: [
      /fasting insulin[:\s]+(\d+\.?\d*)/i,
      /insulin[,\s]*fasting[:\s]+(\d+\.?\d*)/i,
    ],
  },
  {
    key: 'homocysteine',
    patterns: [/homocysteine[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'ferritin',
    patterns: [/ferritin[:\s]+(\d+\.?\d*)/i],
  },

  // Thyroid
  {
    key: 'tsh',
    patterns: [/tsh[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'freeT4',
    patterns: [/free t4[:\s]+(\d+\.?\d*)/i, /ft4[:\s]+(\d+\.?\d*)/i],
  },
  {
    key: 'freeT3',
    patterns: [/free t3[:\s]+(\d+\.?\d*)/i, /ft3[:\s]+(\d+\.?\d*)/i],
  },

  // Patient age
  {
    key: 'patientAge',
    patterns: [/age[:\s]+(\d+)\s*years/i, /age[:\s]+(\d+)/i],
  },
];

export function extractBiomarkers(text: string): ExtractedBiomarkers {
  const biomarkers: ExtractedBiomarkers = {};

  for (const { key, patterns } of BIOMARKER_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          biomarkers[key] = value;
          break;
        }
      }
    }
  }

  return biomarkers;
}

export function hasAllPhenoAgeInputs(biomarkers: ExtractedBiomarkers): boolean {
  const required: (keyof ExtractedBiomarkers)[] = [
    'albumin',
    'creatinine',
    'glucose',
    'crp',
    'lymphocytePercent',
    'mcv',
    'rdw',
    'alkalinePhosphatase',
    'wbc',
  ];

  return required.every((key) => biomarkers[key] !== undefined);
}
