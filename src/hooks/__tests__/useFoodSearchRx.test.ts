import { renderHook, act } from '@testing-library/react-native';
import { describe, it, expect, jest } from '@jest/globals';
import { useFoodSearchRx } from '../useFoodSearchRx';
import { SurplusFood } from '../../types/food';

const MOCK_ITEMS: SurplusFood[] = [
  {
    id: '1',
    foodName: 'Roti Gandum',
    donorName: 'Bakery A',
    donorType: 'Hotel',
    quantityKg: 2,
    expiresAt: '22:00',
    status: 'available',
    location: { latitude: 0, longitude: 0 },
  },
  {
    id: '2',
    foodName: 'Nasi Bungkus',
    donorName: 'Warung B',
    donorType: 'Restoran',
    quantityKg: 5,
    expiresAt: '21:00',
    status: 'available',
    location: { latitude: 0, longitude: 0 },
  },
];

describe('useFoodSearchRx - Stream & Memory Leak Audit', () => {
  it('menyaring makanan secara reaktif dan membersihkan subscription saat unmount', async () => {
    const { result, unmount } = await renderHook(() => useFoodSearchRx(MOCK_ITEMS));

    expect(result.current.filteredFoods.length).toBe(2);

    await act(async () => {
      result.current.onSearchChange('Roti');
      // Tunggu debounce 300ms + stream delay 200ms
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    expect(result.current.filteredFoods.length).toBe(1);
    expect(result.current.filteredFoods[0].foodName).toBe('Roti Gandum');
    expect(result.current.isSearching).toBe(false);

    // Pastikan unmount aman tanpa memory leak / stream exception
    await act(async () => {
      unmount();
    });
  });
});
