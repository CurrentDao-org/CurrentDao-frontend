import { useNetwork } from '../contexts/NetworkContext';
import { Networks } from '@stellar/stellar-sdk';

export const useStellarNetwork = () => {
  const { network } = useNetwork();

  const getNetworkPassphrase = () => {
    switch (network) {
      case 'mainnet': return Networks.PUBLIC;
      case 'testnet': return Networks.TESTNET;
      case 'futurenet': return Networks.FUTURENET;
      default: return Networks.TESTNET;
    }
  };

  const horizonUrl = {
    mainnet: 'https://horizon.stellar.org',
    testnet: 'https://horizon-testnet.stellar.org',
    futurenet: 'https://horizon-futurenet.stellar.org',
  }[network];

  return { network, getNetworkPassphrase, horizonUrl };
};