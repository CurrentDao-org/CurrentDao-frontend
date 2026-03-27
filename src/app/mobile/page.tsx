'use client';

import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Settings, Terminal, WifiOff, Bell, User, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';
import SwipeNavigation from '@/components/mobile/SwipeNavigation';
import MobileTradingFlow from '@/components/mobile/MobileTradingFlow';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import TouchOptimizedButton from '@/components/mobile/TouchOptimizedButton';
import { motion } from 'framer-motion';

export default function MobilePage() {
  const { isOnline, lastOnlineAt } = useOfflineSupport();
  const [activeViewIndex, setActiveViewIndex] = useState(0);

  const navigationItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { label: 'Trade', icon: <ShoppingCart className="h-6 w-6" /> },
    { label: 'Account', icon: <User className="h-6 w-6" /> },
    { label: 'Settings', icon: <Settings className="h-6 w-6" /> },
  ];

  const handleTradeComplete = () => {
    setActiveViewIndex(0); // Go back to dashboard on complete
  };

  return (
    <div className="relative h-screen bg-background">
      {!isOnline && (
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="absolute top-0 z-50 w-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-2 h-8"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-3 w-3" />
            Offline Mode • Last Sync: {lastOnlineAt ? new Date(lastOnlineAt).toLocaleTimeString() : 'Never'}
          </div>
        </motion.div>
      )}

      <SwipeNavigation 
        initialIndex={activeViewIndex} 
        onIndexChange={setActiveViewIndex}
        navigationItems={navigationItems}
      >
        {/* Dashboard View */}
        <div className="flex flex-col gap-8">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Welcome back,</span>
                 <span className="text-2xl font-black text-foreground underline decoration-emerald-500 decoration-4 underline-offset-4">Jerry Idoko</span>
              </div>
              <div className="h-14 w-14 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Bell className="h-6 w-6 text-primary" />
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <div className="bg-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                 <div className="absolute -right-8 -top-8 bg-white/10 h-32 w-32 rounded-full blur-2xl" />
                 <span className="text-xs font-bold uppercase tracking-widest opacity-80">Current Balance</span>
                 <div className="text-4xl font-black mt-2 leading-none">$1,245.80</div>
                 <div className="flex mt-6 gap-2">
                    <div className="px-3 py-1 rounded-full bg-black/10 text-[10px] font-bold">+12.5% this week</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-card border border-border p-6 rounded-3xl">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-tight mb-2">Energy (kWh)</div>
                    <div className="text-2xl font-black text-foreground">842.1</div>
                 </div>
                 <div className="bg-card border border-border p-6 rounded-3xl">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-tight mb-2">Trades</div>
                    <div className="text-2xl font-black text-foreground">12</div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                 <TouchOptimizedButton 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    onClick={() => setActiveViewIndex(1)}
                    prefixIcon={<ShoppingCart className="h-5 w-5" />}
                 >
                    Start New Trade
                 </TouchOptimizedButton>
                 <TouchOptimizedButton variant="outline" fullWidth size="lg" prefixIcon={<Terminal className="h-5 w-5" />}>
                    View History
                 </TouchOptimizedButton>
              </div>
           </div>
        </div>

        {/* Trade View */}
        <MobileTradingFlow onComplete={handleTradeComplete} />

        {/* Account View */}
        <div className="flex flex-col gap-8 h-full">
           <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-28 w-28 rounded-full border-4 border-primary/20 bg-secondary/30 p-1">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jerry" className="rounded-full shadow-lg" alt="Avatar"/>
              </div>
              <div className="text-center">
                 <h2 className="text-2xl font-black text-foreground">Jerry Idoko</h2>
                 <p className="text-sm font-medium text-muted-foreground underline decoration-1">jerry@currentdao.org</p>
              </div>
           </div>

           <div className="bg-card rounded-3xl border border-border overflow-hidden">
              {[
                { label: 'Security & Privacy', icon: <ShieldCheck className="h-5 w-5 text-emerald-500" /> },
                { label: 'Payment Methods', icon: <Wallet className="h-5 w-5 text-blue-500" /> },
                { label: 'Connected Meters', icon: <LayoutDashboard className="h-5 w-5 text-amber-500" /> },
              ].map((item, i, arr) => (
                <button 
                  key={i} 
                  className={`flex items-center gap-4 w-full p-6 text-left active:bg-secondary/50 transition-colors ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="p-3 bg-secondary/30 rounded-2xl">{item.icon}</div>
                  <span className="font-bold text-foreground flex-grow">{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50" />
                </button>
              ))}
           </div>

           <TouchOptimizedButton variant="danger" fullWidth size="lg">Log Out</TouchOptimizedButton>
        </div>

        {/* Settings View */}
        <div className="flex flex-col gap-8">
           <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">PWA Settings</h3>
              <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <div className="font-bold text-foreground">Offline Storage</div>
                       <div className="text-xs text-muted-foreground">Cache persistent blockchain data</div>
                    </div>
                    <div className="h-8 w-14 bg-emerald-500 rounded-full flex items-center px-1">
                       <div className="h-6 w-6 bg-white rounded-full ml-auto" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div>
                       <div className="font-bold text-foreground">Push Notifications</div>
                       <div className="text-xs text-muted-foreground">Alerts for trade execution</div>
                    </div>
                    <div className="h-8 w-14 bg-muted rounded-full flex items-center px-1">
                       <div className="h-6 w-6 bg-white rounded-full" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Device Info</h3>
              <div className="flex items-center gap-4 bg-secondary/20 p-6 rounded-3xl">
                 <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-border">
                    <LayoutDashboard className="h-5 w-5 opacity-50" />
                 </div>
                 <div className="flex flex-col text-xs font-mono opacity-60">
                    <span>Browser: Chrome 124.0.0</span>
                    <span>Platform: iOS 17.4</span>
                    <span>PWA Status: Installable</span>
                 </div>
              </div>
           </div>
        </div>
      </SwipeNavigation>
    </div>
  );
}

