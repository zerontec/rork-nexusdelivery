import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

type BadgeProps = {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  testID?: string;
};

export function Badge({ children, variant = 'primary', style, testID }: BadgeProps) {
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.secondary;
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      case 'info':
        return COLORS.info;
      default:
        return COLORS.gray[500];
    }
  };

  const backgroundColor = getVariantColor();

  return (
    <View
      style={[styles.badge, { backgroundColor }, style]}
      testID={testID}
    >
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.white,
  },
});
