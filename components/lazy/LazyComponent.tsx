import React, { Suspense, lazy } from 'react';

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  delay?: number;
  preload?: boolean;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const DefaultErrorBoundary: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-600 mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load component</h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>
);

export const LazyComponent: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <DefaultFallback />,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary,
  delay = 200,
  preload = false,
}) => {
  const LazyComponent = lazy(loader);
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [showFallback, setShowFallback] = React.useState(delay > 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShowFallback(false), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  React.useEffect(() => {
    if (preload) {
      loader().catch(() => {
        // Preload failed, but we don't want to show error until actual render
      });
    }
  }, [loader, preload]);

  const retry = () => {
    setHasError(false);
    setError(null);
    setShowFallback(true);
  };

  const handleError = (error: Error) => {
    setHasError(true);
    setError(error);
  };

  if (hasError && error) {
    return <ErrorBoundary error={error} retry={retry} />;
  }

  return (
    <Suspense 
      fallback={showFallback ? fallback : <div />}
      onError={handleError}
    >
      <LazyComponent />
    </Suspense>
  );
};

// Higher-order component for easier usage
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options?: Omit<LazyComponentProps, 'loader'>
) => {
  const LazyWrappedComponent = (props: P) => (
    <LazyComponent 
      loader={importFunc} 
      {...options}
    >
      <React.ComponentType<P> {...props} />
    </LazyComponent>
  );
  
  LazyWrappedComponent.displayName = `withLazyLoading(${importFunc.name || 'Component'})`;
  return LazyWrappedComponent;
};

// Preloading utilities
export const preloadComponent = (loader: () => Promise<{ default: React.ComponentType<any> }>) => {
  loader().catch(() => {
    // Silent fail for preload
  });
};

// Common lazy loaded components
export const LazyPortfolioMetrics = lazy(() => 
  import('../portfolio/PerformanceMetrics').then(module => ({ default: module.PerformanceMetrics }))
);

export const LazyTradingHistory = lazy(() => 
  import('../portfolio/TradingHistory').then(module => ({ default: module.TradingHistory }))
);

export const LazyAssetAllocation = lazy(() => 
  import('../portfolio/AssetAllocation').then(module => ({ default: module.AssetAllocation }))
);

export default LazyComponent;
