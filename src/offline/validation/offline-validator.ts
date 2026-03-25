import { OfflineTransaction } from '../storage/local-storage.service'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export class OfflineValidator {
  public static validate(transaction: Partial<OfflineTransaction>): ValidationResult {
    if (!transaction.type || !['BUY', 'SELL'].includes(transaction.type)) {
      return { isValid: false, error: 'Invalid transaction type' }
    }

    if (!transaction.amount || transaction.amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' }
    }

    if (!transaction.price || transaction.price <= 0) {
      return { isValid: false, error: 'Price must be greater than 0' }
    }

    if (!transaction.id) {
      return { isValid: false, error: 'Transaction ID is missing' }
    }

    return { isValid: true }
  }

  public static validateQueue(queue: OfflineTransaction[]): OfflineTransaction[] {
    return queue.filter((t) => this.validate(t).isValid)
  }
}
