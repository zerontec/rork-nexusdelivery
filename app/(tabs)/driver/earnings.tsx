import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

type Period = 'today' | 'week' | 'month';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');

  const earnings = {
    today: 145.5,
    week: 892.3,
    month: 3420.8,
  };

  const stats = {
    today: { orders: 12, hours: 6.5, avgPerOrder: 12.13 },
    week: { orders: 68, hours: 42, avgPerOrder: 13.12 },
    month: { orders: 285, hours: 178, avgPerOrder: 12.0 },
  };

  const recentPayments = [
    { date: '2025-01-11', amount: 145.5, orders: 12 },
    { date: '2025-01-10', amount: 132.3, orders: 11 },
    { date: '2025-01-09', amount: 158.7, orders: 13 },
    { date: '2025-01-08', amount: 124.2, orders: 10 },
    { date: '2025-01-07', amount: 167.9, orders: 14 },
  ];

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
