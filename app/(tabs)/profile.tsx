import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { User as UserIcon, Settings, Bell, HelpCircle, Store, Bike, ChevronRight, LogOut } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';
import { Card } from '@/components/ui/Card';

type MenuOption = {
  icon: typeof UserIcon;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
};

export default function ProfileScreen() {
  const { setRole, currentRole, resetApp } = useApp();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    console.log('[Profile] Logging out');
    await resetApp();
    router.replace('/welcome' as any);
  }, [resetApp, router]);

  const handleSwitchToDriver = () => {
    console.log('[Profile] Switching to driver role');
    setRole('driver');
  };

  const handleSwitchToBusiness = () => {
    console.log('[Profile] Switching to business role');
    setRole('business');
  };

  const handleBackToClient = () => {
    console.log('[Profile] Switching back to client role');
    setRole('client');
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'client':
        return 'Cliente';
      case 'driver':
        return 'Repartidor';
      case 'business':
        return 'Negocio';
      default:
        return 'Cliente';
    }
  };

  const getRoleSpecificOptions = (): MenuOption[] => {
    if (currentRole === 'driver' || currentRole === 'business') {
      return [
        {
          icon: UserIcon,
          label: 'Volver a modo cliente',
          onPress: handleBackToClient,
          showChevron: true,
        },
      ];
    }

    return [
      {
        icon: Store,
        label: 'Registrar mi negocio',
        onPress: handleSwitchToBusiness,
        color: COLORS.accent,
        showChevron: true,
      },
      {
        icon: Bike,
        label: 'Quiero ser repartidor',
        onPress: handleSwitchToDriver,
        color: COLORS.secondary,
        showChevron: true,
      },
    ];
  };

  const menuOptions: MenuOption[] = [
    {
      icon: Settings,
      label: 'Configuración',
      onPress: () => console.log('Settings'),
      showChevron: true,
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      onPress: () => console.log('Notifications'),
      showChevron: true,
    },
    {
      icon: HelpCircle,
      label: 'Ayuda y Soporte',
      onPress: () => console.log('Help'),
      showChevron: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Perfil', headerShown: true }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <UserIcon size={40} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.name}>Usuario Demo</Text>
          <Text style={styles.role}>{getRoleLabel()}</Text>
        </Card>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Oportunidades</Text>
          <View style={styles.menuContainer}>
            {getRoleSpecificOptions().map((option, index) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={option.onPress}
                  testID={`menu-${option.label}`}
                >
                  <View style={styles.menuItemLeft}>
                    <Icon size={20} color={option.color || COLORS.gray[700]} />
                    <Text
                      style={[
                        styles.menuItemText,
                        option.color && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {option.showChevron && (
                    <ChevronRight size={20} color={COLORS.gray[400]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.menuContainer}>
            {menuOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={option.onPress}
                  testID={`menu-${option.label}`}
                >
                  <View style={styles.menuItemLeft}>
                    <Icon size={20} color={option.color || COLORS.gray[700]} />
                    <Text
                      style={[
                        styles.menuItemText,
                        option.color && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {option.showChevron && (
                    <ChevronRight size={20} color={COLORS.gray[400]} />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              testID="menu-logout"
            >
              <View style={styles.menuItemLeft}>
                <LogOut size={20} color={COLORS.error} />
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  Cerrar sesión
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>NexusDelivery v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  profileCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  role: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  sectionContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden' as const,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[700],
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  version: {
    textAlign: 'center' as const,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[400],
    marginTop: SPACING.xl,
  },
});
