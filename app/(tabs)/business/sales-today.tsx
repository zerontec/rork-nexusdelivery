import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  ChevronRight,
  Calendar,
  Clock,
  User,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';
import { useOrders } from '@/providers/OrdersProvider';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export default function SalesTodayScreen() {
  const router = useRouter();
  const { businessProfile } = useApp();
  const { orders, isLoading: isLoadingOrders } = useOrders();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});

  const businessId = businessProfile?.id;

  // Fetch products to show details in top products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!businessId) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('business_id', businessId);

        if (error) throw error;

        if (data) {
          const map: Record<string, Product> = {};
          data.forEach((p: any) => {
            map[p.id] = { ...p, businessId: p.business_id };
          });
          setProductsMap(map);
        }
      } catch (error) {
        console.error('Error fetching products for sales stats:', error);
      }
    };

    fetchProducts();
  }, [businessId]);

  const filteredOrders = useMemo(() => {
    if (!businessId) return [];

    const today = new Date();
    let filtered = orders.filter((o) => o.businessId === businessId);

    if (selectedPeriod === 'today') {
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= weekAgo;
      });
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= monthAgo;
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [businessId, orders, selectedPeriod]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const productsSold = filteredOrders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      productsSold,
      completionRate,
    };
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productQuantities: Record<string, { quantity: number; revenue: number }> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productQuantities[item.productId]) {
          productQuantities[item.productId] = { quantity: 0, revenue: 0 };
        }
        productQuantities[item.productId].quantity += item.quantity;
        productQuantities[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.entries(productQuantities)
      .map(([productId, data]) => {
        const product = productsMap[productId];
        return {
          productId,
          product,
          ...data,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders, productsMap]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'preparing':
        return COLORS.info;
      case 'ready':
        return COLORS.success;
      case 'delivered':
        return COLORS.gray[500];
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.gray[500];
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      assigned: 'Asignado',
      picking_up: 'Recogiendo',
      in_transit: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today':
        return 'Hoy';
      case 'week':
        return 'Esta Semana';
      case 'month':
        return 'Este Mes';
      default:
        return 'Hoy';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Detalles de Ventas',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View style={styles.revenueIcon}>
              <DollarSign size={32} color={COLORS.white} />
            </View>
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueLabel}>Ingresos {getPeriodLabel()}</Text>
              <Text style={styles.revenueAmount}>${stats.totalRevenue.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <ShoppingBag size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.accent + '20' }]}>
              <DollarSign size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.statValue}>${stats.avgOrderValue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Package size={20} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{stats.productsSold}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.info + '20' }]}>
              <TrendingUp size={20} color={COLORS.info} />
            </View>
            <Text style={styles.statValue}>{stats.completionRate.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </Card>
        </View>

        {topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
            {topProducts.map((item, index) => (
              <Card key={item.productId} style={styles.productCard}>
                <View style={styles.productRank}>
                  <Text style={styles.productRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product?.name || 'Producto'}
                  </Text>
                  <Text style={styles.productStats}>
                    {item.quantity} vendidos • ${item.revenue.toFixed(2)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView >
    </View >
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    gap: 4,
    ...SHADOWS.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.accent,
  },
  periodButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  revenueCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.accent,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  revenueIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white + 'CC',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productRankText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.accent,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  productStats: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
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
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  orderId: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  orderTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderTimeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[500],
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
    marginBottom: SPACING.sm,
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.accent,
  },
});
