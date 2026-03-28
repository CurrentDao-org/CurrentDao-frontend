'use client'

import React, { ComponentType, ReactNode, useState, useEffect, useCallback } from 'react'
import dynamic, { DynamicOptions } from 'next/dynamic'
import { Loader2 } from 'lucide-react'

interface LazyComponentProps {
  /** Dynamic import loader function */
  loader: () => Promise<{ default: ComponentType<any> }>
  /** Fallback shown while loading (default: centered spinner) */
  fallback?: ReactNode
  /** Fallback shown if import fails */
  errorFallback?: ReactNode
  /** Props to pass to the loaded component */
  props?: Record<string, unknown>
  /** Whether to render on server (default: false) */
  ssr?: boolean
  /** Whether to prefetch on hover/focus (default: false) */
  prefetch?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Minimal Error Boundary for LazyComponent
 */
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponent Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Failed to load component. Please refresh the page.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Default loading spinner
 */
const DefaultFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
)

/**
 * LazyComponent
 * 
 * A generic wrapper for dynamically imported components with loading boundaries.
 * Features:
 * - Dynamic import with next/dynamic
 * - Error boundary for failed imports
 * - Prefetch on hover/focus support
 * - Configurable SSR
 * - Custom loading and error fallbacks
 * 
 * @example
 * <LazyComponent
 *   loader={() => import('@/components/heavy/Chart')}
 *   fallback={<ChartSkeleton />}
 *   prefetch
 *   props={{ data }}
 * />
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <DefaultFallback />,
  errorFallback,
  props = {},
  ssr = false,
  prefetch = false,
}) => {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(!prefetch)
  const [hasError, setHasError] = useState(false)

  // Load the component
  const loadComponent = useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      const module = await loader()
      setComponent(() => module.default)
    } catch (error) {
      console.error('Failed to load lazy component:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [loader])

  // Initial load (if not using prefetch-only mode)
  useEffect(() => {
    if (!prefetch) {
      loadComponent()
    }
  }, [loadComponent, prefetch])

  // Prefetch handlers
  const handlePrefetch = useCallback(() => {
    if (prefetch && !Component && !isLoading && !hasError) {
      loadComponent()
    }
  }, [prefetch, Component, isLoading, hasError, loadComponent])

  if (isLoading) {
    return <>{fallback}</>
  }

  if (hasError && errorFallback) {
    return <>{errorFallback}</>
  }

  if (!Component) {
    // Return placeholder with prefetch handlers
    return (
      <div
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
        className="w-full"
      >
        {fallback}
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
}

interface LazyImportOptions {
  /** Whether to render on server (default: false) */
  ssr?: boolean
  /** Whether to prefetch on hover/focus (default: false) */
  prefetch?: boolean
  /** Custom loading fallback */
  fallback?: ReactNode
  /** Custom error fallback */
  errorFallback?: ReactNode
}

/**
 * Helper function to create a pre-configured LazyComponent
 * 
 * @param loader - Dynamic import loader function
 * @param options - Configuration options
 * @returns A LazyComponent pre-configured with the provided options
 * 
 * @example
 * const LazyChart = lazyImport(
 *   () => import('@/components/charts/ChartComparison'),
 *   { fallback: <ChartSkeleton />, prefetch: true }
 * )
 * 
 * // Use as:
 * <LazyChart comparisons={data} />
 */
export function lazyImport<T extends Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  options: LazyImportOptions = {}
): ComponentType<T> {
  return (props: T) => (
    <LazyComponent
      loader={loader}
      ssr={options.ssr}
      prefetch={options.prefetch}
      fallback={options.fallback}
      errorFallback={options.errorFallback}
      props={props}
    />
  )
}

export default LazyComponent
