/**
 * Posture System - Joint Rotations
 *
 * Returns rotation values for body parts based on energy level and posture state.
 * All values in radians for Three.js rotation properties.
 */

import { PostureState } from './types';

export interface PostureRotations {
  /** Spine forward bend (X rotation) */
  spineX: number;
  /** Neck forward droop (X rotation) */
  neckX: number;
  /** Shoulder inward rotation (Z rotation for each) */
  shoulderZ: number;
  /** Head tilt down */
  headX: number;
}

/**
 * Posture rotation presets
 */
const POSTURE_PRESETS: Record<PostureState, PostureRotations> = {
  upright: {
    spineX: 0,
    neckX: 0,
    shoulderZ: 0,
    headX: 0,
  },
  neutral: {
    spineX: 0.05,
    neckX: 0.03,
    shoulderZ: 0.02,
    headX: 0.02,
  },
  slouched: {
    spineX: 0.15,
    neckX: 0.1,
    shoulderZ: 0.08,
    headX: 0.08,
  },
  fatigued: {
    spineX: 0.25,
    neckX: 0.18,
    shoulderZ: 0.12,
    headX: 0.15,
  },
};

/**
 * Get posture rotations based on energy level and posture state
 *
 * @param energyLevel - 0-100 energy score
 * @param postureState - Current posture state
 * @returns Rotation values in radians
 */
export function getPostureRotations(
  energyLevel: number,
  postureState: PostureState
): PostureRotations {
  // Get base rotations from preset
  const baseRotations = POSTURE_PRESETS[postureState];

  // Optionally modulate based on exact energy level for smoother transitions
  // Lower energy = slightly more pronounced rotations within the posture
  const energyFactor = 1 - (energyLevel / 100) * 0.2; // 0.8-1.0 range

  return {
    spineX: baseRotations.spineX * energyFactor,
    neckX: baseRotations.neckX * energyFactor,
    shoulderZ: baseRotations.shoulderZ * energyFactor,
    headX: baseRotations.headX * energyFactor,
  };
}

/**
 * Calculate arm rotations based on energy
 * Tired = arms hang more loosely
 */
export function getArmRotations(energyLevel: number): {
  leftShoulderZ: number;
  rightShoulderZ: number;
} {
  // Tired: arms rotate slightly inward (protective posture)
  const baseRotation = energyLevel < 50 ? 0.15 : energyLevel < 70 ? 0.08 : 0.05;

  return {
    leftShoulderZ: -baseRotation, // Left arm rotates negative Z
    rightShoulderZ: baseRotation, // Right arm rotates positive Z
  };
}
