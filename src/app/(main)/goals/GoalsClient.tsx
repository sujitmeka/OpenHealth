'use client';

import { GoalCard } from '@/components/goals/GoalCard';
import { CARD_CLASSES, STATUS_COLORS } from '@/lib/design/tokens';
import type { Goal } from '@/lib/analysis/goals';

interface GoalsClientProps {
  goals: Goal[];
}

export function GoalsClient({ goals }: GoalsClientProps): React.JSX.Element {
  if (goals.length === 0) {
    return (
      <div className={`${CARD_CLASSES.base} ${CARD_CLASSES.padding} text-center py-12`}>
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: STATUS_COLORS.optimal.light }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: STATUS_COLORS.optimal.base }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No goals - your health looks great!
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          All your biomarkers are in optimal or normal ranges. Keep up the good work and continue your healthy habits.
        </p>
      </div>
    );
  }

  // Group by priority
  const highPriority = goals.filter((g) => g.priority === 'high');
  const mediumPriority = goals.filter((g) => g.priority === 'medium');
  const lowPriority = goals.filter((g) => g.priority === 'low');

  return (
    <div className="space-y-8">
      {highPriority.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            High Priority
          </h2>
          <div className="space-y-4">
            {highPriority.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {mediumPriority.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medium Priority
          </h2>
          <div className="space-y-4">
            {mediumPriority.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {lowPriority.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Optimization Opportunities
          </h2>
          <div className="space-y-4">
            {lowPriority.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
