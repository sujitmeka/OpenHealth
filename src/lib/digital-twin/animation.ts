/**
 * Animation utilities for smooth transitions
 *
 * Provides lerp interpolation for posture, highlights, and colors.
 */

import { MathUtils, Color } from 'three';

/** Animation speed multiplier (lower = slower transitions) */
export const ANIMATION_SPEED = 2.0;

/**
 * Lerp a single value toward target
 */
export function lerpValue(current: number, target: number, delta: number, speed: number = ANIMATION_SPEED): number {
  return MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
}

/**
 * Check if value is close enough to target to stop animating
 */
export function isNearTarget(current: number, target: number, epsilon: number = 0.001): boolean {
  return Math.abs(current - target) < epsilon;
}

/**
 * Animated posture rotations state
 */
export interface AnimatedPosture {
  spineX: number;
  neckX: number;
  headX: number;
  leftShoulderZ: number;
  rightShoulderZ: number;
}

/**
 * Create default animated posture state
 */
export function createDefaultAnimatedPosture(): AnimatedPosture {
  return {
    spineX: 0,
    neckX: 0,
    headX: 0,
    leftShoulderZ: 0,
    rightShoulderZ: 0,
  };
}

/**
 * Lerp all posture values toward targets
 */
export function lerpPosture(
  current: AnimatedPosture,
  target: AnimatedPosture,
  delta: number,
  speed: number = ANIMATION_SPEED
): AnimatedPosture {
  return {
    spineX: lerpValue(current.spineX, target.spineX, delta, speed),
    neckX: lerpValue(current.neckX, target.neckX, delta, speed),
    headX: lerpValue(current.headX, target.headX, delta, speed),
    leftShoulderZ: lerpValue(current.leftShoulderZ, target.leftShoulderZ, delta, speed),
    rightShoulderZ: lerpValue(current.rightShoulderZ, target.rightShoulderZ, delta, speed),
  };
}

/**
 * Lerp between two hex colors
 */
export function lerpColor(currentHex: string, targetHex: string, delta: number, speed: number = ANIMATION_SPEED): string {
  const current = new Color(currentHex);
  const target = new Color(targetHex);

  const t = 1 - Math.exp(-speed * delta);
  current.lerp(target, t);

  return '#' + current.getHexString();
}
