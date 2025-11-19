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
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { X, Save, Trash2 } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { Product } from '@/types';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [discount, setDiscount] = useState('');

  useEffect(() => {
    if (id) {
      const foundProduct = MOCK_PRODUCTS.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setName(foundProduct.name);
        setDescription(foundProduct.description);
        setPrice(foundProduct.price.toString());
        setStock(foundProduct.stock.toString());
        setCategory(foundProduct.category);
        setDiscount(foundProduct.discount?.toString() || '');
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!name || !price || !stock || !category) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log('[EditProduct] Guardando producto:', {
        id,
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        discount: discount ? parseFloat(discount) : undefined,
      });

      setLoading(false);
      Alert.alert('Éxito', 'Producto actualizado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 500);
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
          onPress: () => {
            console.log('[EditProduct] Eliminando producto:', id);
            
            setTimeout(() => {
              Alert.alert('Éxito', 'Producto eliminado correctamente', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }, 300);
          },
        },
      ]
    );
  };

  if (!product) {
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
          title={loading ? 'Guardando...' : 'Guardar Cambios'}
          onPress={handleSave}
          disabled={loading}
          icon={<Save size={20} color={COLORS.white} />}
        />

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
