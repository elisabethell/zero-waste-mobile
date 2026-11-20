import { calculateHaversineDistance } from '../haversine';
import { describe, it, expect } from '@jest/globals';
describe('calculateHaversineDistance', () => {
  it('mengembalikan 0 km jika titik asal dan tujuan sama', () => {
    const point = { latitude: -7.9778, longitude: 112.6341 };
    expect(calculateHaversineDistance(point, point)).toBe(0);
  });

  it('menghitung jarak lurus antar dua lokasi di Malang dengan presisi', () => {
    const hotelTugu = { latitude: -7.9778, longitude: 112.6341 };
    const warungNusantara = { latitude: -7.9553, longitude: 112.6152 };

    const distance = calculateHaversineDistance(hotelTugu, warungNusantara);
    expect(distance).toBeGreaterThan(3.0);
    expect(distance).toBeLessThan(3.5);
  });
});