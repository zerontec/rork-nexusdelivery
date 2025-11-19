import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { Button } from './Button';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Icon size={64} color={COLORS.gray[300]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button onPress={onAction} style={styles.button} size="md">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center' as const,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.md,
  },
});
