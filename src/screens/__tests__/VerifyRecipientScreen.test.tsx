import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Alert, Linking } from 'react-native';
import { VerifyRecipientScreen } from '../VerifyRecipientScreen';
import { SurplusFood } from '../../types/food';

const mockUseCameraPermissions = jest.fn();

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return {
    CameraView: View,
    useCameraPermissions: () => mockUseCameraPermissions(),
  };
});

jest.mock('../../services/secureStorage', () => ({
  saveRecipientCredential: (jest.fn() as any).mockResolvedValue(undefined),
}));

jest.mock('../../services/fileVault', () => ({
  saveKtpToScopedStorage: (jest.fn() as any).mockResolvedValue('/vault/ktp_test.jpg'),
}));

const MOCK_FOOD: SurplusFood = {
  id: 'fd-test-01',
  foodName: 'Surplus Roti Manis',
  donorName: 'Bakery Test',
  donorType: 'Hotel',
  quantityKg: 3.5,
  expiresAt: '21:00 WIB',
  status: 'claimed',
  location: { latitude: -7.96, longitude: 112.63 },
};

describe('VerifyRecipientScreen - JIT Permissions & Explicit Error Handling Audit', () => {
  const onCompleteMock = jest.fn();
  const onCancelMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as any);
  });

  it('Just-In-Time Permissions: menampilkan rasionalisasi izin kamera saat belum diizinkan', async () => {
    mockUseCameraPermissions.mockReturnValue([
      { granted: false, canAskAgain: true },
      jest.fn(),
    ]);

    await render(
      <VerifyRecipientScreen
        food={MOCK_FOOD}
        onComplete={onCompleteMock}
        onCancel={onCancelMock}
      />
    );

    expect(screen.getByText('Izin Kamera Diperlukan')).toBeTruthy();
    expect(screen.getByText('Izinkan Akses Kamera')).toBeTruthy();
  });

  it('Just-In-Time Permissions: mendeteksi izin kamera diblokir permanen dan menyediakan tombol buka Pengaturan', async () => {
    mockUseCameraPermissions.mockReturnValue([
      { granted: false, canAskAgain: false },
      jest.fn(),
    ]);

    await render(
      <VerifyRecipientScreen
        food={MOCK_FOOD}
        onComplete={onCompleteMock}
        onCancel={onCancelMock}
      />
    );

    expect(screen.getByText('Izin Kamera Diblokir')).toBeTruthy();
    expect(screen.getByText('Buka Pengaturan Aplikasi')).toBeTruthy();
  });

  it('Explicit Error Handling: menolak submit jika format NIK kosong atau bukan 16 digit angka presisi', async () => {
    mockUseCameraPermissions.mockReturnValue([
      { granted: true, canAskAgain: true },
      jest.fn(),
    ]);

    await render(
      <VerifyRecipientScreen
        food={MOCK_FOOD}
        onComplete={onCompleteMock}
        onCancel={onCancelMock}
      />
    );

    const input = screen.getByPlaceholderText('Masukkan 16 digit NIK Penerima');
    const submitBtn = screen.getByText('Scan KTP & Selesaikan Serah Terima');

    // 1. Uji input kosong
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validasi Gagal',
      'Masukkan NIK penerima terlebih dahulu.'
    );

    // 2. Uji input kurang dari 16 digit
    await act(async () => {
      fireEvent.changeText(input, '1234567890');
    });

    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validasi Gagal',
      'NIK harus terdiri dari tepat 16 digit angka numerik.'
    );
  });
});
