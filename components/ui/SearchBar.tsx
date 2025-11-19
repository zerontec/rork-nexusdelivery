import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  testID?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  style,
  testID,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Search size={20} color={COLORS.gray[400]} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray[400]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <X size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
    height: '100%' as const,
  },
});
