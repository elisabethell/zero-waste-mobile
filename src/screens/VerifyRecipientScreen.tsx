import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SurplusFood } from '../types/food';
import { useFoodStore } from '../store/useFoodStore';
import { saveRecipientCredential } from '../services/secureStorage';
import { saveKtpToScopedStorage } from '../services/fileVault';

interface VerifyRecipientScreenProps {
  food: SurplusFood;
  onComplete: () => void;
  onCancel: () => void;
}

export const VerifyRecipientScreen: React.FC<VerifyRecipientScreenProps> = React.memo(({
  food,
  onComplete,
  onCancel,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [nik, setNik] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const isMountedRef = useRef(true);

  // Precision selector Zustand
  const updateFoodStatus = useFoodStore((state) => state.updateFoodStatus);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleOpenSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch {
      Alert.alert('Pengaturan', 'Tidak dapat membuka pengaturan perangkat secara otomatis.');
    }
  }, []);

  const handleVerifyAndSave = useCallback(async () => {
    const cleanNik = nik.trim();

    // Validasi NIK presisi (Wajib 16 digit angka sesuai standar KTP Indonesia)
    if (!/^\d{16}$/.test(cleanNik)) {
      Alert.alert(
        'Validasi Gagal',
        cleanNik.length === 0
          ? 'Masukkan NIK penerima terlebih dahulu.'
          : 'NIK harus terdiri dari tepat 16 digit angka numerik.'
      );
      return;
    }

    if (!cameraRef.current) {
      Alert.alert('Kamera Belum Siap', 'Lensa kamera sedang diinisialisasi. Coba sesaat lagi.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Ambil Foto KTP
      let photo;
      try {
        photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      } catch (camErr) {
        throw new Error(
          `Gagal mengambil gambar: ${camErr instanceof Error ? camErr.message : 'Sensor kamera sibuk'}`
        );
      }

      if (!photo?.uri) {
        throw new Error('Hasil foto KTP tidak valid atau kosong.');
      }

      // 2. Enkripsi NIK ke Hardware Keystore / Keychain
      try {
        await saveRecipientCredential(food.id, cleanNik);
      } catch (secErr) {
        throw new Error(
          `Gagal mengenkripsi NIK ke Secure Store: ${secErr instanceof Error ? secErr.message : 'Keystore error'}`
        );
      }

      // 3. Simpan foto ke Scoped Storage Sandbox
      try {
        await saveKtpToScopedStorage(photo.uri, food.id);
      } catch (fsErr) {
        throw new Error(
          `Gagal menyimpan foto ke Scoped Storage: ${fsErr instanceof Error ? fsErr.message : 'FileSystem IO error'}`
        );
      }

      // 4. Update status ke Zustand (otomatis menambah Impact Analytics)
      updateFoodStatus(food.id, 'delivered');

      if (isMountedRef.current) {
        Alert.alert('Verifikasi Berhasil', 'Data NIK terenkripsi & serah terima terkonfirmasi.', [
          { text: 'Selesai', onPress: onComplete },
        ]);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem.';
        Alert.alert('Gagal Memproses Verifikasi', message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [nik, food.id, updateFoodStatus, onComplete]);

  // Just-In-Time Permission Flow: Loading State
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B4332" />
        <Text style={styles.permissionDesc}>Memeriksa status izin kamera...</Text>
      </View>
    );
  }

  // Just-In-Time Permission Flow: Denied / Permanently Denied
  if (!permission.granted) {
    const isPermanentlyDenied = !permission.canAskAgain;

    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          {isPermanentlyDenied ? 'Izin Kamera Diblokir' : 'Izin Kamera Diperlukan'}
        </Text>
        <Text style={styles.permissionDesc}>
          {isPermanentlyDenied
            ? 'Izin kamera telah diblokir permanen. Aktifkan izin kamera secara manual di Pengaturan Perangkat untuk memotret identitas penerima.'
            : 'Kamera hanya digunakan secara Just-In-Time untuk memverifikasi kartu identitas (KTP) penerima donasi makanan.'}
        </Text>

        {isPermanentlyDenied ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenSettings}>
            <Text style={styles.btnText}>Buka Pengaturan Aplikasi</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.btnText}>Izinkan Akses Kamera</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
          <Text style={styles.cancelText}>Kembali ke Layar Utama</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verifikasi Penerima: {food.foodName}</Text>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Masukkan 16 digit NIK Penerima"
        placeholderTextColor="#888"
        keyboardType="numeric"
        maxLength={16}
        value={nik}
        onChangeText={setNik}
        editable={!isSubmitting}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleVerifyAndSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Scan KTP & Selesaikan Serah Terima</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelLink}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
VerifyRecipientScreen.displayName = 'VerifyRecipientScreen';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 16, fontWeight: '700', color: '#1B4332', marginBottom: 12 },
  permissionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  permissionDesc: { textAlign: 'center', color: '#555', marginBottom: 20, lineHeight: 20 },
  cameraContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
  },
  camera: { flex: 1 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  actions: { gap: 10 },
  primaryBtn: {
    backgroundColor: '#1B4332',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.6 },
  btnText: { color: '#FFF', fontWeight: '600' },
  cancelLink: { alignItems: 'center', padding: 10 },
  cancelText: { color: '#666', fontWeight: '600' },
});
