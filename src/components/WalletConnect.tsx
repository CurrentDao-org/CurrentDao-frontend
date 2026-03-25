'use client'

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Mock wallet connection - replace with actual Stellar wallet integration
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Wallet connected successfully!')
    } catch {
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </>
      )}
    </button>
  )
}
