import React from 'react';
import { TrendingUp, TrendingDown, Battery, DollarSign, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnergyPortfolioCardProps {
  title: string;
  value: string;
  change: number;
  icon: 'energy' | 'earnings' | 'trades';
  unit?: string;
  isLoading?: boolean;
}

const icons = {
  energy: <Battery className="h-6 w-6 text-emerald-500" />,
  earnings: <DollarSign className="h-6 w-6 text-blue-500" />,
  trades: <Briefcase className="h-6 w-6 text-amber-500" />,
};

const EnergyPortfolioCard: React.FC<EnergyPortfolioCardProps> = ({
  title,
  value,
  change,
  icon,
  unit,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-8 w-8 bg-muted rounded-full"></div>
        </div>
        <div className="mt-4">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="mt-2 h-4 w-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-accent"
    >
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-full bg-secondary p-2 transition-transform hover:scale-110">
          {icons[icon]}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold tracking-tight text-foreground transition-all">
            {value}
          </span>
          {unit && <span className="text-base text-muted-foreground">{unit}</span>}
        </div>
        <div className="mt-2 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-muted-foreground">vs. last month</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EnergyPortfolioCard;
