# CurrentDao Frontend

This repository contains the **frontend** of **CurrentDao**, a decentralized energy marketplace.  

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and the App Router.  

## Features

- User interface for energy trading
- Integration with backend APIs
- Authentication and user management
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
