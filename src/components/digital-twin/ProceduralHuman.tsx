'use client';

import { useRef } from 'react';
import { Group } from 'three';

// Material color for mannequin-like appearance
const BODY_COLOR = '#f0f0f0';

interface ProceduralHumanProps {
  position?: [number, number, number];
}

function Head(): React.JSX.Element {
  return (
    <group position={[0, 0.35, 0]}>
      {/* Head - sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={BODY_COLOR} />
      </mesh>
    </group>
  );
}

function Neck(): React.JSX.Element {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Neck - cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.15, 16]} />
        <meshStandardMaterial color={BODY_COLOR} />
      </mesh>
    </group>
  );
}

function Torso(): React.JSX.Element {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Upper torso (chest) - wider capsule */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.25, 8, 16]} />
        <meshStandardMaterial color={BODY_COLOR} />
      </mesh>

      {/* Lower torso (abdomen) - slightly narrower */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.15, 8, 16]} />
        <meshStandardMaterial color={BODY_COLOR} />
      </mesh>
    </group>
  );
}

export function ProceduralHuman({ position = [0, 0, 0] }: ProceduralHumanProps): React.JSX.Element {
  const groupRef = useRef<Group>(null);

  // Position the body so feet are at Y=0
  // Total height: ~1.8 units (human-like proportions)
  // Head top: ~1.8, feet: 0
  const bodyOffset = 0.9; // Center of body

  return (
    <group ref={groupRef} position={position}>
      {/* Main body group - offset to position feet at ground */}
      <group position={[0, bodyOffset, 0]}>
        {/* Head & Neck */}
        <group position={[0, 0.5, 0]}>
          <Head />
          <Neck />
        </group>

        {/* Torso */}
        <Torso />
      </group>
    </group>
  );
}
