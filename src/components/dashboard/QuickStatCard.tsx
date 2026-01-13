'use client';

import { CARD_CLASSES, STATUS_COLORS, type StatusType } from '@/lib/design/tokens';

interface QuickStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: StatusType;
  trend?: 'up' | 'down' | 'stable';
}

export function QuickStatCard({
  label,
  value,
  unit,
  status = 'optimal',
  trend,
}: QuickStatCardProps): React.JSX.Element {
  const statusColor = STATUS_COLORS[status].base;

  return (
    <div className={`${CARD_CLASSES.base} p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <div className="flex items-center gap-1.5">
          {/* Status dot */}
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          {/* Trend arrow */}
          {trend && (
            <TrendArrow trend={trend} status={status} />
          )}
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

function TrendArrow({
  trend,
  status,
}: {
  trend: 'up' | 'down' | 'stable';
  status: StatusType;
}): React.JSX.Element {
  const color = STATUS_COLORS[status].base;

  if (trend === 'stable') {
    return (
      <svg
        className="w-3.5 h-3.5"
        style={{ color }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg
      className="w-3.5 h-3.5"
      style={{ color }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={trend === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  );
}
