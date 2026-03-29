import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapState, 
  MapViewport, 
  MapMarker, 
  EnergyListing, 
  LocationFilter, 
  UserLocation,
  Coordinates,
  MapCluster,
  RegionalMarketData,
  HeatMapPoint
} from '../types/maps';
import { 
  calculateDistance, 
  filterByLocation, 
  clusterMarkers, 
  generateHeatMapData,
  optimizeMapPerformance,
  debounce,
  throttle
} from '../utils/mapHelpers';

interface UseMapIntegrationProps {
  initialViewport?: Partial<MapViewport>;
  listings?: EnergyListing[];
  regionalData?: RegionalMarketData[];
  enableClustering?: boolean;
  enableHeatMap?: boolean;
  maxMarkers?: number;
}

interface UseMapIntegrationReturn {
  mapState: MapState;
  updateViewport: (viewport: Partial<MapViewport>) => void;
  addFilter: (filter: LocationFilter) => void;
  removeFilter: (filterId: string) => void;
  updateFilters: (filters: LocationFilter[]) => void;
  selectMarker: (marker: MapMarker | null) => void;
  setUserLocation: (location: UserLocation | null) => void;
  refreshMarkers: () => void;
  getVisibleMarkers: () => MapMarker[];
  getFilteredMarkers: () => MapMarker[];
  clearSelection: () => void;
  resetViewport: () => void;
}

const defaultViewport: MapViewport = {
  center: { lat: 39.8283, lng: -98.5795 }, // Center of US
  zoom: 4,
};

export const useMapIntegration = ({
  initialViewport = {},
  listings = [],
  regionalData = [],
  enableClustering = true,
  enableHeatMap = false,
  maxMarkers = 1000,
}: UseMapIntegrationProps = {}): UseMapIntegrationReturn => {
  const [mapState, setMapState] = useState<MapState>({
    viewport: { ...defaultViewport, ...initialViewport },
    markers: [],
    clusters: [],
    filters: [],
    userLocation: null,
    selectedMarker: null,
    isLoading: false,
    error: null,
  });

  // Create markers from listings
  const createMarkers = useCallback((listings: EnergyListing[], userLocation: UserLocation | null): MapMarker[] => {
    const markers: MapMarker[] = listings.map((listing, index) => {
      const distance = userLocation 
        ? calculateDistance(userLocation.coordinates, listing.coordinates)
        : undefined;

      return {
        id: listing.id,
        position: listing.coordinates,
        type: 'listing',
        data: {
          ...listing,
          distance,
          deliveryCost: distance ? distance * 0.15 : undefined, // $0.15 per km
        },
        visible: true,
      };
    });

    // Add user location marker if available
    if (userLocation) {
      markers.push({
        id: 'user-location',
        position: userLocation.coordinates,
        type: 'user',
        data: userLocation,
        visible: true,
      });
    }

    // Add regional data markers
    regionalData.forEach((region) => {
      markers.push({
        id: `region-${region.region}`,
        position: region.coordinates,
        type: 'region',
        data: region,
        visible: true,
      });
    });

    return optimizeMapPerformance(markers, maxMarkers);
  }, [regionalData, maxMarkers]);

  // Apply filters to markers
  const applyFilters = useCallback((markers: MapMarker[], filters: LocationFilter[]): MapMarker[] => {
    if (filters.length === 0) return markers;

    let filteredMarkers = [...markers];

    filters.forEach((filter) => {
      if (filter.type === 'radius' && filter.center && filter.radius) {
        filteredMarkers = filteredMarkers.filter((marker) => {
          if (marker.type === 'user') return true; // Always show user location
          const distance = calculateDistance(marker.position, filter.center!);
          return distance <= filter.radius!;
        });
      } else if (filter.type === 'region' && filter.region) {
        // Apply region filter logic here
        filteredMarkers = filteredMarkers.filter((marker) => {
          if (marker.type === 'region') {
            return (marker.data as RegionalMarketData).region === filter.region;
          }
          return true; // For now, don't filter listings by region
        });
      }
    });

    return filteredMarkers;
  }, []);

  // Cluster markers if enabled
  const clusterMarkersIfNeeded = useCallback((markers: MapMarker[], zoom: number): MapMarker[] => {
    if (!enableClustering || zoom > 10) return markers;

    const clusters = clusterMarkers(markers, zoom);
    return clusters.map((cluster) => ({
      id: cluster.id,
      position: cluster.center,
      type: 'listing' as const,
      data: cluster,
      visible: true,
    }));
  }, [enableClustering]);

  // Update map state when dependencies change
  useEffect(() => {
    const markers = createMarkers(listings, mapState.userLocation);
    const filteredMarkers = applyFilters(markers, mapState.filters);
    const finalMarkers = clusterMarkersIfNeeded(filteredMarkers, mapState.viewport.zoom);

    setMapState((prev) => ({
      ...prev,
      markers: finalMarkers,
      clusters: enableClustering ? clusterMarkers(filteredMarkers, mapState.viewport.zoom) : [],
    }));
  }, [
    listings,
    mapState.userLocation,
    mapState.filters,
    mapState.viewport.zoom,
    createMarkers,
    applyFilters,
    clusterMarkersIfNeeded,
    enableClustering,
  ]);

  // Debounced viewport update
  const debouncedViewportUpdate = useMemo(
    () => debounce((viewport: Partial<MapViewport>) => {
      setMapState((prev) => ({
        ...prev,
        viewport: { ...prev.viewport, ...viewport },
      }));
    }, 300),
    []
  );

  // Throttled marker refresh
  const throttledRefresh = useMemo(
    () => throttle(() => {
      setMapState((prev) => ({ ...prev, isLoading: true }));
      
      setTimeout(() => {
        const markers = createMarkers(listings, mapState.userLocation);
        const filteredMarkers = applyFilters(markers, mapState.filters);
        const finalMarkers = clusterMarkersIfNeeded(filteredMarkers, mapState.viewport.zoom);

        setMapState((prev) => ({
          ...prev,
          markers: finalMarkers,
          clusters: enableClustering ? clusterMarkers(filteredMarkers, prev.viewport.zoom) : [],
          isLoading: false,
        }));
      }, 100);
    }, 1000),
    [listings, mapState.userLocation, mapState.filters, mapState.viewport.zoom, createMarkers, applyFilters, clusterMarkersIfNeeded, enableClustering]
  );

  const updateViewport = useCallback((viewport: Partial<MapViewport>) => {
    debouncedViewportUpdate(viewport);
  }, [debouncedViewportUpdate]);

  const addFilter = useCallback((filter: LocationFilter) => {
    setMapState((prev) => ({
      ...prev,
      filters: [...prev.filters, filter],
    }));
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setMapState((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, index) => index.toString() !== filterId),
    }));
  }, []);

  const updateFilters = useCallback((filters: LocationFilter[]) => {
    setMapState((prev) => ({ ...prev, filters }));
  }, []);

  const selectMarker = useCallback((marker: MapMarker | null) => {
    setMapState((prev) => ({ ...prev, selectedMarker: marker }));
  }, []);

  const setUserLocation = useCallback((location: UserLocation | null) => {
    setMapState((prev) => ({ 
      ...prev, 
      userLocation: location,
      viewport: location ? { 
        ...prev.viewport, 
        center: location.coordinates,
        zoom: Math.max(prev.viewport.zoom, 10)
      } : prev.viewport
    }));
  }, []);

  const refreshMarkers = useCallback(() => {
    throttledRefresh();
  }, [throttledRefresh]);

  const getVisibleMarkers = useCallback(() => {
    return mapState.markers.filter((marker) => marker.visible);
  }, [mapState.markers]);

  const getFilteredMarkers = useCallback(() => {
    return applyFilters(mapState.markers, mapState.filters);
  }, [mapState.markers, mapState.filters, applyFilters]);

  const clearSelection = useCallback(() => {
    setMapState((prev) => ({ ...prev, selectedMarker: null }));
  }, []);

  const resetViewport = useCallback(() => {
    setMapState((prev) => ({
      ...prev,
      viewport: { ...defaultViewport, ...initialViewport },
    }));
  }, [initialViewport]);

  // Generate heat map data if enabled
  const heatMapData = useMemo(() => {
    if (!enableHeatMap || !mapState.viewport.bounds) return [];
    
    return generateHeatMapData(listings, mapState.viewport.bounds);
  }, [enableHeatMap, listings, mapState.viewport.bounds]);

  return {
    mapState,
    updateViewport,
    addFilter,
    removeFilter,
    updateFilters,
    selectMarker,
    setUserLocation,
    refreshMarkers,
    getVisibleMarkers,
    getFilteredMarkers,
    clearSelection,
    resetViewport,
    heatMapData,
  };
};

export const useMapPerformance = (markerCount: number, maxMarkers: number = 1000) => {
  const [performance, setPerformance] = useState({
    isOptimized: false,
    renderedMarkers: markerCount,
    droppedMarkers: 0,
  });

  useEffect(() => {
    const isOptimized = markerCount > maxMarkers;
    const renderedMarkers = isOptimized ? maxMarkers : markerCount;
    const droppedMarkers = isOptimized ? markerCount - maxMarkers : 0;

    setPerformance({
      isOptimized,
      renderedMarkers,
      droppedMarkers,
    });
  }, [markerCount, maxMarkers]);

  return performance;
};

export const useMapBounds = (viewport: MapViewport) => {
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  useEffect(() => {
    if (!viewport.center || !viewport.zoom) return;

    // Calculate bounds based on viewport center and zoom
    const latOffset = 180 / Math.pow(2, viewport.zoom);
    const lngOffset = 360 / Math.pow(2, viewport.zoom) / Math.cos(viewport.center.lat * Math.PI / 180);

    setBounds({
      north: viewport.center.lat + latOffset,
      south: viewport.center.lat - latOffset,
      east: viewport.center.lng + lngOffset,
      west: viewport.center.lng - lngOffset,
    });
  }, [viewport]);

  return bounds;
};
