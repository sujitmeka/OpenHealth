'use client';

import { useState } from 'react';
import { TwinCanvas } from '@/components/digital-twin/TwinCanvas';
import { ProceduralHuman } from '@/components/digital-twin/ProceduralHuman';
import { BodyState, PostureState } from '@/lib/digital-twin/types';

export default function TwinTestPage(): React.JSX.Element {
  const [energyLevel, setEnergyLevel] = useState(80);

  // Determine posture from energy
  const getPosture = (energy: number): PostureState => {
    if (energy >= 75) return 'upright';
    if (energy >= 55) return 'neutral';
    if (energy >= 35) return 'slouched';
    return 'fatigued';
  };

  const testBodyState: BodyState = {
    posture: getPosture(energyLevel),
    energyLevel,
    skinTone: '#f0f0f0',
    highlights: [],
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Digital Twin Test</h1>

      <div className="mb-4 flex items-center gap-4">
        <label className="font-medium">Energy Level: {energyLevel}</label>
        <input
          type="range"
          min="0"
          max="100"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm text-zinc-500">Posture: {testBodyState.posture}</span>
      </div>

      <div className="w-full max-w-2xl h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        <TwinCanvas>
          <ProceduralHuman bodyState={testBodyState} />
        </TwinCanvas>
      </div>
    </div>
  );
}
