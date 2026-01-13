'use client';

import { CARD_CLASSES, STATUS_COLORS } from '@/lib/design/tokens';
import { Sparkline } from '@/components/charts/Sparkline';
import type { PhenoAgeResult } from '@/lib/calculations/phenoage';

interface BiologicalAgeCardProps {
  chronologicalAge: number | null;
  phenoAge: PhenoAgeResult | null;
  history?: number[];
}

export function BiologicalAgeCard({
  chronologicalAge,
  phenoAge,
  history,
}: BiologicalAgeCardProps): React.JSX.Element {
  const hasData = chronologicalAge !== null && phenoAge !== null;
  const delta = phenoAge?.delta ?? 0;
  const isYounger = delta < 0;
  const deltaColor = isYounger ? STATUS_COLORS.optimal.base : STATUS_COLORS.outOfRange.base;
  const statusType = isYounger ? 'optimal' : 'outOfRange';

  return (
    <div className={`${CARD_CLASSES.base} ${CARD_CLASSES.padding}`}>
      <h3 className="text-sm font-medium text-slate-500 mb-4">Biological Age</h3>

      {hasData ? (
        <div className="space-y-4">
          {/* Main display */}
          <div className="flex items-end gap-8">
            {/* Biological Age (large) */}
            <div>
              <div className="text-4xl font-bold text-slate-900">
                {phenoAge.phenoAge.toFixed(1)}
              </div>
              <div className="text-sm text-slate-500 mt-1">years (PhenoAge)</div>
            </div>

            {/* Delta */}
            <div className="pb-1">
              <div
                className="text-2xl font-semibold flex items-center gap-1"
                style={{ color: deltaColor }}
              >
                {isYounger ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {Math.abs(delta).toFixed(1)} years
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                {isYounger ? 'younger than actual' : 'older than actual'}
              </div>
            </div>
          </div>

          {/* Chronological age */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-sm text-slate-500">Chronological Age:</span>
              <span className="text-sm font-medium text-slate-900 ml-2">{chronologicalAge} years</span>
            </div>

            {/* Sparkline if history available */}
            {history && history.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Trend</span>
                <Sparkline
                  data={history}
                  status={statusType}
                  width={80}
                  height={30}
                />
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div
            className="text-sm font-medium px-3 py-2 rounded-lg text-center"
            style={{
              backgroundColor: isYounger ? STATUS_COLORS.optimal.light : STATUS_COLORS.outOfRange.light,
              color: isYounger ? STATUS_COLORS.optimal.text : STATUS_COLORS.outOfRange.text,
            }}
          >
            {isYounger
              ? 'Your biological age is younger than your actual age'
              : 'Your biological age is older than your actual age'}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500">
            Add blood work data to calculate your biological age.
          </p>
        </div>
      )}
    </div>
  );
}
