'use client'

import { useState } from 'react'
import { Zap, TrendingUp, Clock, WifiOff } from 'lucide-react'
import { useOfflineMode } from '../offline/hooks/useOfflineMode'
import { toast } from 'react-hot-toast'

export function EnergyTradingCard() {
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const { isOnline, addTrade } = useOfflineMode()

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    if (!amount || !price) {
      toast.error('Please enter amount and price')
      return
    }

    try {
      await addTrade({
        type,
        amount: parseFloat(amount),
        price: parseFloat(price)
      })

      if (isOnline) {
        toast.success(`${type === 'BUY' ? 'Buy' : 'Sell'} order submitted successfully`)
      } else {
        toast.success(`${type === 'BUY' ? 'Buy' : 'Sell'} order queued (Offline Mode)`, {
          icon: '🔄',
          duration: 4000
        })
      }
      
      setAmount('')
      setPrice('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place trade')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Energy Trading</h3>
          <p className="text-sm text-gray-600">Buy and sell energy tokens</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (kWh)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter energy amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price ($/kWh)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price per kWh"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Value:</span>
            <span className="text-lg font-semibold text-gray-900">
              ${amount && price ? (parseFloat(amount) * parseFloat(price)).toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>Market price: $0.08/kWh</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => handleTrade('BUY')}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Buy Energy
          </button>
          <button 
            onClick={() => handleTrade('SELL')}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Sell Energy
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last trade: 2 minutes ago</span>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1 text-orange-600 font-medium">
              <WifiOff className="w-4 h-4" />
              <span>Offline Mode</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
