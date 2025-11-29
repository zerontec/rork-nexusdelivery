import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Package, MapPin, Clock, LogOut } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';
import { useOrders } from '@/providers/OrdersProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { Order, OrderStatus } from '@/types';

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return { text: 'Pendiente', color: COLORS.warning };
      case 'preparing':
      case 'ready':
        return { text: 'Preparando', color: COLORS.info };
      case 'assigned':
      case 'picking_up':
      case 'in_transit':
        return { text: 'En camino', color: COLORS.primary };
      case 'delivered':
        return { text: 'Entregado', color: COLORS.success };
      case 'cancelled':
        return { text: 'Cancelado', color: COLORS.error };
      default:
        return { text: status, color: COLORS.gray[500] };
    }
  };

  const info = getStatusInfo(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: info.color }]}>
      <Text style={styles.statusText}>{info.text}</Text>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: (order: Order) => void }) {
  return (
    <Card onPress={() => onPress(order)} style={styles.orderCard} testID={`order-${order.id}`}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Pedido #{order.id.slice(0, 8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailRow}>
          <Package size={16} color={COLORS.gray[600]} />
          <Text style={styles.orderDetailText}>{order.items.length} productos</Text>
        </View>
        <View style={styles.orderDetailRow}>
          <MapPin size={16} color={COLORS.gray[600]} />
          <Text style={styles.orderDetailText} numberOfLines={1}>
            {order.deliveryAddress.address}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
        {order.estimatedDelivery && (
          <View style={styles.estimateContainer}>
            <Clock size={14} color={COLORS.primary} />
            <Text style={styles.estimateText}>
              {new Date(order.estimatedDelivery).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { resetApp, currentRole, user } = useApp();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = React.useState<'available' | 'my_deliveries'>('available');

  const handleOrderPress = (order: Order) => {
    console.log('[Orders] Order pressed:', order.id);
    router.push(`/order-detail?id=${order.id}` as any);
  };

  const handleLogout = () => {
    console.log('[Orders] Logging out');
    resetApp();
    router.replace('/');
  };

  const filteredOrders = React.useMemo(() => {
    if (currentRole !== 'driver') return orders;

    if (activeTab === 'available') {
      return orders.filter(o => o.status === 'ready' && !o.driverId);
    } else {
      return orders.filter(o => o.driverId === user?.id);
    }
  }, [orders, currentRole, activeTab, user?.id]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentRole === 'driver' ? 'Panel de Repartidor' : 'Mis Pedidos',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color={COLORS.error} />
            </TouchableOpacity>
          ),
        }}
      />

      {currentRole === 'driver' && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Disponibles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my_deliveries' && styles.activeTab]}
            onPress={() => setActiveTab('my_deliveries')}
          >
            <Text style={[styles.tabText, activeTab === 'my_deliveries' && styles.activeTabText]}>
              Mis Entregas
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>
              {currentRole === 'driver'
                ? (activeTab === 'available' ? 'No hay pedidos disponibles' : 'No tienes entregas activas')
                : 'No tienes pedidos'}
            </Text>
            <Text style={styles.emptyText}>
              {currentRole === 'driver'
                ? (activeTab === 'available' ? 'Espera a que los negocios preparen pedidos' : 'Acepta un pedido para empezar')
                : 'Cuando realices un pedido, aparecerá aquí'}
            </Text>
            {currentRole !== 'driver' && (
              <Button onPress={() => router.push('/home' as any)} style={styles.emptyButton}>
                Explorar negocios
              </Button>
            )}
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onPress={handleOrderPress} />
            ))}
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
  logoutButton: {
    marginRight: SPACING.md,
  },
  content: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  ordersList: {
    gap: SPACING.md,
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
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.white,
  },
  orderDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  orderDetailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  estimateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[500],
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
