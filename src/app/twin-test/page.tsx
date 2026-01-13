'use client';

import { TwinCanvas } from '@/components/digital-twin/TwinCanvas';

export default function TwinTestPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Digital Twin Test</h1>
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        <TwinCanvas />
      </div>
    </div>
  );
}
