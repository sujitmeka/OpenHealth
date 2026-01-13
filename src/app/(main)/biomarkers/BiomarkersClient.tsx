'use client';

import { useState } from 'react';
import { BiomarkerSummaryClient } from '@/components/biomarkers/BiomarkerSummaryClient';
import { BiomarkerFilters, type StatusFilter, type CategoryFilter } from '@/components/biomarkers/BiomarkerFilters';
import { BiomarkerTable, type BiomarkerRow } from '@/components/biomarkers/BiomarkerTable';

export interface BiomarkerData {
  rows: BiomarkerRow[];
  counts: {
    total: number;
    optimal: number;
    normal: number;
    outOfRange: number;
  };
}

interface BiomarkersClientProps {
  data: BiomarkerData;
}

export function BiomarkersClient({ data }: BiomarkersClientProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const handleReset = (): void => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <>
      {/* Summary card */}
      <BiomarkerSummaryClient counts={data.counts} />

      {/* Filters */}
      <BiomarkerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onReset={handleReset}
      />

      {/* Table */}
      <BiomarkerTable
        biomarkers={data.rows}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
      />
    </>
  );
}
