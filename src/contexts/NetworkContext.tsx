// src/contexts/NetworkContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NetworkType = 'mainnet' | 'testnet' | 'futurenet';

interface NetworkContextType {
  network: NetworkType;
  switchNetwork: (newNetwork: NetworkType) => void;
  isTestnet: boolean;
  isMainnet: boolean;
  isFuturenet: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NETWORK_CONFIG = {
  mainnet: { name: 'Mainnet', color: 'green', horizon: 'https://horizon.stellar.org' },
  testnet: { name: 'Testnet', color: 'orange', horizon: 'https://horizon-testnet.stellar.org' },
  futurenet: { name: 'Futurenet', color: 'purple', horizon: 'https://horizon-futurenet.stellar.org' },
};

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<NetworkType>(() => {
    return (localStorage.getItem('currentNetwork') as NetworkType) || 'testnet';
  });

  const switchNetwork = (newNetwork: NetworkType) => {
    if (newNetwork === network) return;

    setNetwork(newNetwork);
    localStorage.setItem('currentNetwork', newNetwork);

    // Clear cached data on network switch
    localStorage.removeItem('userBalances');
    localStorage.removeItem('proposals');
    window.location.reload(); // Optional: full reload for clean state
  };

  const isTestnet = network === 'testnet';
  const isMainnet = network === 'mainnet';
  const isFuturenet = network === 'futurenet';

  return (
    <NetworkContext.Provider value={{ network, switchNetwork, isTestnet, isMainnet, isFuturenet }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};