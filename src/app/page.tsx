'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Shield,
  ArrowRight,
  BarChart3,
  Globe
} from 'lucide-react'
import { EnergyTradingCard } from '@/components/EnergyTradingCard'
import { DAOVotingCard } from '@/components/DAOVotingCard'
import { MobileWallet } from '@/components/mobile/MobileWallet'
import { StatsCard } from '@/components/StatsCard'
import { WalletConnect } from '@/components/WalletConnect'
import { ServiceWorkerRegistration } from '@/offline/components/ServiceWorkerRegistration'
import { OfflineIndicator } from '@/offline/components/OfflineIndicator'
import { MarketForecasting } from '@/components/forecasting/MarketForecasting'

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        totalEnergyTraded: 1250000,
        activeUsers: 2847,
        totalProposals: 156,
        averagePrice: 0.08
      }
    }
  })

  return (
    <div className="space-y-8">
      <ServiceWorkerRegistration />
      <OfflineIndicator />
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Decentralized Energy
          <span className="text-green-600"> Marketplace</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Trade energy tokens, participate in DAO governance, and build a sustainable future 
          powered by Stellar blockchain technology
        </p>
        <div className="flex justify-center gap-4">
          <WalletConnect />
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            Start Trading
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Energy Traded"
          value={`${stats?.totalEnergyTraded.toLocaleString() || '0'} kWh`}
          icon={Zap}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers.toLocaleString() || '0'}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          title="DAO Proposals"
          value={String(stats?.totalProposals || 0)}
          icon={Shield}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatsCard
          title="Avg Price/kWh"
          value={`$${stats?.averagePrice || '0.00'}`}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-100"
        />
      </motion.section>

      {/* Main Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          id="trading"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnergyTradingCard />
        </motion.div>
        
        <motion.div
          id="dao"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DAOVotingCard />
        </motion.div>
      </div>

      {/* Market Forecasting feature */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="py-12"
      >
        <MarketForecasting />
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="py-12 pb-24"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose CurrentDao?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Access</h3>
            <p className="text-gray-600">
              Trade energy anywhere in the world with the Stellar network&apos;s fast, low-cost rails
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
            <p className="text-gray-600">
              Blockchain-powered security with full transaction transparency
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Governed</h3>
            <p className="text-gray-600">
              DAO governance puts control in the hands of the community
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
