import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

type LoadingSpinnerProps = {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  testID?: string;
};

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
  testID,
}: LoadingSpinnerProps) {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
  },
});
