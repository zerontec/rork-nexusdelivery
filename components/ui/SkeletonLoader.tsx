import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
};

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.md,
  style,
  testID,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      testID={testID}
    />
  );
}

export function BusinessCardSkeleton() {
  return (
    <View style={styles.businessCard}>
      <SkeletonLoader height={160} borderRadius={BORDER_RADIUS.lg} />
      <View style={styles.businessContent}>
        <SkeletonLoader width="60%" height={24} />
        <SkeletonLoader width="100%" height={16} style={{ marginTop: SPACING.sm }} />
        <SkeletonLoader width="40%" height={16} style={{ marginTop: SPACING.sm }} />
      </View>
    </View>
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonLoader width={80} height={80} borderRadius={BORDER_RADIUS.md} />
      <View style={styles.productContent}>
        <SkeletonLoader width="70%" height={18} />
        <SkeletonLoader width="100%" height={14} style={{ marginTop: SPACING.xs }} />
        <SkeletonLoader width="30%" height={20} style={{ marginTop: SPACING.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[200],
  },
  businessCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden' as const,
    marginBottom: SPACING.md,
  },
  businessContent: {
    padding: SPACING.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  productContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
});
