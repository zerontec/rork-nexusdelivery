import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Package, User, Bike, BarChart } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';

export default function TabLayout() {
  const { currentRole } = useApp();

  if (currentRole === 'driver') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.secondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.gray[200],
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="driver"
          options={{
            title: 'Pedidos',
            tabBarIcon: ({ color, size }) => <Bike size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Historial',
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="business"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  if (currentRole === 'business') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.accent,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.gray[200],
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="business"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <BarChart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Pedidos',
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="driver"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="driver"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
