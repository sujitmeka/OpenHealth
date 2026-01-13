import { HealthDataStore } from '@/lib/store/health-data';
import { generateGoals, type Goal } from '@/lib/analysis/goals';
import { GoalsClient } from './GoalsClient';

function getGoals(): Goal[] {
  const biomarkers = HealthDataStore.getBiomarkers();
  const phenoAge = HealthDataStore.getPhenoAge();
  const bodyComp = HealthDataStore.getBodyComp();

  return generateGoals(biomarkers, phenoAge, bodyComp);
}

export default function GoalsPage(): React.JSX.Element {
  const goals = getGoals();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
        <p className="text-slate-500 mt-1">Your personalized health improvement goals</p>
      </header>

      <GoalsClient goals={goals} />
    </div>
  );
}
