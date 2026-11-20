import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MapScreen } from './src/screens/MapScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { VerifyRecipientScreen } from './src/screens/VerifyRecipientScreen';
import { SurplusFood } from './src/types/food';

type TabName = 'map' | 'inventory' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('map');
  const [verifyingFood, setVerifyingFood] = useState<SurplusFood | null>(null);

  const handleSelectForVerification = useCallback((food: SurplusFood) => {
    setVerifyingFood(food);
  }, []);

  const handleCompleteVerification = useCallback(() => {
    setVerifyingFood(null);
    setActiveTab('analytics');
  }, []);

  const handleCancelVerification = useCallback(() => {
    setVerifyingFood(null);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {verifyingFood ? (
            <VerifyRecipientScreen
              food={verifyingFood}
              onComplete={handleCompleteVerification}
              onCancel={handleCancelVerification}
            />
          ) : (
            <>
              {activeTab === 'map' && (
                <MapScreen onSelectForVerification={handleSelectForVerification} />
              )}
              {activeTab === 'inventory' && <InventoryScreen />}
              {activeTab === 'analytics' && <AnalyticsScreen />}
            </>
          )}
        </View>

        {!verifyingFood && (
          <View style={styles.tabBar}>
            {(['map', 'inventory', 'analytics'] as TabName[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                >
                  {tab === 'map'
                    ? 'Peta LBS'
                    : tab === 'inventory'
                    ? 'Surplus'
                    : 'Dampak'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    backgroundColor: '#FFF',
  },
  tabItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabItemActive: { borderTopWidth: 3, borderTopColor: '#1B4332' },
  tabText: { fontSize: 13, color: '#6C757D', fontWeight: '600' },
  tabTextActive: { color: '#1B4332', fontWeight: '700' },
});
