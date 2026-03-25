import React from 'react';
import { ShoppingCart, MoveDownLeft, MoveUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { TradingActivity } from '../../types/dashboard';

interface TradingActivityCardProps {
  activities: TradingActivity[];
  isLoading?: boolean;
}

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
};

const typeIcons = {
  buy: (
    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30">
      <MoveDownLeft className="h-4 w-4" />
    </div>
  ),
  sell: (
    <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30">
      <MoveUpRight className="h-4 w-4" />
    </div>
  ),
};

const TradingActivityCard: React.FC<TradingActivityCardProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
        <div className="mb-4 h-6 w-40 bg-muted rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex h-12 w-full items-center gap-4 bg-muted/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-row items-center justify-between border-b border-border p-6 pb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Recent Activity</h3>
        </div>
        <button className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary">
          View All
        </button>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Transaction</th>
                <th className="px-6 py-3">Amount</th>
                <th className="hidden px-6 py-3 sm:table-cell">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="hidden px-6 py-3 lg:table-cell text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activities.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-secondary/20"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {typeIcons[item.type]}
                      <div>
                        <div className="font-bold text-foreground">
                          {item.type === 'buy' ? 'Purchased Energy' : 'Sold Energy'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: #{item.id.padStart(4, '0')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {item.amount.toLocaleString()} kWh
                  </td>
                  <td className="hidden px-6 py-4 text-muted-foreground sm:table-cell">
                    ${item.price.toFixed(4)}/kWh
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium transition-all group-hover:scale-105">
                      {statusIcons[item.status]}
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell text-right text-muted-foreground">
                    {format(new Date(item.timestamp), 'MMM d, HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingActivityCard;
