import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Store, MapPin, Phone, Mail, Clock, DollarSign } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { BusinessType } from '@/types';
import { useApp } from '@/providers/AppProvider';

type FormData = {
  businessName: string;
  businessType: BusinessType | '';
  description: string;
  phone: string;
  email: string;
  address: string;
  deliveryTime: string;
  deliveryFee: string;
  minimumOrder: string;
};

export default function BusinessRegisterScreen() {
  const router = useRouter();
  const { setRole } = useApp();
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    deliveryTime: '30-45',
    deliveryFee: '2.99',
    minimumOrder: '10.00',
  });

  const businessTypes: { value: BusinessType; label: string }[] = [
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'pharmacy', label: 'Farmacia' },
    { value: 'retail', label: 'Tienda' },
    { value: 'services', label: 'Servicios' },
  ];

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.businessName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de tu negocio');
      return false;
    }
    if (!formData.businessType) {
      Alert.alert('Error', 'Por favor selecciona el tipo de negocio');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Por favor ingresa un teléfono de contacto');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Por favor ingresa la dirección de tu negocio');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    console.log('[BusinessRegister] Submitting form:', formData);

    Alert.alert(
      'Registro Exitoso',
      'Tu negocio ha sido registrado. Ahora puedes gestionar tu dashboard.',
      [
        {
          text: 'Ir al Dashboard',
          onPress: () => {
            setRole('business');
            router.replace('/(tabs)/business' as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Registrar Negocio',
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Store size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Crea tu Negocio</Text>
          <Text style={styles.subtitle}>
            Completa la información para comenzar a vender en nuestra plataforma
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Negocio *</Text>
            <View style={styles.inputContainer}>
              <Store size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Ej. Mi Restaurante"
                value={formData.businessName}
                onChangeText={(value) => updateField('businessName', value)}
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Negocio *</Text>
            <View style={styles.typeGrid}>
              {businessTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    formData.businessType === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => updateField('businessType', type.value)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.businessType === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu negocio..."
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholderTextColor={COLORS.gray[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="negocio@email.com"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Calle, Ciudad, País"
                value={formData.address}
                onChangeText={(value) => updateField('address', value)}
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Entrega</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiempo de Entrega (min)</Text>
            <View style={styles.inputContainer}>
              <Clock size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="30-45"
                value={formData.deliveryTime}
                onChangeText={(value) => updateField('deliveryTime', value)}
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Tarifa de Envío ($)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="2.99"
                  value={formData.deliveryFee}
                  onChangeText={(value) => updateField('deliveryFee', value)}
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Pedido Mínimo ($)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="10.00"
                  value={formData.minimumOrder}
                  onChangeText={(value) => updateField('minimumOrder', value)}
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Al registrar tu negocio, aceptas nuestros términos de servicio y política de privacidad.
          </Text>
        </View>

        <Button onPress={handleSubmit} size="lg">
          Registrar Negocio
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
  },
  textArea: {
    height: 100,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  typeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  disclaimer: {
    padding: SPACING.md,
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  disclaimerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});
