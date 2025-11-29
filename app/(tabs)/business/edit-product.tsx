import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { X, Save, Trash2, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [discount, setDiscount] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        const foundProduct: Product = {
          ...data,
          // Map snake_case to camelCase if needed, but Product type seems to match DB mostly
          // except for optional fields. Let's assume direct mapping for now or fix if needed.
          // Actually, Product type has isNew, isBestSeller. DB has is_new.
          isNew: data.is_new,
          isBestSeller: false, // Removed from DB
        };

        setProduct(foundProduct);
        setName(foundProduct.name);
        setDescription(foundProduct.description || '');
        setPrice(foundProduct.price.toString());
        setStock(foundProduct.stock.toString());
        setCategory(foundProduct.category);
        setDiscount(foundProduct.discount?.toString() || '');
        setImage(foundProduct.image || null);
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'No se pudo cargar el producto');
        router.back();
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

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
        setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        setImageChanged(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadImage = async (base64Image: string): Promise<string | null> => {
    try {
      const fileName = `${product?.businessId}/${Date.now()}.jpg`;
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

  const handleSave = async () => {
    if (!name || !price || !stock || !category) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = image;
      if (imageChanged && image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase
        .from('products')
        .update({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          category,
          discount: discount ? parseFloat(discount) : 0,
          image: imageUrl,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Éxito', 'Producto actualizado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('[EditProduct] Attempting to delete product:', id);

              const { data, error, count } = await supabase
                .from('products')
                .delete()
                .eq('id', id)
                .select();

              console.log('[EditProduct] Delete response:', { data, error, count });

              if (error) {
                console.error('[EditProduct] Delete error:', error);
                throw error;
              }

              if (!data || data.length === 0) {
                console.warn('[EditProduct] No rows were deleted. Possible RLS issue.');
                Alert.alert('Error', 'No se pudo eliminar el producto. Verifica los permisos.');
                return;
              }

              Alert.alert('Éxito', 'Producto eliminado correctamente', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', `No se pudo eliminar el producto: ${error.message || 'Error desconocido'}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: 'Editar Producto',
            presentation: 'modal',
          }}
        />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (!product) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Editar Producto',
          presentation: 'modal',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={COLORS.gray[900]} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Imagen del Producto</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {image ? (
                <>
                  <Image source={{ uri: image }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      setImage(null);
                      setImageChanged(true);
                    }}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Nombre del Producto <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Pizza Margherita"
              placeholderTextColor={COLORS.gray[400]}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu producto..."
              placeholderTextColor={COLORS.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <Text style={styles.label}>
                Precio ($) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.gray[400]}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <Text style={styles.label}>
                Stock <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.gray[400]}
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Categoría <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Pizzas"
              placeholderTextColor={COLORS.gray[400]}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descuento (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.gray[400]}
              value={discount}
              onChangeText={setDiscount}
              keyboardType="number-pad"
            />
          </View>
        </Card>

        <Button
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={loading}
        >
          <Trash2 size={20} color={COLORS.error} />
          <Text style={styles.deleteButtonText}>Eliminar Producto</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  formCard: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  formGroup: {
    gap: SPACING.sm,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
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
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.error,
  },
});
