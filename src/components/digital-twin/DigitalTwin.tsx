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
    <div className={className}>
      <TwinCanvas>
        <ProceduralHuman bodyState={bodyState} />
      </TwinCanvas>
    </div>
  );
}
