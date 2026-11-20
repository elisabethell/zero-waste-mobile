import { useEffect, useState, useCallback } from 'react';
import { useFoodStore } from '../store/useFoodStore';

export const useRealtimeSync = (wsUrl?: string) => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const addSurplus = useFoodStore((state) => state.addSurplus);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isMounted) setIsOffline(false);
        };

        ws.onmessage = (event) => {
          try {
            const incomingFood = JSON.parse(event.data);
            if (incomingFood?.id) addSurplus(incomingFood);
          } catch {
            // Abaikan payload tidak valid
          }
        };

        ws.onerror = () => {
          if (isMounted) setIsOffline(true);
        };

        ws.onclose = () => {
          if (isMounted) setIsOffline(true);
        };
      } catch {
        if (isMounted) setIsOffline(true);
      }
    }

    // Zero Memory Leak: Bersihkan closure handler dan tutup koneksi
    return () => {
      isMounted = false;
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        try {
          ws.close();
        } catch {
          // Abaikan jika socket sudah tertutup
        }
        ws = null;
      }
    };
  }, [wsUrl, addSurplus]);

  const toggleOfflineSimulation = useCallback(() => {
    setIsOffline((prev) => !prev);
  }, []);

  return { isOffline, toggleOfflineSimulation };
};
