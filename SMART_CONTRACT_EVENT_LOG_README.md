# Smart Contract Event Log Implementation

## Overview

This implementation provides a comprehensive Smart Contract Event Log feature for the CurrentDao frontend, allowing users to view, filter, and export decoded smart contract events from Stellar blockchain transactions.

## Features Implemented

### ✅ Core Features
- **Decoded Event Names and Parameters**: Human-readable event data instead of raw hex
- **Advanced Filtering**: Filter by contract address, event type, date range, and source account
- **Block Explorer Integration**: Direct links to transaction details on Stellar Explorer
- **Export Functionality**: Export events as CSV or JSON files
- **Real-time Updates**: WebSocket subscription for live event streaming
- **Pagination with Infinite Scroll**: Efficient loading of large event histories
- **IndexedDB Caching**: Local storage for improved performance and offline access

### 🔧 Technical Implementation
- **Stellar Horizon Integration**: Uses Horizon API for transaction data
- **Event Decoding Service**: Intelligent parsing of smart contract events
- **WebSocket Service**: Real-time event streaming with reconnection logic
- **Caching Layer**: IndexedDB for persistent event storage
- **TypeScript Support**: Full type safety and IntelliSense support

## Architecture

### Services Layer

#### 1. Event Decoder (`src/services/eventDecoder.ts`)
- Decodes Stellar transaction operations into human-readable events
- Supports multiple contract types (Energy Trading, DAO Governance, Carbon Credits)
- Provides filtering and pagination capabilities
- Links events to block explorers

#### 2. Event Cache (`src/services/eventCache.ts`)
- IndexedDB-based caching system
- Automatic expiration and cleanup
- Export functionality (JSON/CSV)
- Metadata tracking for cache statistics

#### 3. WebSocket Service (`src/services/websocketService.ts`)
- Real-time event streaming
- Automatic reconnection with exponential backoff
- Subscription management for different event types
- Error handling and connection status monitoring

### Components Layer

#### Event Log Component (`src/components/events/EventLogComponent.tsx`)
- Main UI component for displaying events
- Advanced filtering interface
- Search functionality
- Export controls
- Real-time toggle
- Infinite scroll implementation

## Integration Guide

### 1. Basic Setup

```tsx
import { WalletProvider } from '@/hooks/useStellarWallet';
import { EventLogComponent } from '@/components/events/EventLogComponent';

function App() {
  return (
    <WalletProvider network="testnet" autoConnect={false}>
      <EventLogComponent
        className="shadow-lg"
        maxHeight="600px"
        showRealTime={true}
      />
    </WalletProvider>
  );
}
```

### 2. Advanced Configuration

```tsx
<EventLogComponent
  className="custom-event-log"
  maxHeight="800px"
  showRealTime={true}
  initialFilter={{
    contractAddress: "GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQ",
    eventType: "energy_trading",
    dateFrom: new Date("2024-01-01"),
    dateTo: new Date("2024-12-31")
  }}
/>
```

### 3. Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS classes |
| `maxHeight` | `string` | `"600px"` | Maximum height of the event list |
| `showRealTime` | `boolean` | `true` | Enable/disable real-time updates |
| `initialFilter` | `EventFilter` | `{}` | Initial filter configuration |

## Event Types Supported

### Energy Trading Contract
- `TradeCreated`: New energy trade initiated
- `TradeCompleted`: Energy trade successfully completed
- `TradeCancelled`: Energy trade cancelled with refund

### DAO Governance Contract
- `ProposalCreated`: New governance proposal created
- `VoteCast`: Vote cast on a proposal
- `ProposalExecuted`: Proposal successfully executed

### Carbon Credit Contract
- `CreditIssued`: New carbon credits issued
- `CreditTransferred`: Credits transferred between accounts
- `CreditRetired`: Credits retired for offsetting

## Filter Options

### Contract Address Filter
Filter events by specific smart contract addresses.

### Event Type Filter
Filter by specific event types (energy_trading, dao_governance, carbon_credit).

### Date Range Filter
Filter events by creation date range.

### Source Account Filter
Filter events by the account that initiated the transaction.

### Search Functionality
Full-text search across:
- Event names
- Event types
- Contract addresses
- Transaction hashes
- Event parameters

## Export Options

### JSON Export
```javascript
const json = await eventCache.exportEvents(filters);
// Downloads: events-2024-04-29.json
```

### CSV Export
```javascript
const csv = await eventCache.exportEventsAsCSV(filters);
// Downloads: events-2024-04-29.csv
```

## Performance Optimizations

### 1. IndexedDB Caching
- Events are cached locally for instant access
- Automatic cache expiration (5 minutes TTL)
- Background cleanup of expired events
- Metadata tracking for cache statistics

### 2. Infinite Scroll
- Loads events on-demand as user scrolls
- Reduces initial load time
- Efficient memory usage
- Smooth user experience

### 3. Real-time Updates
- WebSocket connection for live events
- Automatic reconnection with exponential backoff
- Subscription management for efficient updates
- Connection status indicators

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Full responsive support

## Technical Requirements

### Dependencies
- `@stellar/stellar-sdk`: Stellar blockchain integration
- `framer-motion`: Animations and transitions
- `react-hot-toast`: Toast notifications
- IndexedDB: Browser storage (built-in)

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "strict": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Usage Examples

### Example 1: Basic Event Log
```tsx
<EventLogComponent showRealTime={true} />
```

### Example 2: Energy Trading Events Only
```tsx
<EventLogComponent
  initialFilter={{ eventType: "energy_trading" }}
  showRealTime={true}
/>
```

### Example 3: Date-Ranged Events
```tsx
<EventLogComponent
  initialFilter={{
    dateFrom: new Date("2024-01-01"),
    dateTo: new Date("2024-03-31")
  }}
/>
```

### Example 4: Compact View
```tsx
<EventLogComponent
  maxHeight="300px"
  showRealTime={false}
/>
```

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- User-friendly error messages
- Graceful degradation to cached data

### WebSocket Errors
- Automatic reconnection
- Connection status indicators
- Fallback to polling if needed

### Cache Errors
- Fallback to live data
- Cache cleanup on corruption
- Error logging for debugging

## Security Considerations

### Data Privacy
- All sensitive data is processed client-side
- No server-side data storage
- Local cache encryption (browser-dependent)

### Input Validation
- All user inputs are validated
- SQL injection protection in IndexedDB
- XSS prevention in rendered content

## Future Enhancements

### Planned Features
- [ ] Event analytics and charts
- [ ] Advanced search with regex
- [ ] Event subscription notifications
- [ ] Multi-contract event correlation
- [ ] Event replay functionality

### Performance Improvements
- [ ] Service Worker for background sync
- [ ] Web Workers for heavy processing
- [ ] Compression for large datasets
- [ ] Lazy loading for event details

## Troubleshooting

### Common Issues

#### Events Not Loading
1. Check wallet connection
2. Verify network connectivity
3. Clear browser cache
4. Check console for errors

#### Real-time Updates Not Working
1. Check WebSocket connection status
2. Verify firewall settings
3. Try disabling real-time mode
4. Check browser console for errors

#### Export Not Working
1. Check browser download permissions
2. Verify popup blockers are disabled
3. Try smaller date ranges
4. Check console for export errors

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('event-log-debug', 'true');
```

## API Reference

### EventDecoder Class
```typescript
class EventDecoder {
  constructor(network: 'mainnet' | 'testnet')
  async decodeTransactionEvents(transactionHash: string): Promise<DecodedEvent[]>
  async getAccountEvents(accountAddress: string, filter?: EventFilter): Promise<EventLogResponse>
  async getContractEvents(contractAddress: string, filter?: EventFilter): Promise<EventLogResponse>
  getAvailableEventTypes(): string[]
  getContractAddresses(): Record<string, string>
}
```

### EventCache Class
```typescript
class EventCache {
  async storeEvents(events: DecodedEvent[]): Promise<void>
  async getEvents(filter?: EventFilter, limit?: number): Promise<DecodedEvent[]>
  async exportEvents(filter?: EventFilter): Promise<string>
  async exportEventsAsCSV(filter?: EventFilter): Promise<string>
  async clearExpiredEvents(): Promise<void>
  async getCacheSize(): Promise<number>
}
```

### WebSocketService Class
```typescript
class WebSocketService {
  async connect(): Promise<void>
  disconnect(): void
  subscribeToAccount(accountAddress: string, callback: Function): string
  subscribeToContract(contractAddress: string, callback: Function): string
  unsubscribe(subscriptionId: string): void
  isConnected(): boolean
}
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser to `http://localhost:3000`

### Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

### Code Style
- ESLint configuration: `.eslintrc.json`
- Prettier configuration: `.prettierrc`
- TypeScript strict mode enabled

## License

This implementation is part of the CurrentDao project and follows the project's licensing terms.

## Support

For questions, issues, or feature requests:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include browser version and error logs
4. Provide reproduction steps when possible

---

**Note**: This implementation is designed specifically for Stellar blockchain smart contracts and may require adaptation for other blockchain networks.
