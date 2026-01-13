'use client';

import { useMemo } from 'react';
import { TwinCanvas } from './TwinCanvas';
import { ProceduralHuman } from './ProceduralHuman';
import { HealthDataStore } from '@/lib/store/health-data';
import { mapHealthToBodyState, HealthDataInput } from '@/lib/digital-twin/mapper';
import { BodyState, DEFAULT_BODY_STATE } from '@/lib/digital-twin/types';

interface DigitalTwinProps {
  className?: string;
}

/**
 * Get overall status from energy level
 */
function getOverallStatus(energyLevel: number): { label: string; color: string } {
  if (energyLevel >= 75) {
    return { label: 'Optimal', color: 'text-green-600 dark:text-green-400' };
  }
  if (energyLevel >= 55) {
    return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  }
  if (energyLevel >= 35) {
    return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
  }
  return { label: 'Needs Attention', color: 'text-red-600 dark:text-red-400' };
}

interface StatusOverlayProps {
  energyLevel: number;
  highlightCount: number;
}

function StatusOverlay({ energyLevel, highlightCount }: StatusOverlayProps): React.JSX.Element {
  const status = getOverallStatus(energyLevel);

  return (
    <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 rounded-lg p-3 shadow-sm backdrop-blur-sm">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Status</div>
      <div className={`text-sm font-semibold ${status.color}`}>{status.label}</div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Energy</span>
          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            {energyLevel}%
          </span>
        </div>

        {/* Energy bar */}
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${energyLevel}%` }}
          />
        </div>

        {highlightCount > 0 && (
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Areas of concern</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {highlightCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Digital Twin wrapper component
 *
 * Reads health data from HealthDataStore, maps it to BodyState,
 * and renders the ProceduralHuman with the calculated state.
 */
export function DigitalTwin({ className }: DigitalTwinProps): React.JSX.Element {
  // Get health data from store and map to body state
  const bodyState: BodyState = useMemo(() => {
    try {
      const healthData: HealthDataInput = {
        biomarkers: HealthDataStore.getBiomarkers(),
        bodyComp: HealthDataStore.getBodyComp(),
        activity: HealthDataStore.getActivity(),
      };

      const state = mapHealthToBodyState(healthData);

      // Console log for debugging (acceptance criteria requirement)
      console.log('[DigitalTwin] Health data input:', healthData);
      console.log('[DigitalTwin] Mapped body state:', state);

      return state;
    } catch (error) {
      console.error('[DigitalTwin] Error mapping health data:', error);
      return DEFAULT_BODY_STATE;
    }
  }, []);

  return (
    <div className={`relative ${className ?? ''}`}>
      <TwinCanvas>
        <ProceduralHuman bodyState={bodyState} />
      </TwinCanvas>
      <StatusOverlay
        energyLevel={bodyState.energyLevel}
        highlightCount={bodyState.highlights.length}
      />
    </div>
  );
}
