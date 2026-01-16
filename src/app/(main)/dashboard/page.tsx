import Link from 'next/link';
import { HealthDataStore } from '@/lib/store/health-data';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { generateGoals } from '@/lib/analysis/goals';
import { generateContextualPills } from '@/lib/ai-chat/generateContextualPills';
import { selectTopMarkers } from '@/lib/biomarkers/selectTopMarkers';
import { calculateWeeklySummary } from '@/lib/lifestyle/calculateWeeklySummary';
import { HeroMetrics } from '@/components/dashboard/HeroMetrics';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { GoalsSection } from '@/components/dashboard/GoalsSection';
import { DigitalTwin } from '@/components/digital-twin/DigitalTwin';
import { SyncButton } from '@/components/SyncButton';
import { DataFreshnessBar } from '@/components/dashboard/DataFreshnessBar';
import { TopMarkersCard } from '@/components/dashboard/TopMarkersCard';
import { WeeklyLifestyleCard } from '@/components/dashboard/WeeklyLifestyleCard';
import { ChatProvider } from '@/lib/ai-chat/ChatContext';
import { AIChatWidget } from '@/components/ai-chat/AIChatWidget';
import { type StatusType, SPACING } from '@/lib/design/tokens';

function getActivityStatus(value: number, type: 'hrv' | 'rhr' | 'sleep' | 'bodyFat'): StatusType {
  switch (type) {
    case 'hrv':
      return value >= 50 ? 'optimal' : value >= 30 ? 'normal' : 'outOfRange';
    case 'rhr':
      return value < 60 ? 'optimal' : value < 80 ? 'normal' : 'outOfRange';
    case 'sleep':
      return value >= 7 && value <= 9 ? 'optimal' : value >= 6 ? 'normal' : 'outOfRange';
    case 'bodyFat':
      return value < 18 ? 'optimal' : value < 25 ? 'normal' : 'outOfRange';
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
  const timestamps = await HealthDataStore.getTimestamps();

  // Calculate health score
  const healthScore = calculateHealthScore(biomarkers, phenoAge, activity);

  // Generate goals
  const goals = generateGoals(biomarkers, phenoAge, bodyComp);

  // Generate contextual pills for AI chat
  const contextualPills = generateContextualPills(biomarkers);

  // Select top 5 markers to watch
  const topMarkers = selectTopMarkers(biomarkers);

  // Calculate weekly lifestyle summary
  const weeklySummary = calculateWeeklySummary(activity);

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

  // Build stats array
  const stats = [
    {
      label: 'HRV',
      value: activityAvg ? activityAvg.hrv.toFixed(0) : '--',
      unit: 'ms',
      status: activityAvg ? getActivityStatus(activityAvg.hrv, 'hrv') : ('normal' as StatusType),
    },
    {
      label: 'Resting HR',
      value: activityAvg ? activityAvg.rhr.toFixed(0) : '--',
      unit: 'bpm',
      status: activityAvg ? getActivityStatus(activityAvg.rhr, 'rhr') : ('normal' as StatusType),
    },
    {
      label: 'Sleep',
      value: activityAvg ? activityAvg.sleep.toFixed(1) : '--',
      unit: 'hrs',
      status: activityAvg ? getActivityStatus(activityAvg.sleep, 'sleep') : ('normal' as StatusType),
    },
    {
      label: 'Body Fat',
      value: bodyFat ? bodyFat.toFixed(1) : '--',
      unit: '%',
      status: bodyFat ? getActivityStatus(bodyFat, 'bodyFat') : ('normal' as StatusType),
    },
  ];

  return (
    <ChatProvider>
      <div className="max-w-6xl mx-auto px-6 py-8" style={{ gap: SPACING.lg }}>
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Your health at a glance</p>
          </div>
          <SyncButton />
        </header>

        {/* AI Chat Bar */}
        <div className="mb-4">
          <AIChatWidget contextualPills={contextualPills} />
        </div>

        {/* Data Freshness Bar */}
        <div className="mb-6 -mx-6 px-6">
          <DataFreshnessBar timestamps={timestamps} />
        </div>

        {/* Hero Metrics - Health Score + Bio Age */}
        <div className="mb-8">
          <HeroMetrics
            healthScore={healthScore}
            chronologicalAge={chronoAge}
            phenoAge={phenoAge}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Digital Twin - Takes 4 columns */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Digital Twin
            </h3>
            <DigitalTwin
              className="w-full min-h-[300px] aspect-square"
              healthData={{ biomarkers, bodyComp, activity }}
            />
          </div>

          {/* Middle Column: Stats Grid - Takes 5 columns */}
          <div className="lg:col-span-5">
            <StatsGrid
              stats={stats}
              biomarkerCounts={{
                optimal: healthScore.breakdown.optimalCount,
                normal: healthScore.breakdown.normalCount,
                outOfRange: healthScore.breakdown.outOfRangeCount,
              }}
            />
          </div>

          {/* Right Column: Top Markers + Weekly Lifestyle - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            <TopMarkersCard markers={topMarkers} />
            <WeeklyLifestyleCard summary={weeklySummary} />
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <GoalsSection goals={goals} />
        </div>

        {/* Footer links */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/biomarkers"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Biomarkers
            </Link>
            <Link
              href="/body-comp"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Body Composition
            </Link>
            <Link
              href="/lifestyle"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Lifestyle
            </Link>
            <Link
              href="/data-sources"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Data Sources
            </Link>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
