import { useState, useEffect, useRef, useCallback } from 'react';
import { ChartConfig, ChartInteractionState, ChartExportOptions, ChartData } from '@/types/charts';
import { calculateChartDimensions, debounce, throttle, exportChart, getResponsiveConfig } from '@/utils/chartHelpers';

interface UseChartProps extends ChartConfig {
  containerRef?: React.RefObject<HTMLElement>;
  onDataPointClick?: (data: any) => void;
  onZoomChange?: (domain: any) => void;
  onPanChange?: (domain: any) => void;
}

/**
 * Hook for managing chart configuration, dimensions, and interaction state.
 * Supports responsive sizing, zoom, pan, and data point interactions.
 */
export const useChart = (props: UseChartProps = {}) => {
  const {
    width: propWidth,
    height: propHeight,
    responsive = true,
    zoomEnabled = false,
    panEnabled = false,
    exportEnabled = false,
    containerRef,
    onDataPointClick,
    onZoomChange,
    onPanChange,
    ...restConfig
  } = props;

  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [interactionState, setInteractionState] = useState<ChartInteractionState>({
    isZoomed: false,
    isPanning: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Handle responsive sizing when container or window size changes
  useEffect(() => {
    if (!responsive) {
      if (propWidth && propHeight) {
        setDimensions({ width: propWidth, height: propHeight });
      }
      return;
    }

    const updateDimensions = debounce(() => {
      if (containerRef?.current || chartRef.current) {
        const container = containerRef?.current || chartRef.current;
        const rect = container.getBoundingClientRect();
        const { width, height } = calculateChartDimensions(rect.width, rect.height);
        setDimensions({ width, height });
      }
    }, 100);

    updateDimensions();

    if (containerRef?.current || chartRef.current) {
      const container = containerRef?.current || chartRef.current;
      resizeObserverRef.current = new ResizeObserver(updateDimensions);
      resizeObserverRef.current.observe(container);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [responsive, propWidth, propHeight, containerRef]);

  // Handle zoom functionality
  const handleZoom = useCallback((domain: any) => {
    if (!zoomEnabled) return;
    
    setInteractionState(prevState => ({
      ...prevState,
      isZoomed: true,
      zoomDomain: domain,
    }));
    
    onZoomChange?.(domain);
  }, [zoomEnabled, onZoomChange]);

  // Handle pan functionality
  const handlePan = useCallback((domain: any) => {
    if (!panEnabled) return;
    
    setInteractionState(prevState => ({
      ...prevState,
      isPanning: true,
      zoomDomain: domain,
    }));
    
    onPanChange?.(domain);
  }, [panEnabled, onPanChange]);

  // Reset zoom/pan
  const resetInteraction = useCallback(() => {
    setInteractionState({
      isZoomed: false,
      isPanning: false,
    });
  }, []);

  // Handle data point clicks
  const handleDataPointClick = useCallback((data: any) => {
    onDataPointClick?.(data);
  }, [onDataPointClick]);

  // Export chart
  const handleExport = useCallback(async (options: ChartExportOptions) => {
    if (!exportEnabled || !chartRef.current) {
      throw new Error('Export not enabled or chart not found');
    }

    setIsLoading(true);
    setError(null);

    try {
      await exportChart(chartRef.current, options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [exportEnabled]);

  // Get responsive configuration
  const responsiveConfig = getResponsiveConfig(dimensions.width);

  return {
    chartRef,
    dimensions,
    interactionState,
    isLoading,
    error,
    config: {
      ...restConfig,
      ...responsiveConfig,
      ...dimensions,
    },
    handlers: {
      onZoom: handleZoom,
      onPan: handlePan,
      onReset: resetInteraction,
      onDataPointClick: handleDataPointClick,
      onExport: handleExport,
    },
  };
};

export const useChartData = <T>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);
  const [filteredData, setFilteredData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = useCallback((newData: T[]) => {
    setData(newData);
    setFilteredData(newData);
  }, []);

  const filterData = useCallback((predicate: (item: T) => boolean) => {
    const filtered = data.filter(predicate);
    setFilteredData(filtered);
  }, [data]);

  const clearFilter = useCallback(() => {
    setFilteredData(data);
  }, [data]);

  const fetchData = useCallback(async (fetcher: () => Promise<T[]>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      updateData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateData]);

  return {
    data,
    filteredData,
    loading,
    error,
    updateData,
    filterData,
    clearFilter,
    fetchData,
  };
};

export const useChartAnimation = (duration: number = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    animationRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      animationRef.current = null;
    }, duration);
  }, [duration]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    startAnimation,
    stopAnimation,
  };
};

export const useChartKeyboardNavigation = () => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent, dataLength: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          if (prev === null) return 0;
          return Math.min(prev + 1, dataLength - 1);
        });
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          if (prev === null) return 0;
          return Math.max(prev - 1, 0);
        });
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(dataLength - 1);
        break;
      case 'Escape':
        event.preventDefault();
        setFocusedIndex(null);
        break;
    }
  }, []);

  const resetFocus = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  return {
    focusedIndex,
    handleKeyDown,
    resetFocus,
  };
};

export const useChartPerformance = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState<number>(Date.now());

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRenderTime(Date.now());
  });

  const getPerformanceMetrics = useCallback(() => {
    return {
      renderCount,
      lastRenderTime,
      timeSinceLastRender: Date.now() - lastRenderTime,
    };
  }, [renderCount, lastRenderTime]);

  return {
    renderCount,
    lastRenderTime,
    getPerformanceMetrics,
  };
};

export const useChartAccessibility = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);

  const announceDataPoint = useCallback((data: any, index: number) => {
    const message = `Data point ${index + 1}: ${data.name || 'Unknown'}, Value: ${data.value || data.y || 0}`;
    announce(message);
  }, [announce]);

  const announceChartType = useCallback((chartType: string) => {
    announce(`Chart type: ${chartType}`);
  }, [announce]);

  return {
    announcements,
    announce,
    announceDataPoint,
    announceChartType,
  };
};
