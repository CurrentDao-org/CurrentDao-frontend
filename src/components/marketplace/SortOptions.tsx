'use client';

import type { SortOption, SortKey } from '@/types/marketplace';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface SortOptionsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_CONFIG: { label: string; key: SortKey }[] = [
  { label: 'Newest', key: 'time' },
  { label: 'Price', key: 'price' },
  { label: 'Rating', key: 'rating' },
];

export function SortOptions({ currentSort, onSortChange }: SortOptionsProps) {
  const handleSort = (key: SortKey) => {
    if (currentSort.key === key) {
      // Toggle direction, but rating is always desc
      if (key !== 'rating') {
        onSortChange({ key, direction: currentSort.direction === 'asc' ? 'desc' : 'asc' });
      }
    } else {
      // Default directions for new sort keys
      const direction = key === 'price' ? 'asc' : 'desc';
      onSortChange({ key, direction });
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
      <span className="text-sm font-medium text-gray-600 px-2">Sort by:</span>
      {SORT_CONFIG.map(({ label, key }) => {
        const isActive = currentSort.key === key;
        return (
          <button key={key} onClick={() => handleSort(key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            {label}
            {isActive && (currentSort.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
          </button>
        );
      })}
    </div>
  );
}