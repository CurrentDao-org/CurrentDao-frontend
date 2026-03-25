'use client';

import React, { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { PriceDataPoint } from '../../types/dashboard';

interface PriceChartProps {
  data: PriceDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-xl ring-1 ring-black/5">
        <p className="text-sm font-semibold text-foreground">
          {format(new Date(label), 'MMM d, HH:mm:ss')}
        </p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Energy Price:</span>
          <span className="text-sm font-bold text-emerald-500 whitespace-nowrap">
            ${payload[0].value.toFixed(4)} / kWh
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, isLoading }) => {
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-x">Real-time Energy Price</h3>
          <p className="text-sm text-muted-foreground">Price fluctuation across the network (last 24 hours)</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-3 py-1 text-sm font-medium animate-pulse">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
        </div>
      </div>
      <div className="h-[280px] w-full lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--muted))"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="timestamp"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(time) => format(new Date(time), 'HH:mm')}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              domain={['auto', 'auto']}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPrice)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
