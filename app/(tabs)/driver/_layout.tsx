import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function DriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.gray[900],
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Pedidos Disponibles',
        }}
      />
      <Stack.Screen
        name="earnings"
        options={{
          title: 'Mis Ganancias',
        }}
      />
      <Stack.Screen
        name="active-order"
        options={{
          title: 'Pedido Activo',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Historial de Entregas',
        }}
      />
      <Stack.Screen
        name="ratings"
        options={{
          title: 'Calificaciones',
        }}
      />
    </Stack>
  );
}
