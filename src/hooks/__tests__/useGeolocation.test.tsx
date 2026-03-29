import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';
import { locationService } from '@/services/location/location-service';
import { proximityService } from '@/services/location/proximity-service';

// Mock services
jest.mock('@/services/location/location-service');
jest.mock('@/services/location/proximity-service');

describe('useGeolocation', () => {
  const mockCoords = {
    latitude: 34.0522,
    longitude: -118.2437,
    accuracy: 10,
    timestamp: Date.now(),
  };

  const mockTraders = [
    { id: '1', name: 'Trader 1', distance: 1.2, pricePerUnit: 0.1, availableQuantity: 100 },
  ];

  beforeEach(() => {
    (locationService.watchPosition as jest.Mock).mockImplementation((success) => {
      success(mockCoords);
      return 123;
    });
    (locationService.applyPrivacy as jest.Mock).mockImplementation((coords) => coords);
    (proximityService.findNearbyTraders as jest.Mock).mockResolvedValue(mockTraders);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state and starts tracking', async () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isTracking).toBe(true);
    expect(locationService.watchPosition).toHaveBeenCalled();
  });

  it('updates state when location changes', async () => {
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      // Trigger the watchPosition success callback
      const successCallback = (locationService.watchPosition as jest.Mock).mock.calls[0][0];
      successCallback(mockCoords);
    });

    expect(result.current.currentLocation).toEqual(mockCoords);
    expect(proximityService.findNearbyTraders).toHaveBeenCalledWith(mockCoords, 5);
    expect(result.current.nearbyTraders).toEqual(mockTraders);
  });

  it('stops tracking on unmount', () => {
    const { unmount } = renderHook(() => useGeolocation());
    unmount();
    expect(locationService.clearWatch).toHaveBeenCalledWith(123);
  });

  it('updates privacy correctly', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.updatePrivacy({ hideLocation: true });
    });

    expect(result.current.privacy.hideLocation).toBe(true);
  });

  it('handles errors from location service', () => {
    (locationService.watchPosition as jest.Mock).mockImplementation((success, error) => {
      error({ message: 'Location access denied' });
      return -1;
    });

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.error).toBe('Location access denied');
    expect(result.current.isTracking).toBe(false);
  });
});
