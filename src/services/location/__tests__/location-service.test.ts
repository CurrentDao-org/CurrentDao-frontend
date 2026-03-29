import { locationService } from '../location-service';
import { LocationPrivacy } from '@/types/location';

describe('locationService', () => {
  const mockCoords = {
    latitude: 34.0522,
    longitude: -118.2437,
    accuracy: 10,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success) => success({
        coords: {
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
          accuracy: mockCoords.accuracy,
        },
        timestamp: mockCoords.timestamp,
      })),
      watchPosition: jest.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: mockCoords.latitude,
            longitude: mockCoords.longitude,
            accuracy: mockCoords.accuracy,
          },
          timestamp: mockCoords.timestamp,
        });
        return 123;
      }),
      clearWatch: jest.fn(),
    };
    (global.navigator as any).geolocation = mockGeolocation;

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    (global as any).localStorage = mockLocalStorage;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gets current position correctly', async () => {
    const coords = await locationService.getCurrentPosition();
    expect(coords.latitude).toBe(mockCoords.latitude);
    expect(coords.longitude).toBe(mockCoords.longitude);
  });

  it('calculates distance correctly using haversine formula', () => {
    const coords1 = { latitude: 34.0522, longitude: -118.2437 }; // LA
    const coords2 = { latitude: 34.0622, longitude: -118.2537 }; // Nearby
    const distance = locationService.calculateDistance(coords1, coords2);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(2); // Should be around 1.4km
  });

  it('applies privacy blur correctly', () => {
    const privacy: LocationPrivacy = {
      hideLocation: false,
      blurRadius: 500, // 500m
      shareWithContactsOnly: false,
    };
    const blurred = locationService.applyPrivacy(mockCoords, privacy);
    expect(blurred.latitude).not.toBe(mockCoords.latitude);
    expect(blurred.longitude).not.toBe(mockCoords.longitude);
    
    const distance = locationService.calculateDistance(mockCoords, blurred);
    expect(distance).toBeLessThan(1); // Should be within a reasonable range of the blur radius
  });

  it('hides location when hideLocation is true', () => {
    const privacy: LocationPrivacy = {
      hideLocation: true,
      blurRadius: 0,
      shareWithContactsOnly: false,
    };
    const blurred = locationService.applyPrivacy(mockCoords, privacy);
    expect(blurred.latitude).toBe(0);
    expect(blurred.longitude).toBe(0);
  });
});
