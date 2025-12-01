import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  Package,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

type FilterStatus = 'all' | 'completed' | 'cancelled';

export default function DriverHistoryScreen() {
  const { user } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        console.log('[DriverHistory] Fetching orders for driver user:', user.id);

        // Get driver's profile id first
        const { data: driverProfile } = await supabase
          .from('drivers')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!driverProfile) {
          console.log('[DriverHistory] Driver profile not found');
          setAllOrders([]);
          return;
        }

        const driverId = driverProfile.id;
        console.log('[DriverHistory] Found driver profile:', driverId);

        // Fetch orders without business relationship
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('driver_id', driverId)
          .in('status', ['delivered', 'cancelled'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[DriverHistory] Error:', error);
          setAllOrders([]);
          return;
        }

        if (orders && orders.length > 0) {
          console.log('[DriverHistory] Found orders:', orders.length);

          // Fetch business info for each order
          const ordersWithBusiness = await Promise.all(
            orders.map(async (order) => {
              let businessData = null;
              if (order.business_id) {
                const { data } = await supabase
                  .from('businesses')
                  .select('*')
                  .eq('id', order.business_id)
                  .single();
                businessData = data;
              }

              return {
                ...order,
                business: businessData,
                // Ensure createdAt is available if it's named created_at in DB
                createdAt: order.created_at
              };
            })
          );

          setAllOrders(ordersWithBusiness);
        } else {
          console.log('[DriverHistory] No orders found');
          setAllOrders([]);
        }
      } catch (error) {
        console.error('[DriverHistory] Error fetching history:', error);
        setAllOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const deliveredOrders = useMemo(() => {
    if (filter === 'all') return allOrders;
    if (filter === 'completed') {
      return allOrders.filter((o) => o.status === 'delivered');
    }
    return allOrders.filter((o) => o.status === 'cancelled');
  }, [allOrders, filter]);

  const stats = useMemo(() => {
    const completed = allOrders.filter((o) => o.status === 'delivered');
    const cancelled = allOrders.filter((o) => o.status === 'cancelled');
    const totalEarnings = completed.reduce(
      (sum: number, o: any) => sum + (o.delivery_fee || 0),
      0
    );

    return {
      total: allOrders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      totalEarnings,
    };
  }, [allOrders]);

  const filters: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: stats.total },
    { id: 'completed', label: 'Completados', count: stats.completed },
    { id: 'cancelled', label: 'Cancelados', count: stats.cancelled },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') {
      return <CheckCircle size={20} color={COLORS.success} />;
    }
    return <XCircle size={20} color={COLORS.error} />;
  };

  const getStatusColor = (status: string) => {
    return status === 'delivered' ? COLORS.success : COLORS.error;
  };

  const getStatusLabel = (status: string) => {
    return status === 'delivered' ? 'Entregado' : 'Cancelado';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Historial de Entregas' }} />

      <View style={styles.header}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Package size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Entregas</Text>
          </Card>
          <Card style={styles.statCard}>
            <DollarSign size={24} color={COLORS.accent} />
            <Text style={styles.statValue}>${stats.totalEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Ganado</Text>
          </Card>
        </View>

        <View style={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterButton,
                filter === f.id && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.id && styles.filterTextActive,
                ]}
              >
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {isLoading ? (
          <Card style={styles.emptyCard}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.emptyText}>Cargando historial...</Text>
          </Card>
        ) : deliveredOrders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Package size={48} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>No hay entregas</Text>
            <Text style={styles.emptyText}>
              Tu historial de entregas aparecerá aquí
            </Text>
          </Card>
        ) : (
          deliveredOrders.map((order) => {
            const earnings = (order.delivery_fee || 0).toFixed(2);

            return (
              <Card key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    {getStatusIcon(order.status)}
                    <View>
                      <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                      <Text style={styles.businessName}>
                        {order.business?.name || 'Negocio'}
                      </Text>
                    </View>
                  </View>
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
                  <View style={styles.orderDetailRow}>
                    <MapPin size={14} color={COLORS.gray[600]} />
                    <Text style={styles.orderDetailText} numberOfLines={1}>
                      {order.business?.location?.address || 'Dirección del negocio'}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <MapPin size={14} color={COLORS.primary} />
                    <Text style={styles.orderDetailText} numberOfLines={1}>
                      {order.delivery_address?.address || order.deliveryAddress?.address || 'Dirección de entrega'}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.orderDate}>
                    <Calendar size={14} color={COLORS.gray[500]} />
                    <Text style={styles.orderDateText}>
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <Clock size={14} color={COLORS.gray[500]} />
                    <Text style={styles.orderDateText}>
                      {new Date(order.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {order.status === 'delivered' && (
                    <View style={styles.earningsBadge}>
                      <DollarSign size={16} color={COLORS.secondary} />
                      <Text style={styles.earningsText}>${earnings}</Text>
                    </View>
                  )}
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[700],
  },
  filterTextActive: {
    color: COLORS.white,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
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
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  orderId: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.gray[900],
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  orderDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
  },
  orderDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  orderDateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
    marginRight: SPACING.sm,
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  earningsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.secondary,
  },
});
