import Link from 'next/link';
import { HealthDataStore } from '@/lib/store/health-data';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { generateGoals } from '@/lib/analysis/goals';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { BiologicalAgeCard } from '@/components/dashboard/BiologicalAgeCard';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { GoalCard } from '@/components/goals/GoalCard';
import { DigitalTwin } from '@/components/digital-twin/DigitalTwin';
import { SyncButton } from '@/components/SyncButton';
import { CARD_CLASSES, type StatusType } from '@/lib/design/tokens';

function getActivityStatus(value: number, type: 'hrv' | 'rhr' | 'sleep'): StatusType {
  switch (type) {
    case 'hrv':
      return value >= 50 ? 'optimal' : value >= 30 ? 'normal' : 'outOfRange';
    case 'rhr':
      return value < 60 ? 'optimal' : value < 80 ? 'normal' : 'outOfRange';
    case 'sleep':
      return value >= 7 && value <= 9 ? 'optimal' : value >= 6 ? 'normal' : 'outOfRange';
    default:
      return 'normal';
  }
}

export default async function DashboardPage(): Promise<React.JSX.Element> {
  // Load health data on server side
  const biomarkers = await HealthDataStore.getBiomarkers();
  const bodyComp = await HealthDataStore.getBodyComp();
  const activity = await HealthDataStore.getActivity();
  const phenoAge = await HealthDataStore.getPhenoAge();
  const chronoAge = await HealthDataStore.getChronologicalAge();

  // Calculate health score
  const healthScore = calculateHealthScore(biomarkers, phenoAge, activity);

  // Generate goals
  const goals = generateGoals(biomarkers, phenoAge, bodyComp);
  const topGoals = goals.slice(0, 3);

  // Calculate activity averages
  const activityAvg =
    activity.length > 0
      ? {
          hrv: activity.reduce((sum, d) => sum + d.hrv, 0) / activity.length,
          rhr: activity.reduce((sum, d) => sum + d.rhr, 0) / activity.length,
          sleep: activity.reduce((sum, d) => sum + d.sleepHours, 0) / activity.length,
        }
      : null;

  // Body fat from body comp
  const bodyFat = bodyComp.bodyFatPercent;
  const bodyFatStatus: StatusType = bodyFat
    ? bodyFat < 18 ? 'optimal' : bodyFat < 25 ? 'normal' : 'outOfRange'
    : 'normal';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your health at a glance</p>
        </div>
        <SyncButton />
      </header>

      {/* Top Row: Health Score + Biological Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthScoreCard result={healthScore} />
        <BiologicalAgeCard
          chronologicalAge={chronoAge}
          phenoAge={phenoAge}
        />
      </div>

      {/* Second Row: Digital Twin + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Digital Twin */}
        <div className={`${CARD_CLASSES.base} ${CARD_CLASSES.padding}`}>
          <h3 className="text-sm font-medium text-slate-500 mb-4">Digital Twin</h3>
          <DigitalTwin
            className="w-full min-h-[350px] aspect-square"
            healthData={{ biomarkers, bodyComp, activity }}
          />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-500">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {activityAvg ? (
              <>
                <QuickStatCard
                  label="HRV"
                  value={activityAvg.hrv.toFixed(0)}
                  unit="ms"
                  status={getActivityStatus(activityAvg.hrv, 'hrv')}
                />
                <QuickStatCard
                  label="Resting HR"
                  value={activityAvg.rhr.toFixed(0)}
                  unit="bpm"
                  status={getActivityStatus(activityAvg.rhr, 'rhr')}
                />
                <QuickStatCard
                  label="Sleep"
                  value={activityAvg.sleep.toFixed(1)}
                  unit="hrs"
                  status={getActivityStatus(activityAvg.sleep, 'sleep')}
                />
              </>
            ) : (
              <>
                <QuickStatCard label="HRV" value="--" unit="ms" />
                <QuickStatCard label="Resting HR" value="--" unit="bpm" />
                <QuickStatCard label="Sleep" value="--" unit="hrs" />
              </>
            )}
            <QuickStatCard
              label="Body Fat"
              value={bodyFat ? bodyFat.toFixed(1) : '--'}
              unit="%"
              status={bodyFatStatus}
            />
          </div>

          {/* Biomarker summary */}
          <div className={`${CARD_CLASSES.base} p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Biomarkers</span>
              <Link
                href="/biomarkers"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold text-emerald-600">
                  {healthScore.breakdown.optimalCount}
                </div>
                <div className="text-xs text-slate-500">Optimal</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-amber-500">
                  {healthScore.breakdown.normalCount}
                </div>
                <div className="text-xs text-slate-500">Normal</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-pink-500">
                  {healthScore.breakdown.outOfRangeCount}
                </div>
                <div className="text-xs text-slate-500">Out of Range</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Top Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Top Goals</h3>
          {goals.length > 0 && (
            <Link
              href="/goals"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all {goals.length} goals →
            </Link>
          )}
        </div>

        {topGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} compact />
            ))}
          </div>
        ) : (
          <div className={`${CARD_CLASSES.base} ${CARD_CLASSES.padding} text-center py-8`}>
            <div className="text-emerald-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">All biomarkers are in optimal ranges!</p>
            <p className="text-sm text-slate-500 mt-1">Keep up the great work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
