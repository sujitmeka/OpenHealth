'use client';

import Link from 'next/link';
import {
  BACKGROUNDS,
  BORDERS,
  SHADOWS,
  TEXT_COLORS,
  RADIUS,
  STATUS_COLORS,
} from '@/lib/design/tokens';
import type { BiomarkerStatus } from '@/lib/types/health';

export interface TopMarker {
  name: string;
  value: number;
  unit: string;
  status: BiomarkerStatus;
}

interface TopMarkersCardProps {
  markers: TopMarker[];
}

/**
 * Get status dot color from status
 */
function getStatusColor(status: BiomarkerStatus): string {
  switch (status) {
    case 'optimal':
      return STATUS_COLORS.optimal.base;
    case 'normal':
    case 'borderline':
      return STATUS_COLORS.normal.base;
    case 'out_of_range':
      return STATUS_COLORS.outOfRange.base;
    default:
      return TEXT_COLORS.muted;
  }
}

/**
 * Get status label for accessibility
 */
function getStatusLabel(status: BiomarkerStatus): string {
  switch (status) {
    case 'optimal':
      return 'Optimal';
    case 'normal':
      return 'Normal';
    case 'borderline':
      return 'Borderline';
    case 'out_of_range':
      return 'Out of Range';
    default:
      return 'Unknown';
  }
}

/**
 * TopMarkersCard - Shows top 5 personalized biomarkers
 *
 * Displays key markers with status indicators.
 * Selection logic is handled separately by selectTopMarkers.
 */
export function TopMarkersCard({
  markers,
}: TopMarkersCardProps): React.JSX.Element {
  // Ensure we show exactly 5 markers (pad with empty if needed)
  const displayMarkers = markers.slice(0, 5);

  return (
    <div
      className="h-full"
      style={{
        background: BACKGROUNDS.card,
        borderRadius: RADIUS.lg,
        boxShadow: SHADOWS.sm,
        border: `1px solid ${BORDERS.light}`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: `1px solid ${BORDERS.light}` }}
      >
        <h3
          className="font-semibold text-sm"
          style={{ color: TEXT_COLORS.primary }}
        >
          Markers to Watch
        </h3>
        <p className="text-xs mt-0.5" style={{ color: TEXT_COLORS.muted }}>
          Your key health indicators
        </p>
      </div>

      {/* Markers list */}
      <div className="px-5 py-3">
        {displayMarkers.length === 0 ? (
          <div
            className="py-6 text-center text-sm"
            style={{ color: TEXT_COLORS.muted }}
          >
            No biomarker data available
          </div>
        ) : (
          <ul className="space-y-3">
            {displayMarkers.map((marker, index) => (
              <li key={`${marker.name}-${index}`}>
                <Link
                  href="/biomarkers"
                  className="flex items-center justify-between py-1.5 rounded transition-colors hover:bg-slate-50"
                >
                  {/* Left: Status dot + Name */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(marker.status) }}
                      aria-label={getStatusLabel(marker.status)}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: TEXT_COLORS.primary }}
                    >
                      {marker.name}
                    </span>
                  </div>

                  {/* Right: Value + Unit */}
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: TEXT_COLORS.primary }}
                    >
                      {formatValue(marker.value)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: TEXT_COLORS.muted }}
                    >
                      {marker.unit}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer link */}
      {displayMarkers.length > 0 && (
        <div
          className="px-5 py-3"
          style={{ borderTop: `1px solid ${BORDERS.light}` }}
        >
          <Link
            href="/biomarkers"
            className="text-xs font-medium flex items-center gap-1 transition-colors hover:underline"
            style={{ color: TEXT_COLORS.muted }}
          >
            View all biomarkers
            <ChevronRightIcon />
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Format a numeric value for display
 */
function formatValue(value: number): string {
  // Round to 1 decimal if needed
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(1);
}

// Chevron icon
function ChevronRightIcon(): React.JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default TopMarkersCard;
