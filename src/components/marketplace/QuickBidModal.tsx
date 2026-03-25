'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import type { EnergyListing } from '@/types/marketplace';

interface QuickBidModalProps {
  listing: EnergyListing | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBid: (listingId: string, bidAmount: number) => Promise<boolean>;
}

export function QuickBidModal({ listing, isOpen, onClose, onConfirmBid }: QuickBidModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const minBid = listing?.currentBid?.amount ?? listing?.pricePerKwh ?? 0;

  useEffect(() => {
    if (listing) {
      setBidAmount(minBid.toFixed(4));
    }
  }, [listing, minBid]);

  const handleConfirm = async () => {
    setError('');
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= minBid) {
      setError(`Your bid must be higher than the current price of $${minBid.toFixed(4)}.`);
      return;
    }

    if (!listing) return;

    setIsProcessing(true);
    const success = await onConfirmBid(listing.id, amount);
    setIsProcessing(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to place bid. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && listing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">Place Bid on {listing.providerName}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Current price: ${minBid.toFixed(4)}/kWh</p>

              <div className="mt-6">
                <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">Your Bid ($/kWh)</label>
                <input
                  id="bidAmount"
                  type="number"
                  step="0.0001"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </div>

              <button onClick={handleConfirm} disabled={isProcessing} className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isProcessing ? 'Processing...' : <><Zap className="w-4 h-4" />Confirm Bid</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}