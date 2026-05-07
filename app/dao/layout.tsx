"use client";

import React, { useEffect } from "react";

interface DaoLayoutProps {
  children: React.ReactNode;
}

export default function DaoLayout({ children }: DaoLayoutProps) {
  useEffect(() => {
    // Preload related route chunks on layout mount
    const timer = setTimeout(() => {
      // Preload treasury and other DAO routes
      if (typeof window !== "undefined") {
        // This ensures the layout chunk is ready
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {children}
    </div>
  );
}
