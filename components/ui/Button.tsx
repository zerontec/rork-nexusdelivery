import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  onPress: () => void;
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    ...SHADOWS.sm,
  },
  size_sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 44,
  },
  size_lg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 52,
  },
  variant_primary: {
    backgroundColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.secondary,
  },
  variant_outline: {
    backgroundColor: 'transparent' as const,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  variant_ghost: {
    backgroundColor: 'transparent' as const,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    backgroundColor: COLORS.gray[200],
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%' as const,
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  text_sm: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  text_md: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  text_lg: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  text_primary: {
    color: COLORS.white,
  },
  text_secondary: {
    color: COLORS.white,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_ghost: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.gray[400],
  },
});
