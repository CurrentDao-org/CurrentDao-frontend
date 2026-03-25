'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, RefreshCw, AlertCircle, LayoutDashboard } from 'lucide-react';
import EnergyPortfolioCard from '@/components/dashboard/EnergyPortfolioCard';
import PriceChart from '@/components/dashboard/PriceChart';
import EarningsChart from '@/components/dashboard/EarningsChart';
import TradingActivityCard from '@/components/dashboard/TradingActivityCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { data, isLoading, isConnected, error } = useDashboardData();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode with system preference on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Energy Producer Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="relative flex h-2 w-2">
                <span={`absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400 animate-ping opacity-75' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="rounded-full p-2 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center"
            >
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-destructive">Dashboard Connection Error</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Portfolio Stats Section */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <EnergyPortfolioCard
                  title="Total Energy Produced"
                  value={data.stats.totalEnergy.toLocaleString()}
                  unit="kWh"
                  change={data.stats.totalKwhChange}
                  icon="energy"
                  isLoading={isLoading}
                />
                <EnergyPortfolioCard
                  title="Total Earnings"
                  value={`$${data.stats.earnings.toLocaleString()}`}
                  change={data.stats.earningsChange}
                  icon="earnings"
                  isLoading={isLoading}
                />
                <EnergyPortfolioCard
                  title="Active Energy Trades"
                  value={data.stats.activeTrades.toString()}
                  change={data.stats.activeTradesChange}
                  icon="trades"
                  isLoading={isLoading}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PriceChart data={data.priceHistory} isLoading={isLoading} />
                <EarningsChart data={data.earningsHistory} isLoading={isLoading} />
              </div>

              {/* Activity Section */}
              <div className="w-full">
                <TradingActivityCard activities={data.recentActivity} isLoading={isLoading} />
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 md:py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; 2026 CurrentDao Protocol. Real-time data visualization enabled.
          </p>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground underline underline-offset-4">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
