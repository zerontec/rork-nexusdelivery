import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
// import { format, subDays } from 'date-fns';
// import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

export default function BusinessReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
  });
  const [dailySales, setDailySales] = useState<any[]>([]);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) return;

      // Fetch orders for the last 7 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .eq('business_id', business.id)
        .neq('status', 'cancelled')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate KPIs
      const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      setStats({
        totalSales,
        totalOrders,
        averageTicket
      });

      // Group by day
      const grouped = new Map();
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        const dayNum = date.getDate();
        const monthName = monthNames[date.getMonth()];

        grouped.set(dateStr, {
          date: dateStr,
          name: `${dayName} ${dayNum} ${monthName}`,
          amount: 0,
          count: 0
        });
      }

      orders.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split('T')[0];
        if (grouped.has(dateStr)) {
          const day = grouped.get(dateStr);
          day.amount += Number(order.total);
          day.count += 1;
        }
      });

      setDailySales(Array.from(grouped.values()).reverse()); // Newest first

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes Financieros</Text>
        <Text style={styles.headerSubtitle}>Últimos 7 días</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="cash-outline" size={20} color="#16a34a" />
            </View>
            <Text style={styles.kpiLabel}>Ventas Totales</Text>
            <Text style={styles.kpiValue}>${stats.totalSales.toFixed(2)}</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="cart-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.kpiLabel}>Pedidos</Text>
            <Text style={styles.kpiValue}>{stats.totalOrders}</Text>
          </View>
        </View>

        <View style={styles.kpiFullCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="trending-up-outline" size={20} color="#9333ea" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>Ticket Promedio</Text>
            <Text style={styles.kpiValue}>${stats.averageTicket.toFixed(2)}</Text>
          </View>
        </View>

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>Desglose Diario</Text>

        {dailySales.map((day) => (
          <View key={day.date} style={styles.dayRow}>
            <View>
              <Text style={styles.dayName}>{day.name}</Text>
              <Text style={styles.dayCount}>{day.count} pedidos</Text>
            </View>
            <Text style={styles.dayAmount}>${day.amount.toFixed(2)}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  kpiFullCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  dayCount: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  dayAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
