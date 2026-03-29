'use client';

import GeolocationTrading from '@/components/location/GeolocationTrading';
import { Navbar } from '@/components/Navbar';

export default function LocationTradingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <GeolocationTrading />
      </div>
    </main>
  );
}
