import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Clock,
  Hash,
  Users,
  Activity,
  Wifi,
  WifiOff,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import { DecodedEvent, EventFilter } from '../../services/eventDecoder';
import { createEventDecoder } from '../../services/eventDecoder';
import { eventCache } from '../../services/eventCache';
import { webSocketService, useWebSocketService } from '../../services/websocketService';
import { useStellarWallet } from '../../hooks/useStellarWallet';

// Simple filter icon component
const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// Simple building icon component
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// Simple file spreadsheet icon component
const FileSpreadsheetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 4h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2h-5.586a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 4H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface EventLogProps {
  className?: string;
  maxHeight?: string;
  showRealTime?: boolean;
  initialFilter?: EventFilter;
}

export const EventLog: React.FC<EventLogProps> = ({
  className = '',
  maxHeight = '600px',
  showRealTime = true,
  initialFilter = {}
}) => {
  const { state: walletState } = useStellarWallet();
  const wsService = useWebSocketService();
  
  // State
  const [events, setEvents] = useState<DecodedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<DecodedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(showRealTime);
  const [wsConnected, setWsConnected] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<EventFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<string | null>(null);

  // Initialize event decoder
  const eventDecoder = createEventDecoder(walletState.network || 'testnet');

  // Load initial events
  const loadEvents = useCallback(async (reset = false) => {
    if (!walletState.wallet?.publicKey) return;

    try {
      if (reset) {
        setLoading(true);
        setEvents([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      // Try to get from cache first
      const cachedEvents = await eventCache.getEvents(filters, reset ? 50 : events.length + 50);
      
      if (cachedEvents.length > 0 && reset) {
        setEvents(cachedEvents);
        setFilteredEvents(applyFilters(cachedEvents, filters, searchQuery));
      } else {
        // Fetch from blockchain
        const response = await eventDecoder.getAccountEvents(
          walletState.wallet.publicKey,
          filters,
          50,
          reset ? undefined : events[events.length - 1]?.id
        );

        const newEvents = reset ? response.events : [...events, ...response.events];
        setEvents(newEvents);
        setFilteredEvents(applyFilters(newEvents, filters, searchQuery));
        setHasMore(response.hasMore);

        // Cache the events
        await eventCache.storeEvents(response.events);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [walletState.wallet?.publicKey, filters, events.length, searchQuery]);

  // Apply filters and search
  const applyFilters = useCallback((events: DecodedEvent[], filters: EventFilter, search: string) => {
    let filtered = events;

    // Apply filter criteria
    if (filters.contractAddress) {
      filtered = filtered.filter(event => event.contractAddress === filters.contractAddress);
    }

    if (filters.eventType) {
      filtered = filtered.filter(event => event.type === filters.eventType);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(event => new Date(event.timestamp) >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event => new Date(event.timestamp) <= filters.dateTo!);
    }

    if (filters.sourceAccount) {
      filtered = filtered.filter(event => event.sourceAccount === filters.sourceAccount);
    }

    // Apply search query
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.contractAddress.toLowerCase().includes(query) ||
        event.transactionHash.toLowerCase().includes(query) ||
        Object.values(event.parameters).some(param => 
          String(param).toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, []);

  // Setup WebSocket subscription
  const setupWebSocketSubscription = useCallback(() => {
    if (!realTimeEnabled || !walletState.wallet?.publicKey) return;

    const subscriptionId = wsService.subscribeToAccount(
      walletState.wallet.publicKey,
      (newEvent) => {
        setEvents(prev => [newEvent, ...prev]);
        setFilteredEvents(prev => applyFilters([newEvent, ...prev], filters, searchQuery));
        toast.success('New event received');
      },
      {
        eventType: filters.eventType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      },
      (error) => {
        console.error('WebSocket error:', error);
        toast.error('Real-time updates error');
      }
    );

    subscriptionRef.current = subscriptionId;
  }, [realTimeEnabled, walletState.wallet?.publicKey, filters, searchQuery, wsService, applyFilters]);

  // Initialize and setup
  useEffect(() => {
    if (walletState.wallet?.publicKey) {
      loadEvents(true);
    }

    return () => {
      if (subscriptionRef.current) {
        wsService.unsubscribe(subscriptionRef.current);
      }
    };
  }, [walletState.wallet?.publicKey]);

  // Setup WebSocket when real-time is enabled
  useEffect(() => {
    if (realTimeEnabled) {
      wsService.connect().then(() => {
        setWsConnected(wsService.isConnected());
        setupWebSocketSubscription();
      });
    } else {
      wsService.disconnect();
      setWsConnected(false);
    }

    return () => {
      if (subscriptionRef.current) {
        wsService.unsubscribe(subscriptionRef.current);
      }
    };
  }, [realTimeEnabled, setupWebSocketSubscription, wsService]);

  // Update filtered events when filters or search changes
  useEffect(() => {
    setFilteredEvents(applyFilters(events, filters, searchQuery));
  }, [events, filters, searchQuery, applyFilters]);

  // Setup infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadEvents(false);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadEvents]);

  // Handle filter changes
  const handleFilterChange = (newFilters: EventFilter) => {
    setFilters(newFilters);
    loadEvents(true);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Export functions
  const exportAsJSON = async () => {
    try {
      const json = await eventCache.exportEvents(filters);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Events exported as JSON');
    } catch (error) {
      toast.error('Failed to export events');
    }
  };

  const exportAsCSV = async () => {
    try {
      const csv = await eventCache.exportEventsAsCSV(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Events exported as CSV');
    } catch (error) {
      toast.error('Failed to export events');
    }
  };

  // Format event parameters for display
  const formatParameters = (parameters: Record<string, any>) => {
    return Object.entries(parameters).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1">
        <span className="text-xs font-medium text-gray-600">{key}:</span>
        <span className="text-xs text-gray-900 font-mono">{String(value)}</span>
      </div>
    ));
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    const colors = {
      energy_trading: 'bg-green-100 text-green-800',
      dao_governance: 'bg-blue-100 text-blue-800',
      carbon_credit: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Smart Contract Events</h2>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Real-time toggle */}
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                realTimeEnabled 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-gray-50 text-gray-400'
              }`}
              title={realTimeEnabled ? 'Disable real-time updates' : 'Enable real-time updates'}
            >
              {realTimeEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </button>

            {/* Refresh */}
            <button
              onClick={() => loadEvents(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh events"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Export */}
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={exportAsJSON}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export as JSON</span>
                </button>
                <button
                  onClick={exportAsCSV}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileSpreadsheetIcon className="w-4 h-4" />
                  <span>Export as CSV</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FilterIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-gray-50"
          >
            <EventFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              eventDecoder={eventDecoder}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List */}
      <div 
        className="divide-y divide-gray-200 overflow-y-auto"
        style={{ maxHeight }}
      >
        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-sm text-center">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'No smart contract events for this account yet'}
            </p>
          </div>
        ) : (
          <>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                    <a
                      href={event.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BuildingIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Contract:</span>
                      <span className="font-mono text-xs text-gray-900">
                        {event.contractAddress.slice(0, 8)}...{event.contractAddress.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Tx Hash:</span>
                      <span className="font-mono text-xs text-gray-900">
                        {event.transactionHash.slice(0, 8)}...{event.transactionHash.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">From:</span>
                      <span className="font-mono text-xs text-gray-900">
                        {event.sourceAccount.slice(0, 8)}...{event.sourceAccount.slice(-8)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Parameters</h4>
                    <div className="space-y-1">
                      {formatParameters(event.parameters)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Load more trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="p-4 text-center">
                {loadingMore ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
                ) : (
                  <span className="text-sm text-gray-500">Scroll to load more</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Filter component
interface EventFiltersProps {
  filters: EventFilter;
  onFilterChange: (filters: EventFilter) => void;
  eventDecoder: ReturnType<typeof createEventDecoder>;
}

const EventFilters: React.FC<EventFiltersProps> = ({ filters, onFilterChange, eventDecoder }) => {
  const [localFilters, setLocalFilters] = useState<EventFilter>(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: EventFilter = {};
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const contractAddresses = eventDecoder.getContractAddresses();
  const eventTypes = eventDecoder.getAvailableEventTypes();

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contract Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract Address
          </label>
          <select
            value={localFilters.contractAddress || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              contractAddress: e.target.value || undefined
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Contracts</option>
            {Object.entries(contractAddresses).map(([type, address]) => (
              <option key={address} value={address}>
                {type} - {address.slice(0, 8)}...{address.slice(-8)}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            value={localFilters.eventType || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              eventType: e.target.value || undefined
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={localFilters.dateFrom ? localFilters.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              dateFrom: e.target.value ? new Date(e.target.value) : undefined
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={localFilters.dateTo ? localFilters.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              dateTo: e.target.value ? new Date(e.target.value) : undefined
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
