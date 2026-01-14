import { HealthDataStore } from '@/lib/store/health-data';
import { getBiomarkerStatus, BIOMARKER_REFERENCES } from '@/lib/types/health';
import { BiomarkersClient, type BiomarkerData } from './BiomarkersClient';
import { BIOMARKER_CATEGORIES, type CategoryFilter } from '@/components/biomarkers/BiomarkerFilters';
import type { StatusType } from '@/lib/design/tokens';
import type { BiomarkerStatus } from '@/lib/types/health';

function mapStatusToType(status: BiomarkerStatus): StatusType {
  if (status === 'optimal') return 'optimal';
  if (status === 'out_of_range') return 'outOfRange';
  return 'normal';
}

async function getBiomarkerData(): Promise<BiomarkerData> {
  const biomarkers = await HealthDataStore.getBiomarkers();
  const rows = [];

  let total = 0;
  let optimal = 0;
  let normal = 0;
  let outOfRange = 0;

  for (const [key, value] of Object.entries(biomarkers)) {
    if (key === 'patientAge' || value === undefined) continue;

    const ref = BIOMARKER_REFERENCES[key];
    if (!ref) continue;

    const status = getBiomarkerStatus(key, value);
    const statusType = mapStatusToType(status);

    total++;
    if (statusType === 'optimal') optimal++;
    else if (statusType === 'normal') normal++;
    else outOfRange++;

    rows.push({
      key,
      name: ref.displayName,
      value,
      unit: ref.unit,
      status,
      statusType,
      category: (BIOMARKER_CATEGORIES[key] || 'other') as CategoryFilter,
      history: [value],
      optimalRange: ref.optimal,
    });
  }

  return {
    rows,
    counts: { total, optimal, normal, outOfRange },
  };
}

export default async function BiomarkersPage(): Promise<React.JSX.Element> {
  const data = await getBiomarkerData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Biomarkers</h1>
        <p className="text-slate-500 mt-1">Track and analyze your health metrics</p>
      </header>

      <BiomarkersClient data={data} />
    </div>
  );
}
