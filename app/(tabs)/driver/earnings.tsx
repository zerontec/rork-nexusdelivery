import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

type Period = 'today' | 'week' | 'month';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');

  const { user } = useApp();
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
  });
  const [stats, setStats] = useState({
    today: { orders: 0, hours: 0, avgPerOrder: 0 },
    week: { orders: 0, hours: 0, avgPerOrder: 0 },
    month: { orders: 0, hours: 0, avgPerOrder: 0 },
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEarnings = async () => {
      setIsLoading(true);
      try {
        // Get driver's profile id first
        const { data: driverProfile } = await supabase
          .from('drivers')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!driverProfile) {
          console.log('[Earnings] Driver profile not found');
          setIsLoading(false);
          return;
        }

        const driverId = driverProfile.id;

        // Fetch all delivered orders for this driver
        const { data: orders } = await supabase
          .from('orders')
          .select('created_at, delivery_fee, total')
          .eq('driver_id', driverId)
          .eq('status', 'delivered')
          .order('created_at', { ascending: false });

        if (orders) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          let todaySum = 0, weekSum = 0, monthSum = 0;
          let todayCount = 0, weekCount = 0, monthCount = 0;

          const paymentsMap: Record<string, { amount: number, orders: number }> = {};

          orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const amount = order.delivery_fee || 0;

            // Use local date string for grouping
            const localDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;

            // Check if it's today (local time)
            const isToday = orderDate.getDate() === now.getDate() &&
              orderDate.getMonth() === now.getMonth() &&
              orderDate.getFullYear() === now.getFullYear();

            // Today
            if (isToday) {
              todaySum += amount;
              todayCount++;
            }

            // Week
            if (orderDate >= oneWeekAgo) {
              weekSum += amount;
              weekCount++;
            }

            // Month
            if (orderDate >= oneMonthAgo) {
              monthSum += amount;
              monthCount++;
            }

            // Group for recent payments using local date
            if (!paymentsMap[localDateStr]) {
              paymentsMap[localDateStr] = { amount: 0, orders: 0 };
            }
            paymentsMap[localDateStr].amount += amount;
            paymentsMap[localDateStr].orders += 1;
          });

          setEarnings({
            today: todaySum,
            week: weekSum,
            month: monthSum,
          });

          setStats({
            today: { orders: todayCount, hours: todayCount * 0.5, avgPerOrder: todayCount ? todaySum / todayCount : 0 },
            week: { orders: weekCount, hours: weekCount * 0.5, avgPerOrder: weekCount ? weekSum / weekCount : 0 },
            month: { orders: monthCount, hours: monthCount * 0.5, avgPerOrder: monthCount ? monthSum / monthCount : 0 },
          });

          // Convert paymentsMap to array
          const paymentsArray = Object.keys(paymentsMap)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .slice(0, 5)
            .map(date => ({
              date,
              amount: paymentsMap[date].amount,
              orders: paymentsMap[date].orders,
            }));

          setRecentPayments(paymentsArray);
        }
      } catch (error) {
        console.error('[Earnings] Error fetching earnings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [user]);

  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Ganancias' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.totalCard}>
          <DollarSign size={32} color={COLORS.secondary} />
          <Text style={styles.totalAmount}>${earnings[selectedPeriod].toFixed(2)}</Text>
          <Text style={styles.totalLabel}>Ganancias {periods.find((p) => p.id === selectedPeriod)?.label.toLowerCase()}</Text>
        </Card>

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

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{stats[selectedPeriod].orders}</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.statValue}>{stats[selectedPeriod].hours}h</Text>
            <Text style={styles.statLabel}>Horas</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Award size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>${stats[selectedPeriod].avgPerOrder.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagos Recientes</Text>
          {recentPayments.map((payment, index) => (
            <Card key={index} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View>
                  <Text style={styles.paymentDate}>{payment.date}</Text>
                  <Text style={styles.paymentOrders}>
                    {payment.orders} pedidos
                  </Text>
                </View>
                <Text style={styles.paymentAmount}>
                  ${payment.amount.toFixed(2)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Consejo</Text>
          <Text style={styles.infoText}>
            Los pedidos de mayor distancia suelen tener mejor pago. Mantén tu
            calificación alta para recibir más pedidos premium.
          </Text>
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
  totalCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
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
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  periodText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  periodTextActive: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  paymentCard: {
    padding: SPACING.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  paymentOrders: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  paymentAmount: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
  },
  infoCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.info + '10',
    borderColor: COLORS.info + '40',
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
});
