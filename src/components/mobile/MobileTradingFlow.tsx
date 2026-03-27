'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import TouchOptimizedButton from './TouchOptimizedButton';

interface MobileTradingFlowProps {
  onComplete?: () => void;
}

const MobileTradingFlow: React.FC<MobileTradingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleProcessTrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handleNext();
    }, 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8 h-full"
          >
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-2xl font-black text-foreground">How much energy?</h2>
              <p className="text-muted-foreground">Select amount of kWh to purchase</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {['50', '100', '250', '500'].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`
                    flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all
                    ${amount === val ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-card'}
                  `}
                >
                  <span className={`text-2xl font-black ${amount === val ? 'text-primary' : 'text-foreground'}`}>
                    {val}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    kWh
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-grow flex items-center justify-center">
               <div className="bg-secondary/30 p-8 rounded-3xl w-full text-center">
                 <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">Estimated Cost</div>
                 <div className="text-4xl font-black text-emerald-500">${(parseInt(amount) * 0.14).toFixed(2)}</div>
               </div>
            </div>

            <div className="safe-area-bottom pb-8">
              <TouchOptimizedButton fullWidth size="xl" onClick={handleNext} suffixIcon={<ArrowRight className="h-5 w-5" />}>
                Review Purchase
              </TouchOptimizedButton>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6 h-full"
          >
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-2xl font-black text-foreground">Confirm Trade</h2>
              <p className="text-muted-foreground">Review your energy purchase details</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-6 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <ShieldCheck className="h-24 w-24" />
               </div>
               
               <div className="flex justify-between items-center border-b border-border pb-4">
                 <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Asset</span>
                 <span className="text-foreground font-black flex items-center gap-2">
                   <div className="p-1 rounded bg-emerald-500/10 text-emerald-500"><TrendingUp className="h-4 w-4" /></div>
                   CLEAN ENERGY (kWh)
                 </span>
               </div>
               <div className="flex justify-between items-center border-b border-border pb-4">
                 <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Quantity</span>
                 <span className="text-foreground font-black">{amount} kWh</span>
               </div>
               <div className="flex justify-between items-center border-b border-border pb-4">
                 <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Unit Price</span>
                 <span className="text-foreground font-black">$0.14/kWh</span>
               </div>
               <div className="flex justify-between items-center pt-2">
                 <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Total cost</span>
                 <span className="text-2xl font-black text-primary">${(parseInt(amount) * 0.14).toFixed(2)}</span>
               </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
               <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
               <p className="text-xs font-medium text-amber-500 leading-relaxed">
                 By confirming this trade, you agree to CurrentDao&apos;s decentralized trading policies. This action is irreversible on the blockchain.
               </p>
            </div>

            <div className="mt-auto safe-area-bottom pb-8 flex flex-col gap-3">
              <TouchOptimizedButton 
                isLoading={isProcessing} 
                fullWidth 
                size="xl" 
                onClick={handleProcessTrade}
                prefixIcon={<Wallet className="h-5 w-5" />}
              >
                Sign & Transact
              </TouchOptimizedButton>
              <button 
                onClick={handleBack}
                className="py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center"
              >
                Modify Order
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-8 h-full text-center py-12"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40"
              >
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <motion.div 
                className="absolute -inset-4 border-2 border-emerald-500/20 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-black text-foreground">Trade Successful!</h2>
              <p className="text-muted-foreground px-8 leading-relaxed">
                Your order for {amount} kWh has been executed and recorded on the protocol.
              </p>
            </div>

            <div className="w-full mt-10 p-6 bg-secondary/20 rounded-3xl border border-border">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <span>Network Confirmation</span>
                <span className="text-emerald-500">Verified</span>
              </div>
              <div className="text-left font-mono text-[10px] break-all opacity-50 bg-black/5 dark:bg-white/5 p-4 rounded-xl leading-relaxed">
                TxID: 0x721fb...d8a2bc41<br/>
                Block: 42,912,841<br/>
                Gas: 15 Gwei
              </div>
            </div>

            <div className="mt-auto safe-area-bottom pb-8 w-full">
              <TouchOptimizedButton fullWidth size="xl" variant="outline" onClick={() => (onComplete ? onComplete() : setStep(1))}>
                Back to Dashboard
              </TouchOptimizedButton>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full">
      <AnimatePresence mode="wait">
        <div key={step}>{renderStep()}</div>
      </AnimatePresence>
    </div>
  );
};

export default MobileTradingFlow;
