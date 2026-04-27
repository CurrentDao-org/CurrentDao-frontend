'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  delay?: number;
  errorBoundary?: ComponentType<{ error: Error; retry: () => void }>;
  preload?: boolean;
  rootMargin?: string;
  threshold?: number;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      />
    </div>
  );
};

const DefaultFallback: React.FC<{ delay?: number }> = ({ delay = 200 }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );
};

const DefaultErrorBoundary: ComponentType<{ error: Error; retry: () => void }> = ({
  error,
  retry
}) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
    <div className="text-red-500 mb-4">
      <svg
        className="w-12 h-12 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

const LazyComponentWrapper: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <DefaultFallback />,
  delay = 200,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary,
  preload = false,
  rootMargin = '50px',
  threshold = 0.1,
  ...props
}) => {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [shouldLoad, setShouldLoad] = React.useState(preload);
  const elementRef = React.useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (preload || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [preload, threshold, rootMargin, shouldLoad]);

  // Load component when needed
  React.useEffect(() => {
    if (!shouldLoad || Component || isLoading) return;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        const module = await loader();
        setComponent(() => module.default);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [shouldLoad, Component, isLoading, loader]);

  // Preload function
  const preloadComponent = React.useCallback(() => {
    if (!Component && !isLoading) {
      setShouldLoad(true);
    }
  }, [Component, isLoading]);

  // Retry function
  const retry = React.useCallback(() => {
    setError(null);
    setComponent(null);
    setIsLoading(false);
    setShouldLoad(true);
  }, []);

  // Expose preload function to window for manual preloading
  React.useEffect(() => {
    if (typeof window !== 'undefined' && preload) {
      (window as any).__preloadComponent = preloadComponent;
    }
  }, [preload, preloadComponent]);

  if (error && ErrorBoundary) {
    return <ErrorBoundary error={error} retry={retry} />;
  }

  if (!shouldLoad) {
    return <div ref={elementRef} {...props} />;
  }

  if (!Component) {
    return (
      <div ref={elementRef} {...props}>
        {fallback}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <Suspense fallback={fallback}>
        <Component />
      </Suspense>
    </motion.div>
  );
};

// Higher-order component for creating lazy components
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: Partial<LazyComponentProps>
) => {
  return (props: any) => (
    <LazyComponentWrapper
      loader={importFunc}
      {...options}
      {...props}
    />
  );
};

// Predefined lazy components for common routes
export const LazyDashboard = createLazyComponent(
  () => import('@/components/dashboard/Dashboard'),
  { fallback: <DefaultFallback delay={100} /> }
);

export const LazyAnalytics = createLazyComponent(
  () => import('@/components/analytics/Analytics'),
  { fallback: <DefaultFallback delay={150} /> }
);

export const LazyPortfolio = createLazyComponent(
  () => import('@/components/portfolio/Portfolio'),
  { fallback: <DefaultFallback delay={200} /> }
);

export const LazySettings = createLazyComponent(
  () => import('@/components/settings/Settings'),
  { fallback: <DefaultFallback delay={100} /> }
);

// Hook for manual preloading
export const usePreloadComponent = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  const [isPreloaded, setIsPreloaded] = React.useState(false);

  const preload = React.useCallback(async () => {
    if (!isPreloaded) {
      try {
        await importFunc();
        setIsPreloaded(true);
      } catch (error) {
        console.error('Failed to preload component:', error);
      }
    }
  }, [importFunc, isPreloaded]);

  return { preload, isPreloaded };
};

export default LazyComponentWrapper;
