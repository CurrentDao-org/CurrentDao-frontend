import React from 'react';
import { WalletProvider } from '../../hooks/useStellarWallet';
import { EventLogComponent } from './EventLogComponent';

/**
 * Example component showing how to integrate the Smart Contract Event Log
 * 
 * This example demonstrates:
 * 1. How to wrap the component with necessary providers
 * 2. How to configure the event log with different options
 * 3. How to handle wallet connection states
 */
export const EventLogExample: React.FC = () => {
  return (
    <WalletProvider network="testnet" autoConnect={false}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Smart Contract Event Log Example
            </h1>
            <p className="text-lg text-gray-600">
              This example demonstrates the Smart Contract Event Log component with all features enabled.
            </p>
          </div>

          {/* Basic Event Log */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Event Log
            </h2>
            <EventLogComponent
              className="shadow-lg"
              maxHeight="500px"
              showRealTime={true}
            />
          </div>

          {/* Event Log with Custom Filters */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Log with Pre-applied Filters
            </h2>
            <EventLogComponent
              className="shadow-lg"
              maxHeight="400px"
              showRealTime={false}
              initialFilter={{
                eventType: 'energy_trading',
                dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              }}
            />
          </div>

          {/* Compact Event Log */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Compact Event Log
            </h2>
            <EventLogComponent
              className="shadow-lg"
              maxHeight="300px"
              showRealTime={true}
            />
          </div>
        </div>
      </div>
    </WalletProvider>
  );
};

/**
 * Integration Guide:
 * 
 * 1. Import the component:
 *    import { EventLogComponent } from '@/components/events/EventLogComponent';
 * 
 * 2. Wrap your app with WalletProvider:
 *    <WalletProvider network="testnet" autoConnect={false}>
 *      <YourApp />
 *    </WalletProvider>
 * 
 * 3. Use the component:
 *    <EventLogComponent
 *      className="custom-class"
 *      maxHeight="600px"
 *      showRealTime={true}
 *      initialFilter={{
 *        eventType: 'energy_trading',
 *        dateFrom: new Date('2024-01-01')
 *      }}
 *    />
 * 
 * 4. Props:
 *    - className: Additional CSS classes
 *    - maxHeight: Maximum height of the event list (default: "600px")
 *    - showRealTime: Enable/disable real-time updates (default: true)
 *    - initialFilter: Initial filter configuration
 * 
 * 5. Features:
 *    - Real-time WebSocket updates
 *    - IndexedDB caching for performance
 *    - Advanced filtering (contract, event type, date range)
 *    - Search functionality
 *    - Export to JSON/CSV
 *    - Infinite scroll pagination
 *    - Block explorer links
 *    - Responsive design
 */
