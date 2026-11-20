import { useFoodStore } from '../useFoodStore';
import { describe, it, expect } from '@jest/globals';
describe('useFoodStore (Zustand UDF)', () => {
  it('menambahkan data surplus makanan baru ke dalam state', () => {
    const initialCount = useFoodStore.getState().surplusList.length;

    useFoodStore.getState().addSurplus({
      id: 'fd-test-99',
      donorName: 'Toko Roti Uji',
      donorType: 'Toko Kelontong',
      foodName: 'Roti Tawar Surplus',
      quantityKg: 2.0,
      expiresAt: '21:00 WIB',
      status: 'available',
      location: { latitude: -7.96, longitude: 112.62 },
    });

    expect(useFoodStore.getState().surplusList.length).toBe(initialCount + 1);
  });

  it('memperbarui impactStats otomatis saat status berubah menjadi delivered', () => {
    const beforeSavedKg = useFoodStore.getState().impactStats.totalSavedKg;

    useFoodStore.getState().updateFoodStatus('fd-test-99', 'delivered');

    const afterSavedKg = useFoodStore.getState().impactStats.totalSavedKg;
    expect(afterSavedKg).toBe(Number((beforeSavedKg + 2.0).toFixed(2)));
  });
});