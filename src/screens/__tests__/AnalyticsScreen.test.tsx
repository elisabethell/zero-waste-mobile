import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect, jest } from '@jest/globals';
import { AnalyticsScreen } from '../AnalyticsScreen';

// Mock Reanimated agar aman dijalankan di lingkungan Jest
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    FadeInDown: {
      delay: () => ({ duration: () => ({}) }),
    },
  };
});

describe('AnalyticsScreen Integration Test', () => {
  it('menampilkan judul SDG 12 dan metrik dampak dari Zustand Store', async () => {
    await render(<AnalyticsScreen />);

    expect(screen.getByText('Dampak Zero-Waste (SDG 12)')).toBeTruthy();
    expect(screen.getByText('Makanan Terselamatkan')).toBeTruthy();
    expect(screen.getByText('Emisi CO₂ Dicegah')).toBeTruthy();
  });
});