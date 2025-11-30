import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/providers/AppProvider";
import { CartProvider } from "@/providers/CartProvider";
import { OrdersProvider } from "@/providers/OrdersProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";

if (__DEV__) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('PostHog') || message.includes('posthog')) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: true, title: "Carrito" }} />
      <Stack.Screen name="checkout" options={{ headerShown: true, title: "Checkout" }} />
      <Stack.Screen name="business-register" options={{ headerShown: true, title: "Registrar Negocio" }} />
      <Stack.Screen name="order-detail" options={{ headerShown: true, title: "Detalle del Pedido" }} />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: "Notificaciones" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <CartProvider>
          <OrdersProvider>
            <NotificationsProvider>
              <GestureHandlerRootView>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </NotificationsProvider>
          </OrdersProvider>
        </CartProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
