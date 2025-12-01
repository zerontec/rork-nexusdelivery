import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Phone, MapPin, Star } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/providers/AppProvider';
import { OrderTrackingMap } from '@/components/OrderTrackingMap';
import { supabase } from '@/lib/supabase';
import { Business, Driver, Product } from '@/types';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { orders } = useOrders();

  const [business, setBusiness] = useState<Business | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [client, setClient] = useState<any>(null);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const order = useMemo(() => {
    return orders.find((o) => o.id === id);
  }, [orders, id]);

  const { user, currentRole, businessProfile } = useApp();
  const { assignDriver, updateOrderStatus } = useOrders();

  const isDriver = currentRole === 'driver';
  const isBusiness = currentRole === 'business';
  const isClient = currentRole === 'client' || currentRole === 'customer';

  const isAssignedToMe = isDriver && order?.driverId === user?.id;
  const canAccept = isDriver && order?.status === 'ready' && !order?.driverId;
  const isMyBusinessOrder = isBusiness && order?.businessId === businessProfile?.id;

  useEffect(() => {
    if (!order) return;

    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        // Fetch Business
        if (order.businessId) {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', order.businessId)
            .single();
          if (businessData) setBusiness(businessData as any);
        }

        // Fetch Driver
        if (order.driverId) {
          const { data: driverData } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', order.driverId)
            .single();
          if (driverData) setDriver(driverData as any);
        }

        // Fetch Client (for driver or business)
        if (order.clientId && (isDriver || isBusiness)) {
          const { data: clientData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', order.clientId)
            .single();

          if (clientData) {
            setClient(clientData);
          }
        }

        // Fetch Products
        const productIds = order.items.map(i => i.productId);
        if (productIds.length > 0) {
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          if (productsData) {
            const map: Record<string, Product> = {};
            productsData.forEach((p: any) => {
              map[p.id] = p;
            });
            setProductsMap(map);
          }
        }
      } catch (error) {
        console.error('[OrderDetail] Error fetching details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [order, isDriver, isBusiness]);

  const orderProducts = useMemo(() => {
    if (!order) return [];
    return order.items.map((item) => ({
      ...item,
      product: productsMap[item.productId],
    }));
  }, [order, productsMap]);

  if (!order) {
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
  const canRate = order.status === 'delivered' && order.driverId && isClient;

  const handleAcceptOrder = async () => {
    if (!user) return;
    await assignDriver(order.id, user.id);
    router.back();
  };

  const handleUpdateStatus = async (newStatus: any) => {
    await updateOrderStatus(order.id, newStatus);
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancelar Pedido',
      '¿Estás seguro de que quieres cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, 'cancelled');
              router.back();
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'No se pudo cancelar el pedido');
            }
          },
        },
      ]
    );
  };

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
        {/* Business Actions */}
        {isMyBusinessOrder && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Gestionar Pedido</Text>
            <View style={styles.statusButtons}>
              {order.status === 'pending' && (
                <>
                  <Button onPress={() => handleUpdateStatus('confirmed')}>
                    Confirmar Pedido
                  </Button>
                  <Button
                    onPress={handleCancelOrder}
                    variant="outline"
                    style={{ marginTop: SPACING.sm, borderColor: COLORS.error }}
                    textStyle={{ color: COLORS.error }}
                  >
                    Rechazar Pedido
                  </Button>
                </>
              )}
              {order.status === 'confirmed' && (
                <Button onPress={() => handleUpdateStatus('preparing')}>
                  Empezar a Preparar
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button onPress={() => handleUpdateStatus('ready')} variant="primary">
                  Listo para Recoger
                </Button>
              )}
              {order.status === 'ready' && (
                <Text style={styles.driverInstruction}>
                  Esperando a que un repartidor acepte el pedido.
                </Text>
              )}
              {['assigned', 'picking_up', 'in_transit'].includes(order.status) && (
                <Text style={styles.driverInstruction}>
                  Pedido en proceso de entrega por el repartidor.
                </Text>
              )}
            </View>
          </Card>
        )}

        {/* Driver Accept Order */}
        {canAccept && (
          <Card style={[styles.section, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>Pedido Disponible</Text>
            <Text style={styles.driverInstruction}>
              Este pedido está listo para ser recogido en {business?.name}.
            </Text>
            <Button onPress={handleAcceptOrder} style={{ marginTop: SPACING.md }}>
              Aceptar Pedido
            </Button>
          </Card>
        )}

        {/* Driver Manage Delivery */}
        {isAssignedToMe && order.status !== 'delivered' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Gestionar Entrega</Text>
            <View style={styles.statusButtons}>
              {order.status === 'assigned' && (
                <Button onPress={() => handleUpdateStatus('picking_up')}>
                  Confirmar Recogida
                </Button>
              )}
              {order.status === 'picking_up' && (
                <Button onPress={() => handleUpdateStatus('in_transit')}>
                  En Camino
                </Button>
              )}
              {order.status === 'in_transit' && (
                <Button onPress={() => handleUpdateStatus('delivered')} variant="primary">
                  Confirmar Entrega
                </Button>
              )}
            </View>
          </Card>
        )}

        {/* Tracking */}
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

        {/* Driver Info */}
        {driver && order.driverId && (
          <Card style={styles.section}>
            <View style={styles.driverHeader}>
              <Image source={{ uri: driver.photo || 'https://via.placeholder.com/64' }} style={styles.driverPhoto} />
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
            {driver.phone && (isClient) && (
              <TouchableOpacity
                style={[styles.contactButton, { marginTop: SPACING.md }]}
                onPress={() => Linking.openURL(`tel:${driver.phone}`)}
              >
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>Llamar al Repartidor</Text>
              </TouchableOpacity>
            )}
            {canRate && !isDriver && (
              <Button
                onPress={() =>
                  router.push(
                    `/rate-driver?orderId=${order.id}&driverId=${order.driverId}` as any
                  )
                }
                size="md"
                style={{ marginTop: SPACING.md }}
              >Calificar repartidor</Button>
            )}
          </Card>
        )}

        {/* Business Info */}
        {business && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Negocio</Text>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessAddress}>{business.location?.address}</Text>
            </View>
            {business.phone && !isBusiness && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${business.phone}`)}
              >
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>Llamar al Negocio</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Delivery Address */}
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
          {client?.phone && (isDriver || isBusiness) && (
            <View style={{ marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray[200] }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.gray[600], marginBottom: SPACING.xs }}>
                Teléfono del cliente: <Text style={{ color: COLORS.gray[900], fontWeight: '600' }}>{client.phone}</Text>
              </Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${client.phone}`)}
              >
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>Llamar al Cliente</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Products */}
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

        {/* Payment Summary */}
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

        {/* Order Info */}
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

        {canCancelOrder && !isBusiness && (
          <View style={styles.footer}>
            <Button
              onPress={handleCancelOrder}
              variant="outline"
              size="md"
              style={{ borderColor: COLORS.error }}
              textStyle={{ color: COLORS.error }}
            >Cancelar Pedido</Button>
          </View>
        )}
      </ScrollView>
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
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  statusButtons: {
    gap: SPACING.sm,
  },
  driverInstruction: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
    padding: SPACING.md,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
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
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  driverName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
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
  businessInfo: {
    marginBottom: SPACING.md,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
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
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
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
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  productTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
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
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
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
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});
