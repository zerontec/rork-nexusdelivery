export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const COLORS = {
  primary: '#FFAA00', // Velozia orange - hsl(39 100% 50%)
  secondary: '#004E89',
  accent: '#FF8C00', // Darker orange for accents

  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  white: '#FFFFFF',
  black: '#000000',

  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System' as const,
    medium: 'System' as const,
    bold: 'System' as const,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export type BusinessTheme = {
  primary: string;
  secondary: string;
  accent: string;
};

export const BUSINESS_THEMES: Record<string, BusinessTheme> = {
  restaurant: {
    primary: '#FF6B35',
    secondary: '#004E89',
    accent: '#F7931E',
  },
  pharmacy: {
    primary: '#4CAF50',
    secondary: '#1976D2',
    accent: '#00BCD4',
  },
  retail: {
    primary: '#9C27B0',
    secondary: '#E91E63',
    accent: '#FF5722',
  },
  services: {
    primary: '#2196F3',
    secondary: '#009688',
    accent: '#FFC107',
  },
} as const;
