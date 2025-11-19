import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '@/constants/theme';

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
};

export function Card({ children, onPress, style, testID }: CardProps) {
  const cardStyle: ViewStyle[] = [styles.card, style];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
