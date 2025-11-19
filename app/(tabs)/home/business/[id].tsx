import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, DollarSign, Star, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { MOCK_BUSINESSES } from '@/mocks/businesses';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/providers/CartProvider';
import { Product } from '@/types';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, addItem, removeItem, itemCount, subtotal } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const business = useMemo(() => {
    return MOCK_BUSINESSES.find((b) => b.id === id);
  }, [id]);

  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.businessId === id);
  }, [id]);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const getProductQuantity = (productId: string): number => {
    return items.find((item) => item.productId === productId)?.quantity || 0;
  };

  const handleAddProduct = (product: Product) => {
    console.log('[BusinessDetail] Adding product:', product.id);
    addItem(product.id);
  };

  const handleRemoveProduct = (product: Product) => {
    console.log('[BusinessDetail] Removing product:', product.id);
    const quantity = getProductQuantity(product.id);
    if (quantity > 0) {
      removeItem(product.id);
      if (quantity === 1 && itemCount === 1) {
        addItem(product.id);
      }
    }
  };

  if (!business) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Negocio no encontrado' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Negocio no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: business.name }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: business.image }} style={styles.headerImage} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessDescription}>{business.description}</Text>
            </View>
            {!business.isOpen && (
              <View style={styles.closedBadge}>
                <Text style={styles.closedText}>Cerrado</Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Star size={16} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.infoText}>
                {business.rating} ({business.reviews})
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={16} color={COLORS.gray[600]} />
              <Text style={styles.infoText}>{business.deliveryTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <DollarSign size={16} color={COLORS.gray[600]} />
              <Text style={styles.infoText}>
                Envío ${business.deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <MapPin size={16} color={COLORS.gray[600]} />
            <Text style={styles.addressText}>{business.location.address}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                testID={`category-${category}`}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category === 'all' ? 'Todos' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.productsContainer}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getProductQuantity(product.id)}
                onAdd={handleAddProduct}
                onRemove={handleRemoveProduct}
                testID={`product-${product.id}`}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {itemCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartCount}>{itemCount} productos</Text>
            <Text style={styles.cartTotal}>${subtotal.toFixed(2)}</Text>
          </View>
          <Button
            onPress={() => router.push('/cart' as any)}
            size="md"
            testID="view-cart-button"
          >
            Ver carrito
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[500],
  },
  headerImage: {
    width: '100%' as const,
    height: 240,
    backgroundColor: COLORS.gray[200],
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  businessDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  closedBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  closedText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    flex: 1,
  },
  categoriesContainer: {
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  productsContainer: {
    gap: SPACING.md,
    paddingBottom: 100,
  },
  cartBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cartInfo: {
    flex: 1,
  },
  cartCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  cartTotal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
});
