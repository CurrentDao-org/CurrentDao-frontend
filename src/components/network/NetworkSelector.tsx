import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

const NetworkSelector = () => {
  const { network, switchNetwork } = useNetwork();

  const networks = [
    { value: 'testnet', label: 'Testnet', color: 'bg-orange-500' },
    { value: 'mainnet', label: 'Mainnet', color: 'bg-green-500' },
    { value: 'futurenet', label: 'Futurenet', color: 'bg-purple-500' },
  ];

  return (
    <div className="relative">
      <select
        value={network}
        onChange={(e) => switchNetwork(e.target.value as any)}
        className="bg-gray-800 text-white text-sm border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        {networks.map((net) => (
          <option key={net.value} value={net.value}>
            {net.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NetworkSelector;