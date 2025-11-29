import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { User as UserIcon, Settings, Bell, HelpCircle, Store, Bike, ChevronRight, LogOut, Edit, LogIn } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type MenuOption = {
  icon: typeof UserIcon;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
};

export default function ProfileScreen() {
  const { setRole, currentRole, resetApp, user, businessProfile } = useApp();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log('[Profile] User not authenticated, showing login prompt');
    }
  }, [user]);

  const handleLogin = () => {
    router.push('/login' as any);
  };

  const handleRegister = () => {
    router.push('/register-customer' as any);
  };

  const handleLogout = useCallback(async () => {
    console.log('[Profile] Logging out');
    await resetApp();
    router.replace('/welcome' as any);
  }, [resetApp, router]);

  const handleSwitchToDriver = () => {
    console.log('[Profile] Switching to driver role');
    setRole('driver');
    router.replace('/(tabs)/driver');
  };

  const handleSwitchToBusiness = () => {
    console.log('[Profile] Switching to business role');
    setRole('business');
    router.replace('/(tabs)/business');
  };

  const handleBackToClient = () => {
    console.log('[Profile] Switching back to client role');
    setRole('client');
    router.replace('/(tabs)/home');
  };

  const handleEditBusiness = () => {
    router.push('/(tabs)/business/edit-business' as any);
  };

  const handleSettings = () => {
    router.push('/settings' as any);
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

  const getUserName = () => {
    if (currentRole === 'business' && businessProfile?.businessName) {
      return businessProfile.businessName;
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Perfil', headerShown: true }} />

        <View style={styles.unauthContainer}>
          <View style={styles.unauthIconContainer}>
            <UserIcon size={64} color={COLORS.gray[400]} />
          </View>

          <Text style={styles.unauthTitle}>Inicia Sesión</Text>
          <Text style={styles.unauthSubtitle}>
            Accede a tu cuenta para ver tu perfil, historial de pedidos y más
          </Text>

          <View style={styles.unauthButtons}>
            <Button onPress={handleLogin}>
              Iniciar Sesión
            </Button>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>
                ¿No tienes cuenta? Regístrate
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.guestInfo}>
            <Text style={styles.guestInfoText}>
              Puedes explorar negocios y productos sin iniciar sesión
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const getRoleSpecificOptions = (): MenuOption[] => {
    if (currentRole === 'business') {
      return [
        {
          icon: Edit,
          label: 'Editar Negocio',
          onPress: handleEditBusiness,
          color: COLORS.primary,
          showChevron: true,
        },
        {
          icon: UserIcon,
          label: 'Volver a modo cliente',
          onPress: handleBackToClient,
          showChevron: true,
        },
      ];
    }

    if (currentRole === 'driver') {
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
      onPress: handleSettings,
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
          <Text style={styles.name}>{getUserName()}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
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
  email: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
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
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
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
  unauthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  unauthIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  unauthTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  unauthSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  unauthButtons: {
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  registerButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  guestInfo: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  guestInfoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});
