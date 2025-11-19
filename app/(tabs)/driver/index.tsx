import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  History,
  Star,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_ORDERS } from '@/mocks/orders';
import { MOCK_BUSINESSES } from '@/mocks/businesses';
import { MOCK_PRODUCTS } from '@/mocks/products';

export default function DriverDashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  const availableOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => order.status === 'ready' && !order.driverId);
  }, []);

  const todayEarnings = 145.5;
  const completedToday = 12;

  const handleAcceptOrder = (orderId: string) => {
    console.log('[Driver] Accepting order:', orderId);
    router.push(`/driver/active-order?id=${orderId}` as any);
  };

  const getBusinessName = (businessId: string) => {
    return MOCK_BUSINESSES.find((b) => b.id === businessId)?.name || 'Negocio';
  };

  const calculateDistance = () => {
    return (Math.random() * 4 + 0.5).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Estado</Text>
              <Text style={[styles.statusText, isAvailable && styles.statusActive]}>
                {isAvailable ? 'Disponible' : 'No disponible'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: COLORS.gray[300], true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/driver/earnings' as any)}
          >
            <Card style={styles.statCardInner}>
              <DollarSign size={24} color={COLORS.secondary} />
              <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Hoy</Text>
            </Card>
          </TouchableOpacity>
          <Card style={styles.statCard}>
            <Package size={24} color={COLORS.accent} />
            <Text style={styles.statValue}>{completedToday}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </Card>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/driver/ratings' as any)}
          >
            <Card style={styles.statCardInner}>
              <Star size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/driver/earnings' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
              <TrendingUp size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.quickActionLabel}>Ganancias</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/driver/history' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <History size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/driver/ratings' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Star size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.quickActionLabel}>Calificaciones</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.ordersContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersContent}
      >
        <Text style={styles.sectionTitle}>
          Pedidos Disponibles ({availableOrders.length})
        </Text>

        {!isAvailable && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningText}>
              Activa tu disponibilidad para recibir pedidos
            </Text>
          </Card>
        )}

        {availableOrders.length === 0 && isAvailable ? (
          <Card style={styles.emptyCard}>
            <Package size={48} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>No hay pedidos disponibles</Text>
            <Text style={styles.emptyText}>
              Te notificaremos cuando haya nuevos pedidos
            </Text>
          </Card>
        ) : (
          availableOrders.map((order) => {
            const distance = calculateDistance();
            const estimatedPay = (order.total * 0.15 + 2.5).toFixed(2);

            return (
              <Card key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.businessName}>
                      {getBusinessName(order.businessId)}
                    </Text>
                    <View style={styles.orderInfo}>
                      <MapPin size={14} color={COLORS.gray[600]} />
                      <Text style={styles.orderInfoText}>{distance} km</Text>
                      <Clock size={14} color={COLORS.gray[600]} />
                      <Text style={styles.orderInfoText}>~15 min</Text>
                    </View>
                  </View>
                  <View style={styles.paymentBadge}>
                    <Text style={styles.paymentText}>${estimatedPay}</Text>
                  </View>
                </View>

                <View style={styles.addressContainer}>
                  <View style={styles.addressDot} />
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressLabel}>Recoger en</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {MOCK_BUSINESSES.find((b) => b.id === order.businessId)?.location.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.addressContainer}>
                  <View style={[styles.addressDot, styles.addressDotDelivery]} />
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressLabel}>Entregar en</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {order.deliveryAddress.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.itemsInfo}>
                    <Package size={16} color={COLORS.gray[600]} />
                    <Text style={styles.itemsText}>
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    </Text>
                  </View>
                  <Button
                    onPress={() => handleAcceptOrder(order.id)}
                    size="sm"
                    testID={`accept-order-${order.id}`}
                  >
                    Aceptar
                  </Button>
                </View>
              </Card>
            );
          })
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
  header: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statusCard: {
    padding: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[500],
  },
  statusActive: {
    color: COLORS.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
  },
  statCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  ordersContainer: {
    flex: 1,
  },
  ordersContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  warningCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
    borderWidth: 1,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center' as const,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[700],
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center' as const,
  },
  orderCard: {
    padding: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderInfoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginRight: SPACING.sm,
  },
  paymentBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  paymentText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  addressDotDelivery: {
    backgroundColor: COLORS.primary,
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  itemsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.gray[900],
  },
});
