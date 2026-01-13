/**
 * Skin Tone and Vitality Visuals
 *
 * Maps energy level to base material color for the body.
 * High energy: warm white/cream tone
 * Low energy: cooler gray, slightly desaturated
 */

/**
 * Convert HSL values to hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number): string => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Linear interpolation between two values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Get vitality color based on energy level
 *
 * High energy (80-100): Warm white/cream - hsl(30, 10%, 90%)
 * Medium energy (50-79): Neutral white - hsl(30, 5%, 88%)
 * Low energy (20-49): Cool gray - hsl(220, 5%, 82%)
 * Very low energy (0-19): Cool desaturated gray - hsl(220, 5%, 80%)
 *
 * @param energyLevel - Energy level from 0-100
 * @returns Hex color string
 */
export function getVitalityColor(energyLevel: number): string {
  // Clamp energy level to 0-100
  const energy = Math.max(0, Math.min(100, energyLevel));

  // Normalize to 0-1
  const t = energy / 100;

  // High energy: warm hue (30 = orange-ish), more saturation, lighter
  // Low energy: cool hue (220 = blue-ish), less saturation, darker

  // Hue: 220 (cool blue) at low energy → 30 (warm orange) at high energy
  const h = lerp(220, 30, t);

  // Saturation: 5% at low energy → 10% at high energy
  const s = lerp(5, 10, t);

  // Lightness: 80% at low energy → 92% at high energy
  const l = lerp(80, 92, t);

  return hslToHex(h, s, l);
}

/**
 * Vitality preset colors for quick reference
 */
export const VITALITY_PRESETS = {
  optimal: getVitalityColor(100), // Warm white
  good: getVitalityColor(75), // Slightly warm
  fair: getVitalityColor(50), // Neutral
  poor: getVitalityColor(25), // Cool gray
  critical: getVitalityColor(0), // Cold gray
} as const;
