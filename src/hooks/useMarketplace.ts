'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EnergyListing, MarketplaceFilters, SortOption, RenewableSource } from '@/types/marketplace';
import { produce } from 'immer';

// --- MOCK DATA ---
const RENEWABLE_SOURCES: RenewableSource[] = ['solar', 'wind', 'hydro', 'geothermal', 'biomass'];
const CITIES = [
  { city: 'Austin', state: 'TX', country: 'USA' },
  { city: 'San Francisco', state: 'CA', country: 'USA' },
  { city: 'Berlin', state: 'Berlin', country: 'Germany' },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan' },
  { city: 'Sydney', state: 'NSW', country: 'Australia' },
];

const generateMockListings = (count: number): EnergyListing[] => {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    return {
      id: `listing-${Date.now()}-${i}`,
      providerName: `EnergyCorp ${i + 1}`,
      providerLogoUrl: `/images/logos/provider-${(i % 5) + 1}.svg`,
      providerRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      quantityKwh: Math.floor(1000 + Math.random() * 99000),
      pricePerKwh: parseFloat((0.05 + Math.random() * 0.15).toFixed(4)),
      location: CITIES[i % CITIES.length],
      renewableSource: RENEWABLE_SOURCES[i % RENEWABLE_SOURCES.length],
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const ALL_LISTINGS = generateMockListings(1200);
const PAGE_SIZE = 20;

// --- HOOK ---

export function useMarketplace() {
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [filters, setFilters] = useState<MarketplaceFilters>({
    priceRange: [0.05, 0.20],
    quantityRange: [1000, 100000],
    location: '',
    renewableSources: [],
  });

  const [sort, setSort] = useState<SortOption>({ key: 'time', direction: 'desc' });

  const [activeBidListing, setActiveBidListing] = useState<EnergyListing | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const filteredAndSortedListings = useMemo(() => {
    let result = ALL_LISTINGS.filter(listing => {
      const [minPrice, maxPrice] = filters.priceRange;
      const [minQty, maxQty] = filters.quantityRange;

      const inPrice = listing.pricePerKwh >= minPrice && listing.pricePerKwh <= maxPrice;
      const inQty = listing.quantityKwh >= minQty && listing.quantityKwh <= maxQty;
      const inLocation = filters.location
        ? `${listing.location.city}, ${listing.location.state}`.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      const inRenewable = filters.renewableSources.length > 0
        ? filters.renewableSources.includes(listing.renewableSource)
        : true;

      return inPrice && inQty && inLocation && inRenewable;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.key) {
        case 'price':
          comparison = a.pricePerKwh - b.pricePerKwh;
          break;
        case 'rating':
          comparison = b.providerRating - a.providerRating; // Always high to low for rating
          break;
        case 'time':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filters, sort]);

  const loadListings = useCallback((currentPage: number) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const newPageListings = filteredAndSortedListings.slice(start, end);

      setListings(prev => currentPage === 1 ? newPageListings : [...prev, ...newPageListings]);
      setHasNextPage(end < filteredAndSortedListings.length);
      setIsLoading(false);
    }, 500);
  }, [filteredAndSortedListings]);

  // Initial load and re-load on filter/sort change
  useEffect(() => {
    setPage(1);
    loadListings(1);
  }, [loadListings]);

  const loadMore = () => {
    if (!isLoading && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadListings(nextPage);
    }
  };

  // --- Real-time simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a new bid
      if (listings.length > 0) {
        const listingIndexToUpdate = Math.floor(Math.random() * listings.length);
        setListings(
          produce(draft => {
            const listing = draft[listingIndexToUpdate];
            if (listing) {
              const currentBid = listing.currentBid?.amount ?? listing.pricePerKwh;
              listing.currentBid = {
                amount: parseFloat((currentBid * 1.01).toFixed(4)),
                bidder: 'User_XYZ',
                timestamp: new Date().toISOString(),
              };
            }
          })
        );
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [listings]);

  // --- Bid Modal ---
  const openBidModal = (listing: EnergyListing) => {
    setActiveBidListing(listing);
    setIsBidModalOpen(true);
  };

  const closeBidModal = () => {
    setIsBidModalOpen(false);
    setActiveBidListing(null);
  };

  const confirmBid = (listingId: string, bidAmount: number) => {
    console.log(`Bid confirmed for ${listingId} at $${bidAmount}/kWh`);
    // Simulate bid submission
    return new Promise<boolean>(resolve => {
      setTimeout(() => {
        setListings(
          produce(draft => {
            const listing = draft.find(l => l.id === listingId);
            if (listing) {
              listing.currentBid = {
                amount: bidAmount,
                bidder: 'You',
                timestamp: new Date().toISOString(),
              };
            }
          })
        );
        resolve(true);
      }, 1000);
    });
  };

  // --- Saved Searches (using localStorage) ---
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('marketplace_saved_searches');
    if (stored) {
      setSavedSearches(JSON.parse(stored));
    }
  }, []);

  const saveSearch = (name: string) => {
    const newSearch = { id: Date.now().toString(), name, filters, sort };
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('marketplace_saved_searches', JSON.stringify(updatedSearches));
  };

  const loadSearch = (searchId: string) => {
    const searchToLoad = savedSearches.find(s => s.id === searchId);
    if (searchToLoad) {
      setFilters(searchToLoad.filters);
      setSort(searchToLoad.sort);
    }
  };

  const deleteSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem('marketplace_saved_searches', JSON.stringify(updatedSearches));
  };

  return {
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
    allRenewableSources: RENEWABLE_SOURCES,
  };
}