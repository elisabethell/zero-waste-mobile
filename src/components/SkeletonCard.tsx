import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const SkeletonCard: React.FC = () => {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.85, { duration: 750 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.lineShort} />
      <View style={styles.lineLong} />
      <View style={styles.lineMedium} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lineShort: { height: 12, width: '35%', backgroundColor: '#CED4DA', borderRadius: 6, marginBottom: 10 },
  lineLong: { height: 16, width: '80%', backgroundColor: '#CED4DA', borderRadius: 6, marginBottom: 8 },
  lineMedium: { height: 12, width: '55%', backgroundColor: '#CED4DA', borderRadius: 6 },
});