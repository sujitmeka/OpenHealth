'use client';

import { CARD_CLASSES, STATUS_COLORS } from '@/lib/design/tokens';
import type { HealthScoreResult } from '@/lib/calculations/health-score';

interface HealthScoreCardProps {
  result: HealthScoreResult;
}

function getScoreColor(status: HealthScoreResult['status']): string {
  switch (status) {
    case 'optimal':
      return STATUS_COLORS.optimal.base;
    case 'good':
      return '#22c55e'; // green-500
    case 'fair':
      return STATUS_COLORS.normal.base;
    case 'needs_work':
      return STATUS_COLORS.outOfRange.base;
  }
}

export function HealthScoreCard({ result }: HealthScoreCardProps): React.JSX.Element {
  const color = getScoreColor(result.status);
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (result.score / 100) * circumference;

  return (
    <div className={`${CARD_CLASSES.base} ${CARD_CLASSES.padding}`}>
      <h3 className="text-sm font-medium text-slate-500 mb-4">Health Score</h3>

      <div className="flex items-center justify-center">
        <div className="relative">
          <svg height={radius * 2} width={radius * 2} className="-rotate-90">
            {/* Background circle */}
            <circle
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress circle */}
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color }}>
              {result.score}
            </span>
            <span className="text-sm text-slate-500">points</span>
          </div>
        </div>
      </div>

      {/* Status label */}
      <div className="text-center mt-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: color + '20',
            color: color,
          }}
        >
          {result.label}
        </span>
      </div>

      {/* Breakdown */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Biomarkers ({Math.round(result.breakdown.biomarkerWeight * 100)}%)</span>
          <span className="font-medium">{result.breakdown.biomarkerScore}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Biological Age ({Math.round(result.breakdown.ageWeight * 100)}%)</span>
          <span className="font-medium">{result.breakdown.ageScore}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Activity ({Math.round(result.breakdown.activityWeight * 100)}%)</span>
          <span className="font-medium">{result.breakdown.activityScore}</span>
        </div>
      </div>
    </div>
  );
}
