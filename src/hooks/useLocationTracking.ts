import { useEffect, useState, useCallback, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useFoodStore } from '../store/useFoodStore';

export type LocationErrorCode =
  | 'SERVICES_DISABLED'
  | 'PERMISSION_DENIED'
  | 'PERMISSION_DENIED_PERMANENT'
  | 'INITIALIZATION_FAILED';

export interface LocationError {
  code: LocationErrorCode;
  message: string;
}

interface UseLocationTrackingOptions {
  isActiveDelivery?: boolean; // Adaptif: 10m/3s saat aktif antar, 50m/10s saat standby
}

export const useLocationTracking = ({
  isActiveDelivery = false,
}: UseLocationTrackingOptions = {}) => {
  const setCourierLocation = useFoodStore((state) => state.setCourierLocation);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryNonce, setRetryNonce] = useState<number>(0);

  // Menyimpan referensi aktif subscription untuk cleanup aman
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRetryNonce((prev) => prev + 1);
  }, []);

  const openSettings = useCallback(async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      try {
        // 1. Verifikasi Hardware / Service GPS Aktif
        const isServiceEnabled = await Location.hasServicesEnabledAsync();
        if (!isMounted) return;

        if (!isServiceEnabled) {
          setError({
            code: 'SERVICES_DISABLED',
            message: 'Layanan lokasi (GPS) nonaktif. Aktifkan GPS pada pengaturan perangkat.',
          });
          setIsLoading(false);
          return;
        }

        // 2. Just-In-Time Foreground Permission Check
        let permission = await Location.getForegroundPermissionsAsync();
        if (!isMounted) return;

        if (!permission.granted) {
          if (permission.canAskAgain) {
            permission = await Location.requestForegroundPermissionsAsync();
            if (!isMounted) return;
          }

          if (!permission.granted) {
            const isPermanent = !permission.canAskAgain;
            setError({
              code: isPermanent ? 'PERMISSION_DENIED_PERMANENT' : 'PERMISSION_DENIED',
              message: isPermanent
                ? 'Izin lokasi diblokir permanen. Harap izinkan melalui Pengaturan Aplikasi.'
                : 'Izin lokasi ditolak. Aktifkan GPS untuk mencari surplus makanan terdekat.',
            });
            setIsLoading(false);
            return;
          }
        }

        // 3. Fast-lock: Dapatkan lokasi terakhir / awal secara cepat
        try {
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown && isMounted) {
            setCourierLocation({
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
            });
            setIsLoading(false);
          }
        } catch {
          // Fallback halus ke watchPosition jika lastKnown tidak tersedia
        }

        // 4. Adaptif Battery-Aware GPS Tracking
        const adaptiveDistanceInterval = isActiveDelivery ? 10 : 50;
        const adaptiveTimeInterval = isActiveDelivery ? 3000 : 10000;

        const sub = await Location.watchPositionAsync(
          {
            accuracy: isActiveDelivery
              ? Location.Accuracy.High
              : Location.Accuracy.Balanced,
            distanceInterval: adaptiveDistanceInterval,
            timeInterval: adaptiveTimeInterval,
          },
          (loc) => {
            if (isMounted) {
              setCourierLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
              setIsLoading(false);
            }
          }
        );

        // Mencegah memory leak / race condition jika unmounted saat async resolving
        if (!isMounted) {
          sub.remove();
          return;
        }

        subscriptionRef.current = sub;
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Gagal menginisialisasi layanan lokasi.';
          setError({
            code: 'INITIALIZATION_FAILED',
            message: `Gagal inisialisasi GPS: ${errorMessage}`,
          });
          setIsLoading(false);
        }
      }
    };

    startTracking();

    // Zero Memory Leak: Cleanup pasti saat unmount atau parameter berubah
    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [isActiveDelivery, setCourierLocation, retryNonce]);

  return {
    error,
    errorMsg: error?.message ?? null,
    isLoading,
    isPermanentDenied: error?.code === 'PERMISSION_DENIED_PERMANENT',
    openSettings,
    retry,
  };
};
