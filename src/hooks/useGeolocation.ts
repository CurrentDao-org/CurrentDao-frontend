import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, Trader, LocationPrivacy, GeolocationTradingState } from '@/types/location';
import { locationService } from '@/services/location/location-service';
import { proximityService } from '@/services/location/proximity-service';

const UPDATE_INTERVAL = 30000; // 30 seconds as per requirements
const PROXIMITY_RADIUS = 5; // 5km as per requirements

export function useGeolocation() {
  const [state, setState] = useState<GeolocationTradingState>({
    currentLocation: null,
    nearbyTraders: [],
    isTracking: false,
    error: null,
    privacy: {
      hideLocation: false,
      blurRadius: 0,
      shareWithContactsOnly: false,
    },
    lastUpdate: null,
  });

  const watchIdRef = useRef<number>(-1);

  const updateNearbyTraders = useCallback(async (coords: Coordinates) => {
    try {
      const nearby = await proximityService.findNearbyTraders(coords, PROXIMITY_RADIUS);
      setState(prev => ({
        ...prev,
        nearbyTraders: nearby,
        lastUpdate: Date.now(),
      }));
    } catch (err) {
      console.error('Failed to update nearby traders:', err);
    }
  }, []);

  const handleLocationUpdate = useCallback((coords: Coordinates) => {
    const adjustedCoords = locationService.applyPrivacy(coords, state.privacy);
    setState(prev => ({
      ...prev,
      currentLocation: adjustedCoords,
      error: null,
    }));
    updateNearbyTraders(adjustedCoords);
  }, [state.privacy, updateNearbyTraders]);

  const startTracking = useCallback(() => {
    if (watchIdRef.current !== -1) return;

    setState(prev => ({ ...prev, isTracking: true }));

    watchIdRef.current = locationService.watchPosition(
      handleLocationUpdate,
      (err) => {
        setState(prev => ({
          ...prev,
          error: err.message,
          isTracking: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
      }
    );
  }, [handleLocationUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== -1) {
      locationService.clearWatch(watchIdRef.current);
      watchIdRef.current = -1;
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, []);

  const updatePrivacy = useCallback((newPrivacy: Partial<LocationPrivacy>) => {
    setState(prev => ({
      ...prev,
      privacy: { ...prev.privacy, ...newPrivacy },
    }));
  }, []);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // Handle periodic updates if watchPosition doesn't trigger
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.currentLocation) {
        updateNearbyTraders(state.currentLocation);
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [state.currentLocation, updateNearbyTraders]);

  return {
    ...state,
    startTracking,
    stopTracking,
    updatePrivacy,
    refreshLocation: async () => {
      try {
        const coords = await locationService.getCurrentPosition();
        handleLocationUpdate(coords);
      } catch (err: any) {
        setState(prev => ({ ...prev, error: err.message }));
      }
    },
  };
}
