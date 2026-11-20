import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { useFoodStore, selectSurplusList } from '../store/useFoodStore';
import { useFoodSearchRx } from '../hooks/useFoodSearchRx';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { SkeletonCard } from '../components/SkeletonCard';
import { SurplusFood } from '../types/food';

const FoodItemCard = React.memo<{ item: SurplusFood }>(({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.badge}>{item.donorType}</Text>
      <Text style={styles.status}>{item.status.toUpperCase()}</Text>
    </View>
    <Text style={styles.title}>{item.foodName}</Text>
    <Text style={styles.donor}>{item.donorName}</Text>
    <Text style={styles.meta}>
      Berat: {item.quantityKg} kg • Batas Ambil: {item.expiresAt}
    </Text>
  </View>
));
FoodItemCard.displayName = 'FoodItemCard';

const EmptySearchResult = React.memo(() => (
  <Text style={styles.emptyText}>Tidak ada surplus makanan yang cocok.</Text>
));
EmptySearchResult.displayName = 'EmptySearchResult';

const keyExtractor = (item: SurplusFood) => item.id;

export const InventoryScreen: React.FC = React.memo(() => {
  // Precision selector Zustand
  const surplusList = useFoodStore(selectSurplusList);
  const [query, setQuery] = useState('');
  const { filteredFoods, isSearching, onSearchChange } = useFoodSearchRx(surplusList);
  const { isOffline, toggleOfflineSimulation } = useRealtimeSync();

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);
      onSearchChange(text);
    },
    [onSearchChange]
  );

  const renderItem: ListRenderItem<SurplusFood> = useCallback(
    ({ item }) => <FoodItemCard item={item} />,
    []
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Mode Offline Aktif — Menampilkan data lokal tersimpan.
          </Text>
        </View>
      )}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari makanan, restoran, atau hotel..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleTextChange}
        />
        <TouchableOpacity style={styles.simBtn} onPress={toggleOfflineSimulation}>
          <Text style={styles.simBtnText}>{isOffline ? 'Online' : 'Offline'}</Text>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filteredFoods}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={EmptySearchResult}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </KeyboardAvoidingView>
  );
});
InventoryScreen.displayName = 'InventoryScreen';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  offlineBanner: {
    backgroundColor: '#E76F51',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  offlineText: { color: '#FFF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  simBtn: {
    backgroundColor: '#1D3557',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  simBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badge: { fontSize: 11, fontWeight: '700', color: '#2D6A4F' },
  status: { fontSize: 11, fontWeight: '700', color: '#6C757D' },
  title: { fontSize: 16, fontWeight: '700', color: '#1B4332' },
  donor: { fontSize: 13, color: '#495057', marginTop: 2 },
  meta: { fontSize: 12, color: '#6C757D', marginTop: 6 },
  emptyText: { textAlign: 'center', color: '#6C757D', marginTop: 40 },
});
