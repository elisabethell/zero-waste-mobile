import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {
  useFoodStore,
  selectSurplusList,
  selectCourierLocation,
  selectUpdateFoodStatus,
} from '../store/useFoodStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { calculateHaversineDistance } from '../utils/haversine';
import { SurplusFood } from '../types/food';

interface MapScreenProps {
  onSelectForVerification: (food: SurplusFood) => void;
}

// 16-Millisecond Mandate: Memoized FoodMarker untuk mencegah bridge flood saat GPS bergerak
interface FoodMarkerProps {
  food: SurplusFood;
  onPress: (food: SurplusFood) => void;
}

const FoodMarker = React.memo<FoodMarkerProps>(({ food, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(food);
  }, [food, onPress]);

  return (
    <Marker
      coordinate={food.location}
      onPress={handlePress}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.markerBadge,
          food.status === 'delivered' && styles.markerDelivered,
          food.status === 'claimed' && styles.markerClaimed,
        ]}
      >
        <Text style={styles.markerText}>{food.quantityKg} kg</Text>
      </View>
    </Marker>
  );
});
FoodMarker.displayName = 'FoodMarker';

export const MapScreen: React.FC<MapScreenProps> = React.memo(({
  onSelectForVerification,
}) => {
  // Precision Selectors Zustand (Mencegah re-render yang tidak perlu)
  const surplusList = useFoodStore(selectSurplusList);
  const courierLocation = useFoodStore(selectCourierLocation);
  const updateFoodStatus = useFoodStore(selectUpdateFoodStatus);

  const [selectedFood, setSelectedFood] = useState<SurplusFood | null>(null);

  const {
    errorMsg,
    isLoading,
    isPermanentDenied,
    openSettings,
    retry,
  } = useLocationTracking({
    isActiveDelivery: selectedFood?.status === 'claimed',
  });

  const handleClaim = useCallback(
    (id: string) => {
      updateFoodStatus(id, 'claimed');
      setSelectedFood((prev) =>
        prev && prev.id === id ? { ...prev, status: 'claimed' } : prev
      );
    },
    [updateFoodStatus]
  );

  const handleSelectFood = useCallback((food: SurplusFood) => {
    setSelectedFood(food);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedFood(null);
  }, []);

  const handleVerifyPress = useCallback(() => {
    if (selectedFood) {
      onSelectForVerification(selectedFood);
    }
  }, [selectedFood, onSelectForVerification]);

  // Jarak hanya dihitung untuk item yang sedang aktif di-inspect (hemat CPU/60 FPS)
  const selectedFoodDistance = useMemo(() => {
    if (!selectedFood || !courierLocation) return null;
    return calculateHaversineDistance(courierLocation, selectedFood.location);
  }, [courierLocation, selectedFood]);

  // Memoized initial region untuk MapView
  const initialRegion = useMemo(
    () => ({
      latitude: courierLocation?.latitude ?? -7.9666,
      longitude: courierLocation?.longitude ?? 112.6326,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    }),
    [courierLocation?.latitude, courierLocation?.longitude]
  );

  if (isLoading && !courierLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B4332" />
        <Text style={styles.infoText}>Menginisialisasi GPS Presisi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <View style={styles.errorActions}>
            {isPermanentDenied ? (
              <TouchableOpacity style={styles.retryBtn} onPress={openSettings}>
                <Text style={styles.retryBtnText}>Buka Pengaturan</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.retryBtn} onPress={retry}>
                <Text style={styles.retryBtnText}>Coba Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {surplusList.map((food) => (
          <FoodMarker
            key={food.id}
            food={food}
            onPress={handleSelectFood}
          />
        ))}
      </MapView>

      {/* Bottom Sheet Info Donor */}
      {selectedFood && (
        <View style={styles.card}>
          <Text style={styles.donorType}>{selectedFood.donorType}</Text>
          <Text style={styles.title}>{selectedFood.donorName}</Text>
          <Text style={styles.subtitle}>
            {selectedFood.foodName} • {selectedFood.quantityKg} kg
          </Text>
          <Text style={styles.meta}>
            Batas Ambil: {selectedFood.expiresAt}
            {selectedFoodDistance !== null ? ` • Jarak: ${selectedFoodDistance} km` : ''}
          </Text>

          <View style={styles.buttonRow}>
            {selectedFood.status === 'available' && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => handleClaim(selectedFood.id)}
              >
                <Text style={styles.btnText}>Ambil Pesanan</Text>
              </TouchableOpacity>
            )}

            {selectedFood.status === 'claimed' && (
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerifyPress}
              >
                <Text style={styles.btnText}>Verifikasi KTP Penerima</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleCloseCard}
            >
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});
MapScreen.displayName = 'MapScreen';

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { marginTop: 8, color: '#333' },
  errorBanner: {
    backgroundColor: '#D62828',
    padding: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: { color: '#FFF', fontSize: 12, flex: 1, marginRight: 8 },
  errorActions: { flexDirection: 'row' },
  retryBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryBtnText: { color: '#D62828', fontWeight: '700', fontSize: 11 },
  markerBadge: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerClaimed: { backgroundColor: '#E9C46A' },
  markerDelivered: { backgroundColor: '#6C757D' },
  markerText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  donorType: { fontSize: 11, fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '700', color: '#1B4332', marginTop: 2 },
  subtitle: { fontSize: 14, color: '#333', marginTop: 4 },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: '#1D3557',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#EAEAEA',
  },
  btnText: { color: '#FFF', fontWeight: '600' },
  closeBtnText: { color: '#333', fontWeight: '600' },
});
