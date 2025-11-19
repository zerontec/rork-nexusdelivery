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
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setRole } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('[Login] Missing credentials');
      return;
    }

    console.log('[Login] Attempting login with:', email);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log('[Login] Login successful');
      setRole('customer');
      router.replace('/(tabs)/home' as any);
    }, 1000);
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
            <Text style={styles.title}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.gray[400]}
                  testID="email-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.gray[400]}
                  testID="password-input"
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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              testID="login-button"
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/welcome' as any)}
            >
              <Text style={styles.registerLinkText}>
                ¿No tienes cuenta? <Text style={styles.registerLinkBold}>Regístrate</Text>
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
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[600],
  },
  form: {
    gap: SPACING.lg,
  },
  inputContainer: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    marginTop: SPACING.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  registerLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  registerLinkBold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
});
