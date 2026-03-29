import { Coordinates, LocationPrivacy } from '@/types/location';

const OFFLINE_LOCATION_KEY = 'offline_location';

export const locationService = {
  async getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.saveLocationOffline(coords);
          resolve(coords);
        },
        (error) => {
          const cached = this.getOfflineLocation();
          if (cached) {
            resolve(cached);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
          ...options,
        }
      );
    });
  },

  watchPosition(
    onSuccess: (coords: Coordinates) => void,
    onError?: (error: GeolocationPositionError) => void,
    options?: PositionOptions
  ): number {
    if (!navigator.geolocation) {
      if (onError) onError({ code: 0, message: 'Geolocation not supported' } as any);
      return -1;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        this.saveLocationOffline(coords);
        onSuccess(coords);
      },
      (error) => {
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options,
      }
    );
  },

  clearWatch(watchId: number) {
    if (watchId !== -1) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  saveLocationOffline(coords: Coordinates) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(OFFLINE_LOCATION_KEY, JSON.stringify(coords));
    }
  },

  getOfflineLocation(): Coordinates | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(OFFLINE_LOCATION_KEY);
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  },

  calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(coords2.latitude - coords1.latitude);
    const dLon = this.deg2rad(coords2.longitude - coords1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coords1.latitude)) *
        Math.cos(this.deg2rad(coords2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  },

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  applyPrivacy(coords: Coordinates, privacy: LocationPrivacy): Coordinates {
    if (privacy.hideLocation) {
      return { latitude: 0, longitude: 0 };
    }

    if (privacy.blurRadius > 0) {
      // Add random noise to coordinate based on blur radius
      // ~111,111 meters per degree latitude
      const latNoise = (Math.random() - 0.5) * (privacy.blurRadius / 111111);
      const lonNoise =
        (Math.random() - 0.5) *
        (privacy.blurRadius / (111111 * Math.cos(this.deg2rad(coords.latitude))));
      return {
        ...coords,
        latitude: coords.latitude + latNoise,
        longitude: coords.longitude + lonNoise,
      };
    }

    return coords;
  },
};
