import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';

type DividerProps = {
  style?: ViewStyle;
  vertical?: boolean;
  thickness?: number;
  color?: string;
};

export function Divider({ 
  style, 
  vertical = false, 
  thickness = 1, 
  color = COLORS.gray[200] 
}: DividerProps) {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        vertical ? { width: thickness } : { height: thickness },
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%' as const,
    marginVertical: SPACING.md,
  },
  vertical: {
    height: '100%' as const,
    marginHorizontal: SPACING.md,
  },
});
