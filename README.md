# CurrentDao Frontend

This repository contains the **frontend** of **CurrentDao**, a decentralized energy marketplace.  

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and the App Router.  

## Features

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

## Mobile Wallet Integration

The mobile wallet dashboard now models the core requirements for energy trading checkout:

- 12 mobile wallet profiles spanning native wallets, banking apps, super-apps, and mobile DeFi
- Payment rails with 2-3 step optimized flows and sub-5-second settlement targets
- Banking app connections with synced balances, connection-health metadata, and instant-pay capability flags
- Cross-device wallet synchronization snapshots with coverage, latency, and conflict tracking
- Security audit visibility for PCI DSS, PSD2, SOC 2, biometric MFA, and device-integrity controls
- Wallet analytics for preferred rails, top wallets, usage patterns, and payment-flow reduction metrics

Core implementation files live under `src/components/mobile`, `src/hooks/useMobileWallet.ts`, `src/services/mobile`, and `src/types/mobile-wallet.ts`.

## Mobile Wallet Integration

The mobile wallet dashboard now models the core requirements for energy trading checkout:

- 12 mobile wallet profiles spanning native wallets, banking apps, super-apps, and mobile DeFi
- Payment rails with 2-3 step optimized flows and sub-5-second settlement targets
- Banking app connections with synced balances, connection-health metadata, and instant-pay capability flags
- Cross-device wallet synchronization snapshots with coverage, latency, and conflict tracking
- Security audit visibility for PCI DSS, PSD2, SOC 2, biometric MFA, and device-integrity controls
- Wallet analytics for preferred rails, top wallets, usage patterns, and payment-flow reduction metrics

Core implementation files live under `src/components/mobile`, `src/hooks/useMobileWallet.ts`, `src/services/mobile`, and `src/types/mobile-wallet.ts`.

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

## Getting Started

### Prerequisites

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

## Performance Optimizations

This project implements comprehensive performance optimizations targeting:
- **Initial bundle under 1MB**
- **LCP < 2.5s** (Largest Contentful Paint)
- **CLS < 0.1** (Cumulative Layout Shift)
- **FID < 100ms** (First Input Delay)
- **Lighthouse mobile score 90+**

### Lazy Loading

Components are lazy loaded to reduce initial bundle size:

| Component | File | Size | Reason |
|-----------|------|------|--------|
| QRScanner | `src/components/common/LazyQRScanner.tsx` | ~60KB | Heavy html5-qrcode library, only needed on scan |
| ChartComparison | `src/components/common/LazyChartComparison.tsx` | ~12KB | Complex chart UI with modals, below fold |
| DrawingTools | `src/components/common/LazyDrawingTools.tsx` | ~11KB | Interactive SVG, only in advanced mode |
| PortfolioAnalysis | `src/components/common/LazyPortfolioAnalysis.tsx` | ~15KB | Multiple recharts, risk tab only |
| ChatContainer | `src/components/common/LazyChatContainer.tsx` | ~14KB | Full chat UI, separate page |

**Usage:**
```tsx
import { LazyQRScanner } from '@/components/common/LazyQRScanner'

// Component loads only when rendered
<LazyQRScanner onScanSuccess={handleScan} />
```

### Code Splitting

Webpack configuration splits bundles by vendor:
- Vendor chunks: `npm.[package-name].js`
- Common chunks: Shared components used across pages

### Image Optimization

- **next/image** with automatic WebP/AVIF conversion
- **LazyImage component** with intersection observer and blur placeholders
- Device-specific sizes: 640, 750, 828, 1080, 1200, 1920px
- 30-day cache TTL for optimized images

**Usage:**
```tsx
import { LazyImage } from '@/components/common/LazyImage'

<LazyImage
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Caching Strategy

| Resource Type | Cache Header |
|---------------|--------------|
| Static assets (`_next/static`) | `public, max-age=31536000, immutable` |
| Images (svg, jpg, png, etc.) | `public, max-age=31536000, immutable` |
| HTML pages | `public, s-maxage=60, stale-while-revalidate=300` |
| API routes | `no-store, must-revalidate` |

### Core Web Vitals

Web Vitals are automatically tracked and reported:

- **CLS**: Cumulative Layout Shift
- **LCP**: Largest Contentful Paint  
- **FCP**: First Contentful Paint
- **TTFB**: Time to First Byte

**Manual measurement:**
```tsx
import { usePerformanceMark } from '@/hooks/useLazyLoading'

function MyComponent({ data }) {
  usePerformanceMark('MyComponent', !!data)
  return <div>{data ? <Content /> : <Skeleton />}</div>
}
```

### Bundle Analysis

Analyze bundle size to identify optimization opportunities:

```bash
# Install bundle analyzer (if not already installed)
npm install --save-dev @next/bundle-analyzer

# Run analysis
npm run analyze
```

Generates reports in `.next/analyze/`:
- `client.html` - Client bundle visualization
- `server.html` - Server bundle visualization

### Performance Hooks

Available in `src/hooks/useLazyLoading.ts`:

- **`useIntersectionObserver`** - Lazy load when element enters viewport
- **`useLazyComponent`** - Load component dynamically on intersection
- **`usePerformanceMark`** - Track render timing
- **`usePrefetch`** - Prefetch routes on hover (with connection awareness)

### Utilities

Available in `src/utils/performanceHelpers.ts`:

- **`reportWebVital`** - Send metrics to analytics
- **`isSlowConnection`** - Detect 2G/slow connections
- **`generateBlurDataURL`** - Create placeholder images
- **`preconnect`** - Preconnect to origins
- **`measureTime`** - Profile code execution
- **`chunkArray`** - Batch render large lists

### Performance Budget Verification

Run these checks locally:

```bash
# Build and analyze
npm run build
npm run analyze

# Verify bundle size
du -h .next/static/chunks/*.js | sort -h

# Lighthouse CI (requires Chrome)
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html
```

Targets:
- JS bundle: < 200KB gzipped (initial)
- CSS: < 50KB gzipped
- Images: Serve WebP/AVIF with proper sizing
- Fonts: Use `display: swap`, preconnect to font CDN
