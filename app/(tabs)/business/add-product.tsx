import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Package, DollarSign, Hash, FileText, Tag, TrendingUp, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  discount: string;
  isNew: boolean;
  isBestSeller: boolean;
  available: boolean;
  image: string | null;
};

export default function AddProductScreen() {
  const router = useRouter();
  const { businessProfile, refreshProfile, isLoading: isAppLoading } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount: '',
    isNew: false,
    isBestSeller: false,
    available: true,
    image: null,
  });

  useEffect(() => {
    if (!businessProfile?.id && refreshProfile) {
      refreshProfile();
    }
  }, [businessProfile, refreshProfile]);

  if (isAppLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const categories = [
    'Comida',
    'Bebidas',
    'Postres',
    'Snacks',
    'Medicamentos',
    'Cuidado Personal',
    'Hogar',
    'Electrónica',
    'Ropa',
    'Otros',
  ];

  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        updateField('image', `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadImage = async (base64Image: string): Promise<string | null> => {
    try {
      const fileName = `${businessProfile?.id}/${Date.now()}.jpg`;
      const base64Data = base64Image.split(',')[1];

      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, decode(base64Data), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del producto');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return false;
    }
    if (!formData.stock.trim() || isNaN(Number(formData.stock))) {
      Alert.alert('Error', 'Por favor ingresa una cantidad de stock válida');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!businessProfile?.id) {
      Alert.alert('Error', 'No se pudo identificar el negocio. Por favor intenta de nuevo.');
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      const { error } = await supabase.from('products').insert({
        business_id: businessProfile.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        discount: formData.discount ? Number(formData.discount) : 0,
        // Removed is_new and is_best_seller as they don't exist in schema
        available: formData.available,
        image: imageUrl,
      });

      if (error) throw error;

      Alert.alert(
        'Producto Agregado',
        `${formData.name} ha sido agregado al inventario exitosamente.`,
        [
          {
            text: 'Ver Inventario',
            onPress: () => router.back(),
          },
          {
            text: 'Agregar Otro',
            onPress: () => {
              setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                discount: '',
                isNew: false,
                isBestSeller: false,
                available: true,
                image: null,
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'No se pudo agregar el producto. ' + (error.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Agregar Producto',
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagen del Producto</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {formData.image ? (
              <>
                <Image source={{ uri: formData.image }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => updateField('image', null)}
                >
                  <X size={20} color={COLORS.white} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={40} color={COLORS.gray[400]} />
                <Text style={styles.imagePlaceholderText}>
                  Toca para agregar una imagen
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Producto *</Text>
            <View style={styles.inputContainer}>
              <Package size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Ej. Pizza Margarita"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <View style={styles.inputContainerMultiline}>
              <FileText size={20} color={COLORS.gray[400]} style={styles.multilineIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe el producto..."
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholderTextColor={COLORS.gray[400]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    formData.category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => updateField('category', cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio e Inventario</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Precio ($) *</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => updateField('price', value)}
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Stock *</Text>
              <View style={styles.inputContainer}>
                <Hash size={20} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.stock}
                  onChangeText={(value) => updateField('stock', value)}
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descuento (%)</Text>
            <View style={styles.inputContainer}>
              <TrendingUp size={20} color={COLORS.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.discount}
                onChangeText={(value) => updateField('discount', value)}
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Tag size={20} color={COLORS.gray[700]} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Disponible</Text>
                <Text style={styles.switchDescription}>
                  Mostrar producto en el catálogo
                </Text>
              </View>
            </View>
            <Switch
              value={formData.available}
              onValueChange={(value) => updateField('available', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Tag size={20} color={COLORS.gray[700]} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Producto Nuevo</Text>
                <Text style={styles.switchDescription}>
                  Mostrar etiqueta de "Nuevo"
                </Text>
              </View>
            </View>
            <Switch
              value={formData.isNew}
              onValueChange={(value) => updateField('isNew', value)}
              trackColor={{ false: COLORS.gray[300], true: COLORS.accent }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Agregar Producto
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.xl,
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
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  imagePlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
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
  inputContainerMultiline: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  multilineIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
  },
  textArea: {
    height: 100,
    paddingTop: 0,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  categoriesContainer: {
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  switchInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
