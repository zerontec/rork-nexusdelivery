import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, DollarSign, ShoppingBag, Clock, AlertCircle, Package, TrendingUp, BarChart3 } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

export default function BusinessDashboardScreen() {
  const router = useRouter();
  const { businessProfile } = useApp();
  const businessName = businessProfile?.businessName || 'Negocio';
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    activeOrders: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!businessProfile?.id) return;

    try {
      setIsLoading(true);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch today's orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessProfile.id)
        .gte('created_at', startOfDay.toISOString());

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('Business Profile ID:', businessProfile.id);
      console.log('Start of Day:', startOfDay.toISOString());
      console.log('Orders found:', orders?.length);


      // Calculate stats
      const todayOrders = orders?.length || 0;
      const todayRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const activeOrders = orders?.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'picking_up', 'in_transit'].includes(o.status)).length || 0;

      // Fetch low stock count
      const { count: lowStockCount, error: stockError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessProfile.id)
        .lt('stock', 10);

      if (stockError) throw stockError;

      setStats({
        todayRevenue,
        todayOrders,
        activeOrders,
        lowStockCount: lowStockCount || 0,
      });

      // Fetch recent orders (last 5)
      const { data: recent, error: recentError } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('business_id', businessProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentOrders(recent || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [businessProfile?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'preparing': return COLORS.info;
      case 'ready': return COLORS.success;
      case 'picking_up': return COLORS.secondary;
      case 'in_transit': return COLORS.secondary;
      case 'delivered': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.gray[500];
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      picking_up: 'Recogiendo',
      in_transit: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {businessName}</Text>
            <Text style={styles.subGreeting}>Aquí está tu resumen de hoy</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <NotificationButton />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/business/add-product' as any)}
            >
              <Plus size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCardTouchable}
            onPress={() => router.push('/business/sales-today' as any)}
          >
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.accent + '20' }]}>
                <DollarSign size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>${stats.todayRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Ventas Hoy</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCardTouchable}
            onPress={() => router.push('/business/sales-today' as any)}
          >
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <ShoppingBag size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{stats.todayOrders}</Text>
              <Text style={styles.statLabel}>Pedidos Hoy</Text>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCardHorizontal}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.info + '20' }]}>
              <Clock size={20} color={COLORS.info} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.activeOrders}</Text>
              <Text style={styles.statLabel}>Pedidos Activos</Text>
            </View>
          </Card>

          <TouchableOpacity
            style={styles.statCardHorizontal}
            onPress={() => router.push('/business/inventory' as any)}
          >
            <Card style={styles.statCardHorizontalInner}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stats.lowStockCount > 0 ? COLORS.error + '20' : COLORS.success + '20' },
                ]}
              >
                {stats.lowStockCount > 0 ? (
                  <AlertCircle size={20} color={COLORS.error} />
                ) : (
                  <Package size={20} color={COLORS.success} />
                )}
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stats.lowStockCount}</Text>
                <Text style={styles.statLabel}>Stock Bajo</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/business/add-product' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.accent + '20' }]}>
                <Plus size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.actionLabel}>Nuevo Producto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/business/inventory' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Package size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Inventario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/business/offers' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '20' }]}>
                <TrendingUp size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionLabel}>Ofertas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/business/reports' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.info + '20' }]}>
                <BarChart3 size={24} color={COLORS.info} />
              </View>
              <Text style={styles.actionLabel}>Reportes</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos Recientes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.orderDetail}>
                  <Package size={16} color={COLORS.gray[600]} />
                  <Text style={styles.orderDetailText}>
                    {order.items?.length || 0} productos
                  </Text>
                </View>
                <Text style={styles.orderTotal}>${(order.total || 0).toFixed(2)}</Text>
              </View>

              <Text style={styles.orderTime}>
                {new Date(order.created_at || order.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Card>
          ))}
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
  content: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  subGreeting: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCardTouchable: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statCardHorizontal: {
    flex: 1,
  },
  statCardHorizontalInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActions: {
    gap: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  section: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  orderCard: {
    padding: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderId: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  orderDetailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.accent,
  },
  orderTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
  },
});
