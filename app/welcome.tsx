import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ShoppingBag, Truck, Store, ArrowRight, Zap, Shield, DollarSign } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.xxl }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBg}>
              <Zap size={48} color={COLORS.primary} />
            </View>
          </View>
          
          <Text style={styles.title}>NexusDelivery</Text>
          <Text style={styles.subtitle}>
            Conectamos negocios, clientes y repartidores en un solo lugar
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconSmall}>
                <Zap size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Entregas rápidas</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconSmall}>
                <Shield size={16} color={COLORS.accent} />
              </View>
              <Text style={styles.featureText}>100% seguro</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconSmall}>
                <DollarSign size={16} color={COLORS.success} />
              </View>
              <Text style={styles.featureText}>Mejores precios</Text>
            </View>
          </View>
        </View>

        <View style={styles.rolesSection}>
          <Text style={styles.rolesSectionTitle}>¿Cómo quieres empezar?</Text>
          
          <TouchableOpacity
            style={[styles.roleCard, styles.customerCard]}
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.roleCardContent}>
              <View style={[styles.roleIcon, styles.customerIcon]}>
                <ShoppingBag size={32} color={COLORS.white} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Soy Cliente</Text>
                <Text style={styles.roleDescription}>
                  Descubre negocios y recibe tus pedidos
                </Text>
              </View>
              <ArrowRight size={24} color={COLORS.gray[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.driverCard]}
            onPress={() => router.push('/register-driver' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.roleCardContent}>
              <View style={[styles.roleIcon, styles.driverIcon]}>
                <Truck size={32} color={COLORS.white} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Soy Repartidor</Text>
                <Text style={styles.roleDescription}>
                  Gana dinero entregando pedidos
                </Text>
              </View>
              <ArrowRight size={24} color={COLORS.gray[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.businessCard]}
            onPress={() => router.push('/business-register' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.roleCardContent}>
              <View style={[styles.roleIcon, styles.businessIcon]}>
                <Store size={32} color={COLORS.white} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Tengo un Negocio</Text>
                <Text style={styles.roleDescription}>
                  Aumenta tus ventas con delivery
                </Text>
              </View>
              <ArrowRight size={24} color={COLORS.gray[400]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={styles.loginLinkText}>
            ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  title: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.full,
  },
  featureIconSmall: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  rolesSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  rolesSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  roleCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.xl,
  },
  customerCard: {},
  driverCard: {},
  businessCard: {},
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  customerIcon: {
    backgroundColor: COLORS.primary,
  },
  driverIcon: {
    backgroundColor: COLORS.secondary,
  },
  businessIcon: {
    backgroundColor: COLORS.accent,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  loginLink: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  loginLinkBold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
});
