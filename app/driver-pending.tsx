import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

export default function DriverPendingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/welcome' as any)} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.gray[900]} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerShadowVisible: false,
        }}
      />
      
      <View style={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <Clock size={64} color={COLORS.warning} />
          </View>
        </View>

        <Text style={styles.title}>Solicitud enviada</Text>
        <Text style={styles.subtitle}>
          Estamos revisando tu información. Te notificaremos por correo cuando tu cuenta sea aprobada.
        </Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepIconComplete]}>
              <CheckCircle size={24} color={COLORS.success} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Registro completado</Text>
              <Text style={styles.stepDescription}>Tu información ha sido recibida</Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepIconPending]}>
              <Clock size={24} color={COLORS.warning} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verificación</Text>
              <Text style={styles.stepDescription}>Revisando tus documentos</Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <CheckCircle size={24} color={COLORS.gray[300]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, styles.stepTitleInactive]}>Aprobación</Text>
              <Text style={styles.stepDescription}>Podrás comenzar a trabajar</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>¿Cuánto tiempo toma?</Text>
          <Text style={styles.infoText}>
            Usualmente revisamos las solicitudes en 24-48 horas. Te enviaremos un correo cuando estés aprobado.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/welcome' as any)}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.warning + '15',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  title: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  stepsContainer: {
    marginBottom: SPACING.xxl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconComplete: {
    backgroundColor: COLORS.success + '15',
  },
  stepIconPending: {
    backgroundColor: COLORS.warning + '15',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  stepTitleInactive: {
    color: COLORS.gray[400],
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  stepConnector: {
    width: 2,
    height: 32,
    backgroundColor: COLORS.gray[200],
    marginLeft: 23,
    marginVertical: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
});
