import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Clock, DollarSign, Star, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/providers/CartProvider';
import { Product, Business } from '@/types';
import { supabase } from '@/lib/supabase';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, addItem, removeItem, itemCount, subtotal } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch business
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single();

        if (businessError) throw businessError;

        // Transform DB data to Business type if needed (handling camelCase/snake_case)
        // Assuming the types match or we map them. 
        // The DB has snake_case (delivery_time, delivery_fee), app uses camelCase.
        const mappedBusiness: Business = {
          ...businessData,
          deliveryTime: businessData.delivery_time,
          deliveryFee: businessData.delivery_fee,
          minimumOrder: businessData.minimum_order,
          isOpen: businessData.is_open,
          // location might need parsing if it's a string, but it's defined as jsonb in schema so it should be object
        };
        setBusiness(mappedBusiness);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('business_id', id);

        if (productsError) throw productsError;

        // Map products similarly
        const mappedProducts: Product[] = (productsData || []).map(p => ({
          ...p,
          businessId: p.business_id,
        }));
        console.log('[BusinessDetail] Fetched products:', JSON.stringify(mappedProducts, null, 2));
        setProducts(mappedProducts);

      } catch (error) {
        console.error('Error fetching business details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
