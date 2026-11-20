import { renderHook, act } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { useRealtimeSync } from '../useRealtimeSync';

describe('useRealtimeSync - Zero Memory Leak Audit', () => {
  let mockClose: jest.Mock<any>;
  let mockWsInstance: any;

  beforeEach(() => {
    mockClose = jest.fn();
    mockWsInstance = {
      close: mockClose,
      readyState: 1, // WebSocket.OPEN
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    const MockWebSocket = jest.fn(() => mockWsInstance) as any;
    MockWebSocket.CONNECTING = 0;
    MockWebSocket.OPEN = 1;
    MockWebSocket.CLOSING = 2;
    MockWebSocket.CLOSED = 3;

    (globalThis as any).WebSocket = MockWebSocket;
  });

  it('Zero Memory Leak: melepaskan semua event listeners dan menutup koneksi socket saat unmount', async () => {
    const { unmount } = await renderHook(() => useRealtimeSync('wss://savebite.org/live'));

    await act(async () => {});

    expect((globalThis as any).WebSocket).toHaveBeenCalledWith('wss://savebite.org/live');

    await act(async () => {
      unmount();
    });

    expect(mockWsInstance.onopen).toBeNull();
    expect(mockWsInstance.onmessage).toBeNull();
    expect(mockWsInstance.onerror).toBeNull();
    expect(mockWsInstance.onclose).toBeNull();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('mengizinkan simulasi offline toggle tanpa re-render berlebih', async () => {
    const { result } = await renderHook(() => useRealtimeSync());

    await act(async () => {});

    expect(result.current.isOffline).toBe(false);

    await act(async () => {
      result.current.toggleOfflineSimulation();
    });

    expect(result.current.isOffline).toBe(true);
  });
});
