'use client';

import type { EnergyListing } from '@/types/marketplace';
import { ListingCard } from './ListingCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { motion, AnimatePresence } from 'framer-motion';

interface ListingGridProps {
  listings: EnergyListing[];
  onBidClick: (listing: EnergyListing) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
}

export function ListingGrid({ listings, onBidClick, onLoadMore, hasNextPage, isLoading }: ListingGridProps) {
  const { lastElementRef } = useInfiniteScroll({
    loading: isLoading,
    hasNextPage,
    onLoadMore,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              ref={index === listings.length - 1 ? lastElementRef : null}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: (index % 20) * 0.05 }}
            >
              <ListingCard listing={listing} onBidClick={onBidClick} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {isLoading && <div className="text-center py-4">Loading more...</div>}
      {!hasNextPage && listings.length > 0 && <div className="text-center py-4 text-gray-500">You've reached the end.</div>}
      {!isLoading && listings.length === 0 && <div className="text-center py-10 text-gray-500">No listings found. Try adjusting your filters.</div>}
    </div>
  );
}