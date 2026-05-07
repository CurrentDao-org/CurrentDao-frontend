/**
 * Dynamic Route Loader Utility
 * Handles route-level code splitting, lazy loading, and prefetching
 */

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

export interface DynamicRouteOptions {
  ssr?: boolean;
  loading?: React.ComponentType<any>;
  delay?: number;
  preload?: boolean;
  prefetchOnHover?: boolean;
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  preloadAtStartup?: boolean;
  meta?: {
    chunkName?: string;
    chunkSize?: number;
  };
}

// Cache for preloaded chunks
const preloadCache = new Map<string, Promise<any>>();

/**
 * Preload a dynamic component chunk
 */
export const preloadDynamicComponent = async (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  key: string,
) => {
  if (!preloadCache.has(key)) {
    preloadCache.set(key, importFunc());
  }
  return preloadCache.get(key);
};

/**
 * Create a dynamically imported component with built-in loading and error handling
 */
export const createDynamicRoute = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  options: DynamicRouteOptions = {},
) => {
  const {
    ssr = true,
    loading = DefaultLoadingSkeleton,
    delay = 200,
    preload = false,
    prefetchOnHover = true,
  } = options;

  const DynamicComponent = dynamic(importFunc, {
    loading,
    ssr,
  });

  // Preload on component mount if requested
  if (preload) {
    const PreloadWrapper = (props: any) => {
      useEffect(() => {
        preloadDynamicComponent(importFunc, importFunc.toString());
      }, []);
      return <DynamicComponent {...props} />;
    };

    PreloadWrapper.displayName = "PreloadedDynamicRoute";
    return PreloadWrapper;
  }

  if (prefetchOnHover) {
    const PrefetchWrapper = (props: any) => {
      const ref = useRef<HTMLDivElement>(null);
      const [isHovered, setIsHovered] = useState(false);

      useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseEnter = () => {
          if (!isHovered) {
            setIsHovered(true);
            preloadDynamicComponent(importFunc, importFunc.toString());
          }
        };

        element.addEventListener("mouseenter", handleMouseEnter);
        return () =>
          element.removeEventListener("mouseenter", handleMouseEnter);
      }, [isHovered]);

      return (
        <div ref={ref}>
          <DynamicComponent {...props} />
        </div>
      );
    };

    PrefetchWrapper.displayName = "PrefetchDynamicRoute";
    return PrefetchWrapper;
  }

  return DynamicComponent;
};

/**
 * Default loading skeleton component
 */
export const DefaultLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="animate-pulse space-y-4 mb-8">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Prefetch a route on link hover
 */
export const usePrefetchRoute = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  { prefetchOnHover = true } = {},
) => {
  useEffect(() => {
    if (prefetchOnHover && typeof window !== "undefined") {
      // Prefetch immediately in non-production environments
      const timer = setTimeout(() => {
        preloadDynamicComponent(importFunc, importFunc.toString());
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [importFunc, prefetchOnHover]);

  return {
    preload: () => preloadDynamicComponent(importFunc, importFunc.toString()),
  };
};

/**
 * Route configuration for centralized management
 */
export const createRouteConfig = (
  routes: RouteConfig[],
): Map<string, RouteConfig> => {
  const configMap = new Map();

  routes.forEach((route) => {
    configMap.set(route.path, route);
  });

  // Preload routes marked for startup preloading
  routes.forEach((route) => {
    if (route.preloadAtStartup && typeof window !== "undefined") {
      setTimeout(() => {
        preloadDynamicComponent(route.component as any, route.path);
      }, 0);
    }
  });

  return configMap;
};

/**
 * Get preload status for debugging
 */
export const getPreloadStatus = () => {
  return {
    preloadedChunks: preloadCache.size,
    chunksInfo: Array.from(preloadCache.entries()).map(([key]) => ({ key })),
  };
};

export default createDynamicRoute;
