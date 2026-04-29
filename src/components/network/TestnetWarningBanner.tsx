import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

const TestnetBanner = () => {
  const { isTestnet } = useNetwork();

  if (!isTestnet) return null;

  return (
    <div className="bg-orange-600 text-white py-2 px-4 text-center text-sm font-medium">
      ⚠️ You are currently on <strong>Testnet</strong>. All transactions use test XLM. 
      Do not send real assets.
    </div>
  );
};

export default TestnetBanner;