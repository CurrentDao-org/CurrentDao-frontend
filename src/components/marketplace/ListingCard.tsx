'use client';

import type { EnergyListing } from '@/types/marketplace';
import { Zap, MapPin, Package, Star, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ListingCardProps {
  listing: EnergyListing;
  onBidClick: (listing: EnergyListing) => void;
}

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

export function ListingCard({ listing, onBidClick }: ListingCardProps) {
  const lastBidTime = listing.currentBid ? timeAgo(listing.currentBid.timestamp) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{listing.providerName}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span>{listing.providerRating.toFixed(1)}</span>
          </div>
        </div>
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">{listing.renewableSource}</span>
      </div>

      <div className="my-4 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Zap className="w-4 h-4 text-gray-400" />
          <span>Price: <span className="font-semibold text-gray-900">${listing.pricePerKwh.toFixed(4)}/kWh</span></span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Package className="w-4 h-4 text-gray-400" />
          <span>Quantity: <span className="font-semibold text-gray-900">{listing.quantityKwh.toLocaleString()} kWh</span></span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{listing.location.city}, {listing.location.state}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Listed: {timeAgo(listing.createdAt)}</span>
        </div>
      </div>

      {listing.currentBid && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 text-emerald-800 rounded-lg px-3 py-2 text-xs mb-4">
          <div className="flex justify-between items-center">
            <span>Current Bid: <span className="font-bold">${listing.currentBid.amount.toFixed(4)}</span></span>
            <span className="text-emerald-600">{lastBidTime}</span>
          </div>
        </motion.div>
      )}

      <div className="mt-auto">
        <button onClick={() => onBidClick(listing)} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <ArrowUpRight className="w-4 h-4" />
          Place Bid
        </button>
      </div>
    </div>
  );
}