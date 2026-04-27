import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { performanceMonitor } from '../utils/performance/monitoring';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CurrentDAO - Portfolio Analytics',
  description: 'Advanced portfolio analytics and performance tracking',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Initialize performance monitoring
    performanceMonitor.onMetric((entry) => {
      // Send critical metrics to analytics
      if (['CLS', 'LCP', 'FID'].includes(entry.name) && entry.rating !== 'good') {
        performanceMonitor.sendToAnalytics();
      }
    });

    // Cleanup on unmount
    return () => {
      performanceMonitor.destroy();
    };
  }, []);

  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
