import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFoodStore, selectImpactStats } from '../store/useFoodStore';

interface MetricItem {
  label: string;
  value: string;
  color: string;
}

interface MetricCardProps {
  metric: MetricItem;
  index: number;
  isLandscape: boolean;
}

// 16-Millisecond Mandate: Memoized MetricCard
const MetricCard = React.memo<MetricCardProps>(({ metric, index, isLandscape }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 120).duration(450)}
    style={[
      styles.metricCard,
      { borderLeftColor: metric.color },
      isLandscape && styles.metricCardLandscape,
    ]}
  >
    <Text style={styles.metricLabel}>{metric.label}</Text>
    <Text style={[styles.metricValue, { color: metric.color }]}>
      {metric.value}
    </Text>
  </Animated.View>
));
MetricCard.displayName = 'MetricCard';

export const AnalyticsScreen: React.FC = React.memo(() => {
  // Precision selector Zustand
  const impactStats = useFoodStore(selectImpactStats);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: 'Makanan Terselamatkan',
        value: `${impactStats.totalSavedKg} kg`,
        color: '#2D6A4F',
      },
      {
        label: 'Estimasi Porsi Layak',
        value: `${impactStats.totalMealsRescued} porsi`,
        color: '#1D3557',
      },
      {
        label: 'Emisi CO₂ Dicegah',
        value: `${impactStats.co2PreventedKg} kg`,
        color: '#E76F51',
      },
    ],
    [impactStats.totalSavedKg, impactStats.totalMealsRescued, impactStats.co2PreventedKg]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dampak Zero-Waste (SDG 12)</Text>
      <Text style={styles.subheading}>
        Akumulasi penyelamatan surplus makanan secara real-time.
      </Text>

      <View style={[styles.grid, isLandscape && styles.gridLandscape]}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            metric={metric}
            index={index}
            isLandscape={isLandscape}
          />
        ))}
      </View>
    </ScrollView>
  );
});
AnalyticsScreen.displayName = 'AnalyticsScreen';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1B4332' },
  subheading: { fontSize: 13, color: '#6C757D', marginTop: 4, marginBottom: 20 },
  grid: { gap: 12 },
  gridLandscape: { flexDirection: 'row', flexWrap: 'wrap' },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  metricCardLandscape: { flex: 1, minWidth: 180 },
  metricLabel: { fontSize: 13, color: '#495057', fontWeight: '600' },
  metricValue: { fontSize: 26, fontWeight: '800', marginTop: 6 },
});
