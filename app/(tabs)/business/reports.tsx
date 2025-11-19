import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { MOCK_ORDERS } from '@/mocks/orders';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { useApp } from '@/providers/AppProvider';

const { width } = Dimensions.get('window');

type Period = 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const { businessProfile } = useApp();

  const businessId = businessProfile?.id || 'b1';

  const periods: { id: Period; label: string }[] = [
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
    { id: 'year', label: 'Año' },
  ];

  const stats = useMemo(() => {
    const orders = MOCK_ORDERS.filter((o) => o.businessId === businessId);
    const products = MOCK_PRODUCTS.filter((p) => p.businessId === businessId);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const topProducts = products
      .map((product) => {
        const soldCount = orders.reduce((count, order) => {
          const orderItem = order.items.find((item) => item.productId === product.id);
          return count + (orderItem?.quantity || 0);
        }, 0);
        return { ...product, soldCount };
      })
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    const dailySales = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length,
      };
    });

    const maxRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completionRate,
      topProducts,
      dailySales,
      maxRevenue,
      revenueGrowth: 12.5,
      ordersGrowth: -3.2,
    };
  }, [businessId, selectedPeriod]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Reportes' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.id && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.kpiGrid}>
          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: COLORS.accent + '20' }]}>
              <DollarSign size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.kpiValue}>${stats.totalRevenue.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>Ingresos Totales</Text>
            <View style={styles.kpiChange}>
              <TrendingUp size={14} color={COLORS.success} />
              <Text style={[styles.kpiChangeText, { color: COLORS.success }]}>
                +{stats.revenueGrowth.toFixed(1)}%
              </Text>
            </View>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <ShoppingBag size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiValue}>{stats.totalOrders}</Text>
            <Text style={styles.kpiLabel}>Pedidos Totales</Text>
            <View style={styles.kpiChange}>
              <TrendingDown size={14} color={COLORS.error} />
              <Text style={[styles.kpiChangeText, { color: COLORS.error }]}>
                {stats.ordersGrowth.toFixed(1)}%
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                <DollarSign size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>${stats.avgOrderValue.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Promedio por pedido</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Package size={20} color={COLORS.success} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stats.completionRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Tasa de éxito</Text>
              </View>
            </View>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Ventas Diarias</Text>
              <Text style={styles.chartSubtitle}>Últimos 7 días</Text>
            </View>
            <View style={styles.chartLegend}>
              <BarChart3 size={20} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.chart}>
            {stats.dailySales.map((day, index) => {
              const barHeight = (day.revenue / stats.maxRevenue) * 150;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <Text style={styles.barValue}>${day.revenue.toFixed(0)}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 10),
                          backgroundColor: COLORS.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{day.day}</Text>
                  <Text style={styles.barOrders}>{day.orders}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.topProductsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Productos</Text>
            <Package size={20} color={COLORS.accent} />
          </View>
          {stats.topProducts.map((product, index) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productRank}>
                <Text style={styles.productRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productSales}>
                  {product.soldCount} vendidos
                </Text>
              </View>
              <Text style={styles.productRevenue}>
                ${(product.price * product.soldCount).toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        <Card style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          <View style={styles.insightItem}>
            <View style={styles.insightDot} />
            <Text style={styles.insightText}>
              Tus ventas aumentaron un {stats.revenueGrowth.toFixed(1)}% esta semana
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={styles.insightDot} />
            <Text style={styles.insightText}>
              {stats.topProducts[0]?.name} es tu producto más vendido
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={styles.insightDot} />
            <Text style={styles.insightText}>
              Los días con más ventas son viernes y sábado
            </Text>
          </View>
        </Card>
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
    gap: SPACING.md,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  periodButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  periodText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[700],
  },
  periodTextActive: {
    color: COLORS.white,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  kpiCard: {
    flex: 1,
    padding: SPACING.lg,
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  kpiValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginVertical: 4,
  },
  kpiLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  kpiChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiChangeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
  },
  chartCard: {
    padding: SPACING.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  chartSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  chartLegend: {
    padding: SPACING.xs,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    width: '100%',
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: BORDER_RADIUS.sm,
    borderTopRightRadius: BORDER_RADIUS.sm,
    minHeight: 10,
  },
  barValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  barOrders: {
    fontSize: 10,
    color: COLORS.gray[500],
  },
  topProductsCard: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  productRankText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.accent,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.gray[900],
  },
  productSales: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
  },
  productRevenue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.accent,
  },
  insightsCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.info + '10',
    borderColor: COLORS.info + '40',
    borderWidth: 1,
  },
  insightsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.info,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
});
