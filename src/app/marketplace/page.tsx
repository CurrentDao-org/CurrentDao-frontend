'use client';

import { FilterPanel } from '@/components/marketplace/FilterPanel';
import { ListingGrid } from '@/components/marketplace/ListingGrid';
import { QuickBidModal } from '@/components/marketplace/QuickBidModal';
import { SortOptions } from '@/components/marketplace/SortOptions';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Globe } from 'lucide-react';

export default function MarketplacePage() {
  const {
    listings,
    isLoading,
    loadMore,
    hasNextPage,
    filters,
    setFilters,
    sort,
    setSort,
    openBidModal,
    closeBidModal,
    confirmBid,
    activeBidListing,
    isBidModalOpen,
    savedSearches,
    saveSearch,
    loadSearch,
    deleteSearch,
    allRenewableSources,
  } = useMarketplace();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Energy Marketplace</h1>
            <p className="text-gray-600">Browse and bid on energy listings from providers worldwide.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            allRenewableSources={allRenewableSources}
            savedSearches={savedSearches}
            onSaveSearch={saveSearch}
            onLoadSearch={loadSearch}
            onDeleteSearch={deleteSearch}
          />

          <div className="lg:col-span-3 space-y-6">
            <SortOptions currentSort={sort} onSortChange={setSort} />
            <ListingGrid listings={listings} onBidClick={openBidModal} onLoadMore={loadMore} hasNextPage={hasNextPage} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <QuickBidModal listing={activeBidListing} isOpen={isBidModalOpen} onClose={closeBidModal} onConfirmBid={confirmBid} />
    </div>
  );
}