import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function BusinessLayout() {
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
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          title: 'Inventario',
        }}
      />
      <Stack.Screen
        name="add-product"
        options={{
          title: 'Agregar Producto',
        }}
      />
      <Stack.Screen
        name="offers"
        options={{
          title: 'Ofertas',
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: 'Reportes',
        }}
      />
      <Stack.Screen
        name="sales-today"
        options={{
          title: 'Ventas de Hoy',
        }}
      />
      <Stack.Screen
        name="edit-product"
        options={{
          title: 'Editar Producto',
        }}
      />
    </Stack>
  );
}
