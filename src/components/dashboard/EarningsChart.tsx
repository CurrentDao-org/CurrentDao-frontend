'use client';

import React, { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EarningsDataPoint } from '../../types/dashboard';

interface EarningsChartProps {
  data: EarningsDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-xl ring-1 ring-black/5">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Earnings:</span>
          <span className="text-sm font-bold text-blue-500 whitespace-nowrap">
            ${payload[0].value.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const EarningsChart: React.FC<EarningsChartProps> = ({ data, isLoading }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-[350px] w-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-muted rounded"></div>
        <div className="h-full w-full bg-muted/20 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="group h-[400px] w-full rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md md:p-6 lg:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-x">Portfolio Earnings</h3>
        <p className="text-sm text-muted-foreground">Monthly revenue from energy sales (last 6 months)</p>
      </div>
      <div className="h-[280px] w-full lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--muted))"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="amount"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={20}
              transition-all
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;
