'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ReactNode } from 'react';

interface TwinCanvasProps {
  children?: ReactNode;
}

function Lighting(): React.JSX.Element {
  return (
    <>
      {/* Soft ambient fill light */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* Main directional light - subtle shadows */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim light from behind for depth */}
      <directionalLight
        position={[-3, 5, -5]}
        intensity={0.3}
        color="#e0e8f0"
      />
    </>
  );
}

function TestBox(): React.JSX.Element {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#f5f5f5" />
    </mesh>
  );
}

export function TwinCanvas({ children }: TwinCanvasProps): React.JSX.Element {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Soft gray gradient background */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #f0f2f5 0%, #d8dce3 50%, #c5cad3 100%)'
        }}
      />

      <Canvas
        shadows
        camera={{
          position: [0, 1.5, 4],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        style={{ position: 'relative' }}
      >
        <Lighting />

        {/* Ground plane for reference */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#e8eaed" transparent opacity={0.5} />
        </mesh>

        {/* Test box - will be replaced with human model */}
        {children ?? <TestBox />}

        {/* OrbitControls for user interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}
