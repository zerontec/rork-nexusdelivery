import React from 'react';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Explorar',
        }}
      />
      <Stack.Screen
        name="business/[id]"
        options={{
          title: 'Negocio',
          presentation: 'card' as const,
        }}
      />
    </Stack>
  );
}
