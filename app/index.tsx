import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '@/providers/AppProvider';
import { COLORS } from '@/constants/theme';

export default function RootScreen() {
  const { isLoading, hasCompletedOnboarding, currentRole } = useApp();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/welcome" />;
  }

  if (currentRole === 'customer') {
    return <Redirect href="/(tabs)/home" />;
  } else if (currentRole === 'driver') {
    return <Redirect href="/(tabs)/driver" />;
  } else if (currentRole === 'business') {
    return <Redirect href="/(tabs)/business" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
