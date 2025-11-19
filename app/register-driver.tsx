import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Lock, Phone, CreditCard, ArrowLeft, Eye, EyeOff, Check, FileText } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';

export default function RegisterDriverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setRole } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const vehicleTypes = ['Moto', 'Carro', 'Bicicleta', 'Caminando'];

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      console.log('[RegisterDriver] Missing required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('[RegisterDriver] Passwords do not match');
      return;
    }

    console.log('[RegisterDriver] Registering driver:', formData.email);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log('[RegisterDriver] Registration successful - pending approval');
      router.replace('/driver-pending' as any);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.gray[900]} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerShadowVisible: false,
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + SPACING.xl }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <User size={32} color={COLORS.secondary} />
            </View>
            <Text style={styles.title}>Registro de Repartidor</Text>
            <Text style={styles.subtitle}>Completa el formulario para empezar a ganar</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo *</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono *</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+58 412 1234567"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de vehículo</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vehicleTypesContainer}
              >
                {vehicleTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.vehicleTypeChip,
                      formData.vehicleType === type && styles.vehicleTypeChipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, vehicleType: type })}
                  >
                    <Text
                      style={[
                        styles.vehicleTypeText,
                        formData.vehicleType === type && styles.vehicleTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número de licencia</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="123456789"
                  value={formData.licenseNumber}
                  onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.gray[400]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.gray[400]} />
                  ) : (
                    <Eye size={20} color={COLORS.gray[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar contraseña *</Text>
              <View style={styles.inputWrapper}>
                <Check size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.gray[400]}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={COLORS.gray[400]} />
                  ) : (
                    <Eye size={20} color={COLORS.gray[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoCard}>
              <FileText size={20} color={COLORS.secondary} />
              <Text style={styles.infoText}>
                Tu solicitud será revisada. Te notificaremos cuando sea aprobada.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              testID="register-button"
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerButtonText}>Enviar solicitud</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/login' as any)}
            >
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  form: {
    gap: SPACING.md,
  },
  inputContainer: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
  },
  inputPassword: {
    paddingRight: SPACING.xl,
  },
  eyeIcon: {
    position: 'absolute' as const,
    right: SPACING.md,
    padding: SPACING.xs,
  },
  vehicleTypesContainer: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  vehicleTypeChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  vehicleTypeChipActive: {
    backgroundColor: COLORS.secondary + '15',
    borderColor: COLORS.secondary,
  },
  vehicleTypeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  vehicleTypeTextActive: {
    color: COLORS.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.secondary + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  registerButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    marginTop: SPACING.lg,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loginLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  loginLinkBold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
  },
});
