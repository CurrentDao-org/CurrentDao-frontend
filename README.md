# CurrentDao Frontend

This repository contains the **frontend** of **CurrentDao**, a decentralized energy marketplace with geographic location-based trading interface.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and the App Router.

## Features

### Core Platform Features
- User interface for energy trading
- Integration with backend APIs
- Authentication and user management
- **Energy Producer Dashboard**: Real-time tracking of production and earnings.
- **Real-time Visualization**: Live energy price charts and monthly portfolio metrics.
- **WebSocket Integration**: Live data updates every 5 seconds for dynamic monitoring.
- **Responsive & Accessible**: Fully optimized for mobile and desktop (WCAG 2.1 AA compliant).
- **Dark Mode Support**: Seamless theme switching for better user experience.
- **Robust Error Handling**: Graceful failure modes and loading skeletons.
- Responsive design with Tailwind CSS
- Mobile wallet integration with 12 supported wallet profiles
- Mobile payment rails with optimized under-5-second settlement targets
- Banking balance sync and cross-device wallet synchronization
- Mobile wallet analytics and security posture visibility

### 🗺️ Geographic Trading Interface (NEW)
- **Interactive Map Integration** - Real-time map rendering with 1000+ marker support
- **Location-Based Filtering** - Radius, regional, and grid zone filtering
- **Regional Market Analysis** - Price trends and market statistics by region
- **Distance Calculator** - Route planning with delivery cost calculations
- **Geographic Heat Maps** - Trading activity visualization with multiple data modes
- **GPS Integration** - Automatic location detection with privacy controls
- **Performance Optimization** - Marker clustering and viewport-based rendering
- **Mobile Responsive** - Touch-friendly controls and gesture support
- **Accessibility Compliant** - WCAG 2.1 standards with keyboard navigation

## Mobile Wallet Integration

The mobile wallet dashboard models the core requirements for energy trading checkout:

- 12 mobile wallet profiles spanning native wallets, banking apps, super-apps, and mobile DeFi
- Payment rails with 2-3 step optimized flows and sub-5-second settlement targets
- Banking app connections with synced balances, connection-health metadata, and instant-pay capability flags
- Cross-device wallet synchronization snapshots with coverage, latency, and conflict tracking
- Security audit visibility for PCI DSS, PSD2, SOC 2, biometric MFA, and device-integrity controls
- Wallet analytics for preferred rails, top wallets, usage patterns, and payment-flow reduction metrics

Core implementation files live under `src/components/mobile`, `src/hooks/useMobileWallet.ts`, `src/services/mobile`, and `src/types/mobile-wallet.ts`.

## Geographic Trading Interface

### Map Components
- **InteractiveMap** - Main map component with Leaflet integration
- **LocationFilter** - Advanced filtering by radius, region, and grid zones
- **RegionalMarket** - Market analysis with trends and statistics
- **DistanceCalculator** - Route planning and cost calculations
- **HeatMap** - Trading activity visualization

### Key Features
- **1000+ Marker Support** - Optimized rendering with clustering
- **Real-time Updates** - Live data synchronization
- **Privacy-First** - User-controlled location permissions
- **Cross-Browser** - Chrome, Firefox, Safari, Edge support

### Implementation Files
- `src/components/maps/` - Map components
- `src/hooks/useGeolocation.ts` - GPS functionality
- `src/hooks/useMapIntegration.ts` - Map state management
- `src/utils/mapHelpers.ts` - Geographic calculations
- `src/types/maps.ts` - TypeScript interfaces

## Biometric Authentication

The biometric authentication dashboard now models secure mobile access and transaction approval with:

- Fingerprint verification under 1 second for device access
- Face recognition accuracy above 98%
- Voice biometric verification within 2 seconds
- Device-wide fallback coverage across PIN, passkey, hardware-key, and recovery flows
- Hardware-backed secure biometric storage aligned to FIPS 140-3 levels
- Multi-factor biometric confirmation for higher-value energy transactions
- Biometric analytics for modality adoption, success rates, and compliance posture

Core implementation files live under `src/components/security`, `src/hooks/useBiometricAuth.ts`, `src/services/security`, and `src/types/biometric.ts`.
=======
# Geographic Location-Based Trading Interface

A comprehensive energy trading platform with interactive maps, location-based filtering, and regional market analysis built with React, TypeScript, and Leaflet.

## Features

### 🗺️ Interactive Map Integration
- **Real-time map rendering** with 1000+ marker support
- **Custom markers** for energy listings, user location, and regional data
- **Clustering** for performance optimization at low zoom levels
- **Smooth pan and zoom** interactions
- **Mobile-responsive** map controls

### 📍 Location-Based Filtering
- **Radius filtering** - Find listings within X km of a location
- **Regional filtering** - Filter by US regions (Northeast, Southeast, Midwest, Southwest, West)
- **Grid zone filtering** - Filter by electrical grid zones (PJM, ERCOT, CAISO, NYISO, ISO-NE)
- **User location integration** - Automatic GPS positioning
- **Custom coordinate input** - Manual lat/lng entry support

### 📊 Regional Market Analysis
- **Market overview** with aggregated statistics
- **Price trends** (up/down/stable) visualization
- **Regional comparisons** with sorting options
- **Real-time updates** with last refresh timestamps
- **Capacity and listing counts** per region

### 📏 Distance Calculator
- **Route planning** between any two points
- **Delivery cost calculations** based on distance
- **Estimated delivery time** calculations
- **Multiple route management**
- **Export functionality** for route data

### 🔥 Geographic Heat Maps
- **Trading activity visualization** with intensity gradients
- **Multiple data modes** (energy volume, price levels, capacity)
- **Adjustable intensity settings** (low/medium/high)
- **Interactive hotspots** with detailed information
- **Export capabilities** for heat map data

### 🎯 GPS Integration
- **Automatic location detection**
- **Permission handling** with user-friendly prompts
- **Location accuracy indicators**
- **Background location tracking**
- **Privacy-conscious** implementation

## Architecture

### Project Structure
```
src/
├── components/maps/          # Map components
│   ├── InteractiveMap.tsx    # Main interactive map
│   ├── LocationFilter.tsx    # Location filtering UI
│   ├── RegionalMarket.tsx    # Regional market analysis
│   ├── DistanceCalculator.tsx # Distance calculation tool
│   └── HeatMap.tsx          # Heat map visualization
├── hooks/                   # Custom React hooks
│   ├── useGeolocation.ts    # GPS functionality
│   └── useMapIntegration.ts # Map state management
├── utils/                   # Utility functions
│   └── mapHelpers.ts        # Map calculation helpers
├── types/                   # TypeScript definitions
│   └── maps.ts              # Map-related types
└── App.tsx                  # Main application component
```

### Key Technologies
- **React 18** with TypeScript
- **Leaflet** for interactive mapping
- **React-Leaflet** for React integration
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Performance Features

### 🚀 Optimized for 1000+ Markers
- **Marker clustering** at low zoom levels
- **Viewport-based rendering** - only visible markers
- **Debounced map events** to prevent excessive re-renders
- **Memoized calculations** for expensive operations
- **Lazy loading** of map components

### 📱 Mobile Optimization
- **Touch-friendly** controls and interactions
- **Responsive design** for all screen sizes
- **Optimized performance** for mobile devices
- **Gesture support** for map navigation

### ♿ Accessibility
- **WCAG 2.1 compliant** design
- **Keyboard navigation** support
- **Screen reader** compatibility
- **ARIA labels** and descriptions
- **Focus management** for interactive elements

### 🔒 Privacy & Security
- **User-controlled** location permissions
- **No location data storage** without consent
- **Encrypted data transmission**
- **Privacy-conscious** default settings
>>>>>>> feature/geographic-trading-interface

## Getting Started

### Prerequisites
<<<<<<< HEAD

- Node.js >= 18.x  
- npm >= 11.x  

### Installation

```bash
git clone https://github.com/CurrentDao-org/CurrentDao-frontend.git
cd currentdao-frontend
npm install
```

### Running Locally

```bash
npm run dev
```

### Quality Checks

```bash
npm run test -- --coverage
npm run type-check
```

### Environment Variables

Create a `.env` file based on `.env.example`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License.
=======
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yourbigmike/CurrentDao-frontend.git
   cd CurrentDao-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

The build will be created in the `build/` directory.

## Usage

### Basic Navigation
1. **Interactive Map Tab** - View and interact with energy listings on the map
2. **Regional Markets Tab** - Analyze market data by region
3. **Distance Calculator Tab** - Calculate delivery costs and routes
4. **Heat Map Tab** - Visualize trading activity patterns

### Location Filtering
1. Click **"Add Filter"** in the sidebar
2. Choose filter type: **Radius**, **Region**, or **Grid Zone**
3. Configure filter parameters
4. View filtered results on the map

### GPS Features
1. Click **"Enable Location"** in the header
2. Allow browser location access when prompted
3. View your location on the map
4. Use location for distance calculations

### Map Interactions
- **Click markers** to view listing details
- **Drag to pan** the map view
- **Scroll to zoom** in/out
- **Click cluster markers** to zoom into areas
- **Use +/- buttons** for zoom control

## Configuration

### Map Settings
```typescript
const mapConfig = {
  defaultCenter: { lat: 39.8283, lng: -98.5795 }, // US Center
  defaultZoom: 4,
  maxZoom: 18,
  minZoom: 2,
  clusterEnabled: true,
  heatMapEnabled: false,
};
```

### Location Permissions
```typescript
const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};
```

## Testing

### Performance Testing
The application includes built-in performance testing for:
- **1000+ marker rendering**
- **Map interaction responsiveness**
- **Filter application speed**
- **Memory usage optimization**

### Run Tests
```bash
npm test
# or
yarn test
```

### Accessibility Testing
```bash
npm run test:a11y
# or
yarn test:a11y
```

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Leaflet** - Open-source mapping library
- **React-Leaflet** - React components for Leaflet
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [FAQ](docs/FAQ.md)

---

**Built with ❤️ for the energy trading community**
>>>>>>> feature/geographic-trading-interface
