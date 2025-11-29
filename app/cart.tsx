import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/providers/CartProvider';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';
import { Business } from '@/types';

export default function CartScreen() {
  const router = useRouter();
  const { items, addItem, removeItem, clearCart, subtotal, itemCount, getProduct } = useCart();
  const { currentRole } = useApp();
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (items.length === 0) {
        setBusiness(null);
        return;
      }

      // Get business ID from the first product in cart
      // We need to wait for product details to be available in CartProvider
      // or fetch it here if we just have the ID.
      // Since CartProvider fetches products, we can try to get it from there,
      // but it might be async.
      // Let's fetch the product's business ID directly here to be sure.

      try {
        const productId = items[0].productId;
        const { data: productData } = await supabase
          .from('products')
          .select('business_id')
          .eq('id', productId)
          .single();

        if (productData?.business_id) {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', productData.business_id)
            .single();

          if (businessData) {
            setBusiness(businessData as any);
          }
        }
      } catch (error) {
        console.error('[Cart] Error fetching business:', error);
      }
    };

    fetchBusiness();
  }, [items]);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Carrito' }} />
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={COLORS.gray[400]} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>
            Agrega productos para comenzar tu pedido
          </Text>
          <Button
            onPress={() => router.back()}
            size="md"
            style={styles.emptyButton}
          >
            Explorar Negocios
          </Button>
        </View>
      </View>
    );
  }

  const deliveryFee = business?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Carrito',
          headerRight: () => (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {business && (
          <Card style={styles.businessCard}>
            <Text style={styles.businessLabel}>Pedido de</Text>
            <Text style={styles.businessName}>{business.name}</Text>
          </Card>
        )}

        <View style={styles.itemsContainer}>
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;

            return (
              <Card key={item.productId} style={styles.itemCard}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.itemImage}
                />
                <View style={styles.itemContent}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${product.price.toFixed(2)}
                  </Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => removeItem(item.productId)}
                      testID={`remove-${item.productId}`}
                    >
                      <Minus size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, styles.addButton]}
                      onPress={() => addItem(item.productId)}
                      testID={`add-${item.productId}`}
                    >
                      <Plus size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    for (let i = 0; i < item.quantity; i++) {
                      removeItem(item.productId);
                    }
                  }}
                  testID={`delete-${item.productId}`}
                >
                  <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>{itemCount} productos</Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
        </View>
        <Button
          onPress={() => {
            console.log('[Cart] Confirmar pedido clicked. Current role:', currentRole);
            if (!currentRole) {
              console.log('[Cart] No user logged in, redirecting to register');
              router.push('/register-customer' as any);
            } else {
              console.log('[Cart] User logged in, proceeding to checkout');
              router.push('/checkout' as any);
            }
          }}
          size="lg"
          testID="checkout-button"
        >
          Confirmar Pedido
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  clearText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginRight: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[700],
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center' as const,
  },
  emptyButton: {
    marginTop: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  businessCard: {
    padding: SPACING.md,
  },
  businessLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  itemsContainer: {
    gap: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[200],
  },
  itemContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    minWidth: 20,
    textAlign: 'center' as const,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: SPACING.md,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  footerTotal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
});
