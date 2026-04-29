import { DecodedEvent, EventFilter } from './eventDecoder';

// IndexedDB configuration
const DB_NAME = 'CurrentDaoEventCache';
const DB_VERSION = 1;
const STORE_NAME = 'events';

interface CachedEvent extends DecodedEvent {
  cachedAt: number;
  expiresAt: number;
}

interface CacheMetadata {
  lastUpdated: number;
  totalEvents: number;
  contractAddresses: string[];
  eventTypes: string[];
}

export class EventCache {
  private db: IDBDatabase | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create events store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('contractAddress', 'contractAddress', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('sourceAccount', 'sourceAccount', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('transactionHash', 'transactionHash', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store events in cache
   */
  async storeEvents(events: DecodedEvent[]): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME, 'metadata'], 'readwrite');
    const eventStore = transaction.objectStore(STORE_NAME);
    const metadataStore = transaction.objectStore('metadata');

    const now = Date.now();
    const expiresAt = now + this.CACHE_TTL;

    // Store events
    const cachedEvents: CachedEvent[] = events.map(event => ({
      ...event,
      cachedAt: now,
      expiresAt
    }));

    for (const event of cachedEvents) {
      eventStore.put(event);
    }

    // Update metadata
    const metadata: CacheMetadata = {
      lastUpdated: now,
      totalEvents: await this.getTotalEventCount(),
      contractAddresses: await this.getUniqueContractAddresses(),
      eventTypes: await this.getUniqueEventTypes()
    };

    metadataStore.put({ key: 'global', ...metadata });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get events from cache with filtering
   */
  async getEvents(filter: EventFilter = {}, limit: number = 50): Promise<DecodedEvent[]> {
    if (!this.db) await this.init();

    const now = Date.now();
    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.index('expiresAt').openCursor(IDBKeyRange.upperBound(now));
      const events: DecodedEvent[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && events.length < limit) {
          const event = cursor.value as CachedEvent;
          
          // Apply filters
          if (this.matchesFilter(event, filter)) {
            // Remove cache-specific fields
            const { cachedAt, expiresAt, ...decodedEvent } = event;
            events.push(decodedEvent);
          }
          
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get events for a specific contract
   */
  async getContractEvents(contractAddress: string, limit: number = 50): Promise<DecodedEvent[]> {
    if (!this.db) await this.init();

    const now = Date.now();
    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('contractAddress');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(contractAddress));
      const events: DecodedEvent[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && events.length < limit) {
          const event = cursor.value as CachedEvent;
          
          // Check if event is not expired
          if (event.expiresAt > now) {
            const { cachedAt, expiresAt, ...decodedEvent } = event;
            events.push(decodedEvent);
          }
          
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get events for a specific account
   */
  async getAccountEvents(accountAddress: string, limit: number = 50): Promise<DecodedEvent[]> {
    if (!this.db) await this.init();

    const now = Date.now();
    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sourceAccount');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(accountAddress));
      const events: DecodedEvent[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && events.length < limit) {
          const event = cursor.value as CachedEvent;
          
          // Check if event is not expired
          if (event.expiresAt > now) {
            const { cachedAt, expiresAt, ...decodedEvent } = event;
            events.push(decodedEvent);
          }
          
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(startDate: Date, endDate: Date, limit: number = 50): Promise<DecodedEvent[]> {
    if (!this.db) await this.init();

    const now = Date.now();
    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.bound(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      const request = index.openCursor(range);
      const events: DecodedEvent[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && events.length < limit) {
          const event = cursor.value as CachedEvent;
          
          // Check if event is not expired
          if (event.expiresAt > now) {
            const { cachedAt, expiresAt, ...decodedEvent } = event;
            events.push(decodedEvent);
          }
          
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear expired events from cache
   */
  async clearExpiredEvents(): Promise<void> {
    if (!this.db) await this.init();

    const now = Date.now();
    const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('expiresAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(now));
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`Cleared ${deletedCount} expired events from cache`);
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all events from cache
   */
  async clearAllEvents(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([STORE_NAME, 'metadata'], 'readwrite');
    const eventStore = transaction.objectStore(STORE_NAME);
    const metadataStore = transaction.objectStore('metadata');

    return new Promise((resolve, reject) => {
      eventStore.clear();
      metadataStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get cache metadata
   */
  async getMetadata(): Promise<CacheMetadata | null> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction('metadata', 'readonly');
    const store = transaction.objectStore('metadata');

    return new Promise((resolve, reject) => {
      const request = store.get('global');
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache size estimate
   */
  async getCacheSize(): Promise<number> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if event matches filter criteria
   */
  private matchesFilter(event: CachedEvent, filter: EventFilter): boolean {
    if (filter.contractAddress && event.contractAddress !== filter.contractAddress) {
      return false;
    }
    
    if (filter.eventType && event.type !== filter.eventType) {
      return false;
    }
    
    if (filter.sourceAccount && event.sourceAccount !== filter.sourceAccount) {
      return false;
    }
    
    if (filter.dateFrom && new Date(event.timestamp) < filter.dateFrom) {
      return false;
    }
    
    if (filter.dateTo && new Date(event.timestamp) > filter.dateTo) {
      return false;
    }
    
    return true;
  }

  /**
   * Get total event count
   */
  private async getTotalEventCount(): Promise<number> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unique contract addresses
   */
  private async getUniqueContractAddresses(): Promise<string[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('contractAddress');

    return new Promise((resolve, reject) => {
      const request = index.getAllKeys();
      
      request.onsuccess = () => {
        const keys = request.result as IDBValidKey[];
        const uniqueKeys = Array.from(new Set(keys)) as string[];
        resolve(uniqueKeys);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unique event types
   */
  private async getUniqueEventTypes(): Promise<string[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('type');

    return new Promise((resolve, reject) => {
      const request = index.getAllKeys();
      
      request.onsuccess = () => {
        const keys = request.result as IDBValidKey[];
        const uniqueKeys = Array.from(new Set(keys)) as string[];
        resolve(uniqueKeys);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export events as JSON
   */
  async exportEvents(filter: EventFilter = {}): Promise<string> {
    const events = await this.getEvents(filter, 10000); // Get up to 10k events
    return JSON.stringify(events, null, 2);
  }

  /**
   * Export events as CSV
   */
  async exportEventsAsCSV(filter: EventFilter = {}): Promise<string> {
    const events = await this.getEvents(filter, 10000);
    
    const headers = [
      'ID',
      'Type',
      'Name',
      'Contract Address',
      'Parameters',
      'Timestamp',
      'Block Number',
      'Transaction Hash',
      'Source Account',
      'Network',
      'Explorer URL'
    ];

    const csvRows = [headers.join(',')];

    for (const event of events) {
      const row = [
        `"${event.id}"`,
        `"${event.type}"`,
        `"${event.name}"`,
        `"${event.contractAddress}"`,
        `"${JSON.stringify(event.parameters).replace(/"/g, '""')}"`,
        `"${event.timestamp}"`,
        event.blockNumber,
        `"${event.transactionHash}"`,
        `"${event.sourceAccount}"`,
        `"${event.network}"`,
        `"${event.explorerUrl}"`
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}

export const eventCache = new EventCache();
