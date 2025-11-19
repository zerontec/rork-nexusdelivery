import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
};

export function Chip({ label, selected = false, onPress, style, testID }: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      testID={testID}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  labelSelected: {
    color: COLORS.white,
  },
});
