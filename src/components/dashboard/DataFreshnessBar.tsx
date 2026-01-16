'use client';

import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
import { TEXT_COLORS, BORDERS, STATUS_COLORS } from '@/lib/design/tokens';
import type { DataSourceTimestamps } from '@/lib/store/health-data';

interface DataFreshnessBarProps {
  timestamps: DataSourceTimestamps;
}

interface DataSourceInfo {
  label: string;
  timestamp: string | null;
  icon: React.JSX.Element;
}

/**
 * Get freshness status based on days since last update
 */
function getFreshnessStatus(
  timestamp: string | null
): 'fresh' | 'stale' | 'very_stale' | 'none' {
  if (!timestamp) return 'none';

  const daysAgo = differenceInDays(new Date(), parseISO(timestamp));

  if (daysAgo <= 7) return 'fresh';
  if (daysAgo <= 30) return 'stale';
  return 'very_stale';
}

/**
 * Get text color for freshness status
 */
function getFreshnessColor(status: 'fresh' | 'stale' | 'very_stale' | 'none'): string {
  switch (status) {
    case 'fresh':
      return TEXT_COLORS.secondary;
    case 'stale':
      return STATUS_COLORS.normal.text;
    case 'very_stale':
      return STATUS_COLORS.outOfRange.text;
    case 'none':
      return TEXT_COLORS.muted;
  }
}

/**
 * Format relative time from timestamp
 */
function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'No data';

  try {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/**
 * DataFreshnessBar - Shows data source freshness
 *
 * Displays last updated time for each data source with color coding:
 * - Fresh (<7 days): normal text
 * - Stale (>30 days): yellow warning
 * - Very stale (>90 days): red with "Retest recommended"
 */
export function DataFreshnessBar({
  timestamps,
}: DataFreshnessBarProps): React.JSX.Element {
  const sources: DataSourceInfo[] = [
    {
      label: 'Blood work',
      timestamp: timestamps.bloodwork,
      icon: <BloodIcon />,
    },
    {
      label: 'Activity',
      timestamp: timestamps.activity,
      icon: <ActivityIcon />,
    },
    {
      label: 'DEXA',
      timestamp: timestamps.dexa,
      icon: <DexaIcon />,
    },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-xs"
      style={{
        borderBottom: `1px solid ${BORDERS.light}`,
      }}
    >
      {sources.map((source, index) => {
        const status = getFreshnessStatus(source.timestamp);
        const color = getFreshnessColor(status);
        const relativeTime = formatRelativeTime(source.timestamp);

        return (
          <div key={source.label} className="flex items-center gap-1.5">
            {index > 0 && (
              <span
                className="hidden sm:inline mr-4"
                style={{ color: BORDERS.medium }}
              >
                |
              </span>
            )}
            <span style={{ color: TEXT_COLORS.muted }}>{source.icon}</span>
            <span style={{ color: TEXT_COLORS.muted }}>{source.label}:</span>
            <span style={{ color }} className="font-medium">
              {relativeTime}
            </span>
            {status === 'very_stale' && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  backgroundColor: STATUS_COLORS.outOfRange.light,
                  color: STATUS_COLORS.outOfRange.text,
                }}
              >
                Retest
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Icons
function BloodIcon(): React.JSX.Element {
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
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function ActivityIcon(): React.JSX.Element {
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function DexaIcon(): React.JSX.Element {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export default DataFreshnessBar;
