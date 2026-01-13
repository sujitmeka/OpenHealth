'use client';

import { BORDERS, RADIUS, TEXT_COLORS, BACKGROUNDS } from '@/lib/design/tokens';

export type StatusFilter = 'all' | 'optimal' | 'normal' | 'outOfRange';
export type CategoryFilter = 'all' | 'phenoage' | 'lipids' | 'metabolic' | 'thyroid' | 'other';

interface BiomarkerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onReset: () => void;
}

const inputStyles = {
  padding: '10px 14px',
  borderRadius: RADIUS.md,
  border: `1px solid ${BORDERS.light}`,
  fontSize: '14px',
  color: TEXT_COLORS.primary,
  backgroundColor: BACKGROUNDS.card,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const selectStyles = {
  ...inputStyles,
  cursor: 'pointer',
  minWidth: '140px',
};

export function BiomarkerFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  onReset,
}: BiomarkerFiltersProps): React.JSX.Element {
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <input
          type="text"
          placeholder="Search biomarkers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          style={inputStyles}
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        className="focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        style={selectStyles}
      >
        <option value="all">All Ranges</option>
        <option value="optimal">Optimal</option>
        <option value="normal">Normal</option>
        <option value="outOfRange">Out of Range</option>
      </select>

      {/* Category filter */}
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
        className="focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        style={selectStyles}
      >
        <option value="all">All Categories</option>
        <option value="phenoage">PhenoAge</option>
        <option value="lipids">Lipids</option>
        <option value="metabolic">Metabolic</option>
        <option value="thyroid">Thyroid</option>
        <option value="other">Other</option>
      </select>

      {/* Reset button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// Category mappings for filtering
export const BIOMARKER_CATEGORIES: Record<string, CategoryFilter> = {
  // PhenoAge biomarkers
  albumin: 'phenoage',
  creatinine: 'phenoage',
  glucose: 'phenoage',
  crp: 'phenoage',
  lymphocytePercent: 'phenoage',
  mcv: 'phenoage',
  rdw: 'phenoage',
  alkalinePhosphatase: 'phenoage',
  wbc: 'phenoage',

  // Lipids
  ldl: 'lipids',
  hdl: 'lipids',
  triglycerides: 'lipids',
  totalCholesterol: 'lipids',

  // Metabolic
  vitaminD: 'metabolic',
  hba1c: 'metabolic',
  fastingInsulin: 'metabolic',
  homocysteine: 'metabolic',
  ferritin: 'metabolic',

  // Thyroid
  tsh: 'thyroid',
  freeT4: 'thyroid',
  freeT3: 'thyroid',

  // Other (body comp)
  bodyFatPercent: 'other',
  visceralFat: 'other',
  boneDensityTScore: 'other',
};
