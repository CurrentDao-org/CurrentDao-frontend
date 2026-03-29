import { useState, useEffect, useCallback } from 'react';
import { UserLocation, Coordinates, GeolocationOptions } from '../types/maps';

interface UseGeolocationReturn {
  location: UserLocation | null;
  error: string | null;
  isLoading: boolean;
  requestLocation: () => Promise<void>;
  watchLocation: (options?: GeolocationOptions) => void;
  stopWatching: () => void;
  permission: 'granted' | 'denied' | 'prompt';
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};

export const useGeolocation = (options: GeolocationOptions = defaultOptions): UseGeolocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [watchId, setWatchId] = useState<number | null>(null);

  const checkPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return 'denied';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const state = result.state as 'granted' | 'denied' | 'prompt';
      setPermission(state);
      
      result.addEventListener('change', () => {
        setPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
      
      return state;
    } catch (err) {
      // Some browsers don't support permissions API
      return 'prompt';
    }
  }, []);

  const parsePosition = (position: GeolocationPosition): UserLocation => {
    return {
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      permission: 'granted',
    };
  };

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    const currentPermission = await checkPermission();
    if (currentPermission === 'denied') {
      setError('Location access denied. Please enable location services in your browser settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: options.enableHighAccuracy,
            timeout: options.timeout,
            maximumAge: options.maximumAge,
          }
        );
      });

      const userLocation = parsePosition(position);
      setLocation(userLocation);
      setPermission('granted');
    } catch (err) {
      const error = err as GeolocationPositionError;
      let errorMessage = 'Unable to retrieve your location';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services in your browser settings.';
          setPermission('denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while retrieving location.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options, checkPermission]);

  const watchLocation = useCallback((watchOptions?: GeolocationOptions) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const opts = watchOptions || options;

    try {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const userLocation = parsePosition(position);
          setLocation(userLocation);
          setPermission('granted');
          setError(null);
        },
        (error) => {
          let errorMessage = 'Unable to track your location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings.';
              setPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }

          setError(errorMessage);
        },
        {
          enableHighAccuracy: opts.enableHighAccuracy,
          timeout: opts.timeout,
          maximumAge: opts.maximumAge,
        }
      );

      setWatchId(id);
    } catch (err) {
      setError('Failed to start location tracking');
    }
  }, [options, watchId]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isLoading,
    requestLocation,
    watchLocation,
    stopWatching,
    permission,
  };
};

export const useLocationPermission = (): {
  permission: 'granted' | 'denied' | 'prompt';
  requestPermission: () => Promise<'granted' | 'denied' | 'prompt'>;
} => {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const requestPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.geolocation) {
      return 'denied';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const state = result.state as 'granted' | 'denied' | 'prompt';
      setPermission(state);
      return state;
    } catch (err) {
      // Fallback: try to get position to check permission
      try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 100 });
        });
        setPermission('granted');
        return 'granted';
      } catch {
        setPermission('denied');
        return 'denied';
      }
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    permission,
    requestPermission,
  };
};

export const useLocationDistance = (origin: Coordinates | null) => {
  const calculateDistanceTo = useCallback((destination: Coordinates): number | null => {
    if (!origin) return null;

    const R = 6371000; // Earth's radius in meters
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c / 1000; // Return distance in km
  }, [origin]);

  const isWithinRadius = useCallback((destination: Coordinates, radiusKm: number): boolean => {
    const distance = calculateDistanceTo(destination);
    return distance !== null && distance <= radiusKm;
  }, [calculateDistanceTo]);

  return {
    calculateDistanceTo,
    isWithinRadius,
  };
};
