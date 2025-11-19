import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Phone, MapPin, Star } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { MOCK_BUSINESSES } from '@/mocks/businesses';
import { MOCK_DRIVERS } from '@/mocks/drivers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderTrackingMap } from '@/components/OrderTrackingMap';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { orders } = useOrders();

  const order = useMemo(() => {
    return orders.find((o) => o.id === id);
  }, [orders, id]);

  const business = useMemo(() => {
    return order ? MOCK_BUSINESSES.find((b) => b.id === order.businessId) : null;
  }, [order]);

  const orderProducts = useMemo(() => {
    if (!order) return [];
    return order.items.map((item) => ({
      ...item,
      product: MOCK_PRODUCTS.find((p) => p.id === item.productId),
    }));
  }, [order]);

  const driver = useMemo(() => {
    return order?.driverId ? MOCK_DRIVERS.find((d) => d.id === order.driverId) : null;
  }, [order]);

  if (!order || !business) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Pedido no encontrado' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pedido no encontrado</Text>
          <Button onPress={() => router.back()} style={styles.backButton}>Volver</Button>
        </View>
      </View>
    );
  }

  const canCancelOrder = ['pending', 'confirmed'].includes(order.status);
  const showTracking = !['cancelled'].includes(order.status);
  const canRate = order.status === 'delivered' && order.driverId;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Pedido #${order.id.slice(0, 8)}`,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {showTracking && (
          <Card style={styles.trackingCard}>
            <OrderTrackingMap
              status={order.status}
              driverName={driver?.name}
              estimatedTime={
                order.estimatedDelivery
                  ? new Date(order.estimatedDelivery).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '15-20 min'
              }
            />
          </Card>
        )}

        {canRate && driver && (
          <Card style={styles.section}>
            <View style={styles.driverHeader}>
              <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>Tu repartidor</Text>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.driverRating}>
                  <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.driverRatingText}>
                    {driver.rating} ({driver.reviews} reseñas)
                  </Text>
                </View>
              </View>
            </View>
            <Button
              onPress={() =>
                router.push(
                  `/rate-driver?orderId=${order.id}&driverId=${order.driverId}` as any
                )
              }
              size="md"
            >Calificar repartidor</Button>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Negocio</Text>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.businessAddress}>{business.location.address}</Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={20} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>Llamar al negocio</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
          <View style={styles.addressInfo}>
            <MapPin size={20} color={COLORS.gray[600]} />
            <View style={styles.addressText}>
              <Text style={styles.address}>{order.deliveryAddress.address}</Text>
              {order.deliveryAddress.notes && (
                <Text style={styles.addressNotes}>{order.deliveryAddress.notes}</Text>
              )}
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Productos ({order.items.length})</Text>
          <View style={styles.productsContainer}>
            {orderProducts.map((item) => {
              if (!item.product) return null;
              const { product } = item;
              
              return (
                <View key={item.productId} style={styles.productItem}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)} × {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.productTotal}>
                    ${(product.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pago</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Subtotal</Text>
            <Text style={styles.paymentValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Envío</Text>
            <Text style={styles.paymentValue}>${order.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </Card>

        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pedido realizado</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Método de pago</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>
        </View>
      </ScrollView>

      {canCancelOrder && (
        <View style={styles.footer}>
          <Button
            onPress={() => {
              console.log('[OrderDetail] Cancel order:', order.id);
            }}
            variant="outline"
            size="md"
          >Cancelar Pedido</Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[500],
    marginBottom: SPACING.lg,
  },
  backButton: {
    marginTop: SPACING.md,
  },
  trackingCard: {
    padding: SPACING.md,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  businessInfo: {
    marginBottom: SPACING.md,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
  },
  contactButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.primary,
  },
  addressInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addressText: {
    flex: 1,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  addressNotes: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    fontStyle: 'italic' as const,
  },
  productsContainer: {
    gap: SPACING.md,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[200],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  productTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  paymentLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  paymentValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
  orderInfo: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[900],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: SPACING.md,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  driverPhoto: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[200],
  },
  driverInfo: {
    flex: 1,
  },
  driverLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  driverName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRatingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
});
