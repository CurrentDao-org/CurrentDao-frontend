import { Horizon, TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import { getHorizonServer, STELLAR_NETWORKS } from '@/lib/stellar';

// Event types for smart contract interactions
export interface DecodedEvent {
  id: string;
  type: string;
  name: string;
  contractAddress: string;
  parameters: Record<string, any>;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  sourceAccount: string;
  network: 'mainnet' | 'testnet';
  explorerUrl: string;
}

export interface EventFilter {
  contractAddress?: string;
  eventType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sourceAccount?: string;
}

export interface EventLogResponse {
  events: DecodedEvent[];
  hasMore: boolean;
  cursor?: string;
}

// Smart contract ABI definitions (simplified for Stellar)
const CONTRACT_ABIS: Record<string, any> = {
  // Energy Trading Contract
  'energy_trading': {
    events: {
      'TradeCreated': {
        parameters: {
          tradeId: 'string',
          seller: 'string',
          buyer: 'string',
          amount: 'string',
          price: 'string',
          energyType: 'string'
        }
      },
      'TradeCompleted': {
        parameters: {
          tradeId: 'string',
          completionTime: 'string',
          totalAmount: 'string'
        }
      },
      'TradeCancelled': {
        parameters: {
          tradeId: 'string',
          reason: 'string',
          refundAmount: 'string'
        }
      }
    }
  },
  // DAO Governance Contract
  'dao_governance': {
    events: {
      'ProposalCreated': {
        parameters: {
          proposalId: 'string',
          proposer: 'string',
          title: 'string',
          description: 'string',
          votingPeriod: 'number'
        }
      },
      'VoteCast': {
        parameters: {
          proposalId: 'string',
          voter: 'string',
          voteType: 'string',
          votingPower: 'string'
        }
      },
      'ProposalExecuted': {
        parameters: {
          proposalId: 'string',
          executor: 'string',
          executionTime: 'string'
        }
      }
    }
  },
  // Carbon Credit Contract
  'carbon_credit': {
    events: {
      'CreditIssued': {
        parameters: {
          creditId: 'string',
          recipient: 'string',
          amount: 'string',
          vintage: 'string',
          projectType: 'string'
        }
      },
      'CreditTransferred': {
        parameters: {
          creditId: 'string',
          from: 'string',
          to: 'string',
          amount: 'string'
        }
      },
      'CreditRetired': {
        parameters: {
          creditId: 'string',
          retiree: 'string',
          amount: 'string',
          retirementReason: 'string'
        }
      }
    }
  }
};

// Known contract addresses
const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  testnet: {
    energy_trading: 'GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQZQ5JQ',
    dao_governance: 'GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQZQ5JQ',
    carbon_credit: 'GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQZQ5JQ'
  },
  mainnet: {
    energy_trading: 'GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQZQ5JQ',
    dao_governance: 'GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQZQ5JQ',
    carbon_credit: 'GD5QJRNQNJMPBTH5HHJFZD6J5QXEJQJ2K2M5JQZQ5JQZQ5JQZQ5JQZQ5JQZQ5JQ'
  }
};

export class EventDecoder {
  private server: Horizon.Server;
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
    this.server = getHorizonServer(network);
  }

  /**
   * Decode events from Stellar transaction operations
   */
  async decodeTransactionEvents(transactionHash: string): Promise<DecodedEvent[]> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash);
      const operations = transaction.operations;
      const events: DecodedEvent[] = [];

      for (const operation of operations) {
        if (operation.type === 'invoke_host_function') {
          // This is a smart contract invocation
          const decodedEvents = this.decodeHostFunctionEvents(operation, transaction);
          events.push(...decodedEvents);
        }
      }

      return events;
    } catch (error) {
      console.error('Failed to decode transaction events:', error);
      return [];
    }
  }

  /**
   * Decode events from a host function operation
   */
  private decodeHostFunctionEvents(operation: any, transaction: any): DecodedEvent[] {
    const events: DecodedEvent[] = [];
    
    try {
      // Extract contract information from the operation
      const contractAddress = this.extractContractAddress(operation);
      if (!contractAddress) return events;

      // Get contract type from address
      const contractType = this.getContractType(contractAddress);
      if (!contractType) return events;

      // Parse operation body for events
      const operationBody = this.parseOperationBody(operation);
      
      // Decode events based on contract ABI
      const contractABI = CONTRACT_ABIS[contractType];
      if (!contractABI) return events;

      // Extract events from operation body
      const extractedEvents = this.extractEventsFromOperation(operationBody, contractABI);
      
      for (const extractedEvent of extractedEvents) {
        const decodedEvent: DecodedEvent = {
          id: `${transaction.hash}_${extractedEvent.name}_${Date.now()}`,
          type: contractType,
          name: extractedEvent.name,
          contractAddress,
          parameters: extractedEvent.parameters,
          timestamp: transaction.created_at,
          blockNumber: transaction.ledger,
          transactionHash: transaction.hash,
          sourceAccount: transaction.source_account,
          network: this.network,
          explorerUrl: this.getExplorerUrl(transaction.hash)
        };

        events.push(decodedEvent);
      }
    } catch (error) {
      console.error('Failed to decode host function events:', error);
    }

    return events;
  }

  /**
   * Extract contract address from operation
   */
  private extractContractAddress(operation: any): string | null {
    // In Stellar smart contracts, the contract address is typically
    // in the operation's source_account or a specific field
    if (operation.source_account) {
      return operation.source_account;
    }
    
    // Check for contract address in operation details
    if (operation.contract_id) {
      return operation.contract_id;
    }

    return null;
  }

  /**
   * Get contract type from address
   */
  private getContractType(address: string): string | null {
    const addresses = CONTRACT_ADDRESSES[this.network];
    for (const [type, contractAddress] of Object.entries(addresses)) {
      if (contractAddress === address) {
        return type;
      }
    }
    return null;
  }

  /**
   * Parse operation body for event data
   */
  private parseOperationBody(operation: any): any {
    try {
      // Parse the operation body based on Stellar's format
      if (operation.body) {
        return JSON.parse(operation.body);
      }
      
      // For Soroban contracts, events might be in different fields
      if (operation.events) {
        return { events: operation.events };
      }

      return {};
    } catch (error) {
      console.error('Failed to parse operation body:', error);
      return {};
    }
  }

  /**
   * Extract events from operation body using contract ABI
   */
  private extractEventsFromOperation(body: any, abi: any): any[] {
    const events: any[] = [];

    try {
      // Check if body contains events
      if (body.events && Array.isArray(body.events)) {
        for (const event of body.events) {
          // Match event with ABI
          const eventABI = abi.events[event.type];
          if (eventABI) {
            const decodedEvent = {
              name: event.type,
              parameters: this.decodeEventParameters(event.data || event, eventABI.parameters)
            };
            events.push(decodedEvent);
          }
        }
      }

      // For Soroban contracts, events might be in a different format
      if (body.result && body.result.events) {
        for (const event of body.result.events) {
          const eventABI = abi.events[event.type];
          if (eventABI) {
            const decodedEvent = {
              name: event.type,
              parameters: this.decodeEventParameters(event.data || event, eventABI.parameters)
            };
            events.push(decodedEvent);
          }
        }
      }
    } catch (error) {
      console.error('Failed to extract events from operation:', error);
    }

    return events;
  }

  /**
   * Decode event parameters based on ABI
   */
  private decodeEventParameters(data: any, parameterTypes: Record<string, string>): Record<string, any> {
    const decoded: Record<string, any> = {};

    try {
      for (const [paramName, paramType] of Object.entries(parameterTypes)) {
        if (data[paramName] !== undefined) {
          decoded[paramName] = this.decodeParameterValue(data[paramName], paramType);
        }
      }
    } catch (error) {
      console.error('Failed to decode event parameters:', error);
    }

    return decoded;
  }

  /**
   * Decode a single parameter value
   */
  private decodeParameterValue(value: any, type: string): any {
    switch (type) {
      case 'string':
        return typeof value === 'string' ? value : String(value);
      case 'number':
        return typeof value === 'number' ? value : Number(value);
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }

  /**
   * Get explorer URL for a transaction
   */
  private getExplorerUrl(transactionHash: string): string {
    const baseUrl = this.network === 'mainnet' 
      ? 'https://stellar.expert' 
      : 'https://testnet.stellar.expert';
    return `${baseUrl}/tx/${transactionHash}`;
  }

  /**
   * Get events for an account with filtering
   */
  async getAccountEvents(
    accountAddress: string,
    filter: EventFilter = {},
    limit: number = 50,
    cursor?: string
  ): Promise<EventLogResponse> {
    try {
      // Get transactions for the account
      const transactionsBuilder = this.server
        .transactions()
        .forAccount(accountAddress)
        .limit(limit)
        .order('desc');

      if (cursor) {
        transactionsBuilder.cursor(cursor);
      }

      // Apply date filters if specified
      if (filter.dateFrom) {
        transactionsBuilder.from(filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        transactionsBuilder.to(filter.dateTo.toISOString());
      }

      const transactionsResponse = await transactionsBuilder.call();
      
      // Decode events from all transactions
      const allEvents: DecodedEvent[] = [];
      
      for (const transaction of transactionsResponse.records) {
        const events = await this.decodeTransactionEvents(transaction.hash);
        
        // Apply filters
        const filteredEvents = events.filter(event => {
          if (filter.contractAddress && event.contractAddress !== filter.contractAddress) {
            return false;
          }
          if (filter.eventType && event.type !== filter.eventType) {
            return false;
          }
          if (filter.sourceAccount && event.sourceAccount !== filter.sourceAccount) {
            return false;
          }
          return true;
        });

        allEvents.push(...filteredEvents);
      }

      return {
        events: allEvents,
        hasMore: transactionsResponse.records.length === limit,
        cursor: transactionsResponse.next_cursor
      };
    } catch (error) {
      console.error('Failed to get account events:', error);
      return {
        events: [],
        hasMore: false
      };
    }
  }

  /**
   * Get events for a specific contract
   */
  async getContractEvents(
    contractAddress: string,
    filter: EventFilter = {},
    limit: number = 50,
    cursor?: string
  ): Promise<EventLogResponse> {
    try {
      // Get all transactions that involve this contract
      const transactionsBuilder = this.server
        .transactions()
        .forAccount(contractAddress)
        .limit(limit)
        .order('desc');

      if (cursor) {
        transactionsBuilder.cursor(cursor);
      }

      const transactionsResponse = await transactionsBuilder.call();
      
      // Decode events from all transactions
      const allEvents: DecodedEvent[] = [];
      
      for (const transaction of transactionsResponse.records) {
        const events = await this.decodeTransactionEvents(transaction.hash);
        
        // Filter events for this specific contract
        const contractEvents = events.filter(event => 
          event.contractAddress === contractAddress
        );

        // Apply additional filters
        const filteredEvents = contractEvents.filter(event => {
          if (filter.eventType && event.type !== filter.eventType) {
            return false;
          }
          if (filter.sourceAccount && event.sourceAccount !== filter.sourceAccount) {
            return false;
          }
          return true;
        });

        allEvents.push(...filteredEvents);
      }

      return {
        events: allEvents,
        hasMore: transactionsResponse.records.length === limit,
        cursor: transactionsResponse.next_cursor
      };
    } catch (error) {
      console.error('Failed to get contract events:', error);
      return {
        events: [],
        hasMore: false
      };
    }
  }

  /**
   * Get all event types available
   */
  getAvailableEventTypes(): string[] {
    return Object.keys(CONTRACT_ABIS);
  }

  /**
   * Get contract addresses for a network
   */
  getContractAddresses(): Record<string, string> {
    return CONTRACT_ADDRESSES[this.network] || {};
  }
}

export const createEventDecoder = (network: 'mainnet' | 'testnet' = 'testnet') => {
  return new EventDecoder(network);
};
