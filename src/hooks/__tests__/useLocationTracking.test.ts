import { renderHook, act } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as Location from 'expo-location';
import { useLocationTracking } from '../useLocationTracking';

jest.mock('expo-location', () => ({
  hasServicesEnabledAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  Accuracy: {
    High: 4,
    Balanced: 3,
  },
}));

describe('useLocationTracking - Architect Protocol Audit', () => {
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValue({
      coords: {
        latitude: -7.96,
        longitude: 112.63,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });
    jest.mocked(Location.watchPositionAsync).mockResolvedValue({
      remove: mockRemove,
    });
  });

  it('Explicit Error Handling: mendeteksi saat hardware GPS nonaktif (SERVICES_DISABLED)', async () => {
    jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);

    const { result } = await renderHook(() => useLocationTracking());

    await act(async () => {});

    expect(result.current.error?.code).toBe('SERVICES_DISABLED');
    expect(result.current.isLoading).toBe(false);
  });

  it('Just-In-Time Permissions: mendeteksi izin diblokir permanen (PERMISSION_DENIED_PERMANENT)', async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: false,
      expires: 'never',
    });

    const { result } = await renderHook(() => useLocationTracking());

    await act(async () => {});

    expect(result.current.error?.code).toBe('PERMISSION_DENIED_PERMANENT');
    expect(result.current.isPermanentDenied).toBe(true);
  });

  it('Zero Memory Leak: membersihkan subscription GPS saat unmount', async () => {
    const { unmount } = await renderHook(() => useLocationTracking());

    await act(async () => {});

    expect(Location.watchPositionAsync).toHaveBeenCalled();

    await act(async () => {
      unmount();
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('Adaptif Battery Optimization: mengatur interval GPS berbeda saat pengantaran aktif', async () => {
    await renderHook(() => useLocationTracking({ isActiveDelivery: true }));

    await act(async () => {});

    expect(Location.watchPositionAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        distanceInterval: 10,
        timeInterval: 3000,
        accuracy: Location.Accuracy.High,
      }),
      expect.any(Function)
    );
  });
});
