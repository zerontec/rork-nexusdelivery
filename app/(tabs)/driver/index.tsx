import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Package, DollarSign, Star, TrendingUp, History } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    earnings: 0,
    completed: 0,
    rating: 5.0,
  });
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [isApproved, setIsApproved] = useState(true);

  const fetchDriverData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data: driverProfile, error: driverError } = await supabase
        .from('drivers')
        .select('id, rating, reviews, is_approved')
        .eq('id', user.id)
        .single();

      if (driverError || !driverProfile) {
        console.error('Driver profile not found:', driverError);
        return;
      }

      const driverId = driverProfile.id;
      setIsApproved(driverProfile.is_approved || false);

      const { count: totalCompleted } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driverId)
        .eq('status', 'delivered');

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: todayOrders } = await supabase
        .from('orders')
        .select('delivery_fee')
        .eq('driver_id', driverId)
        .eq('status', 'delivered')
        .gte('created_at', startOfDay.toISOString());

      const todayEarnings = todayOrders?.reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0;

      setStats({
        earnings: todayEarnings,
        completed: totalCompleted || 0,
        rating: driverProfile.rating || 5.0,
      });

      const { data: active, error: activeError } = await supabase
        .from('orders')
        .select('*, business:businesses(*)')
        .eq('driver_id', driverId)
        .in('status', ['picking_up', 'in_transit']);

      if (activeError) throw activeError;
      setActiveOrders(active || []);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, business:businesses(*)')
        .eq('status', 'ready')
        .is('driver_id', null);

      if (ordersError) throw ordersError;
      setAvailableOrders(orders || []);

    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]);

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    try {
      const { data: driverProfile, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('id', user.id)
        .single();

      if (driverError || !driverProfile) {
        console.error('Driver profile not found:', driverError);
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverProfile.id
        })
        .eq('id', orderId);

      if (error) throw error;

      fetchDriverData();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'picking_up') nextStatus = 'in_transit';
    else if (currentStatus === 'in_transit') nextStatus = 'delivered';
    else return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchDriverData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const calculateDistance = () => {
    return (Math.random() * 5 + 1).toFixed(1);
  };

  const renderOrderCard = (order: any, isActive: boolean) => {
    const distance = calculateDistance();
    const estimatedPay = (order.delivery_fee || 2.50).toFixed(2);

    let actionButtonText = 'Aceptar';
    let actionButtonColor = COLORS.primary;

    if (isActive) {
      if (order.status === 'picking_up') {
        actionButtonText = 'Confirmar Recogida';
        actionButtonColor = COLORS.info;
      } else if (order.status === 'in_transit') {
        actionButtonText = 'Confirmar Entrega';
        actionButtonColor = COLORS.success;
      }
    }

    return (
      <Card key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.businessName}>
              {order.business?.name || 'Negocio'}
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
              {order.business?.location?.address || 'Dirección del negocio'}
            </Text>
          </View>
        </View>

        <View style={styles.addressContainer}>
          <View style={[styles.addressDot, styles.addressDotDelivery]} />
          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>Entregar en</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {order.deliveryAddress?.address || 'Dirección de entrega'}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.itemsInfo}>
            <Package size={16} color={COLORS.gray[600]} />
            <Text style={styles.itemsText}>
              Ver detalles
            </Text>
          </View>
          <Button
            onPress={() => isActive ? handleUpdateStatus(order.id, order.status) : handleAcceptOrder(order.id)}
            size="sm"
            style={{ backgroundColor: actionButtonColor }}
            testID={isActive ? `update-status-${order.id}` : `accept-order-${order.id}`}
          >
            {actionButtonText}
          </Button>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.gray[900] }}>Hola, {user?.user_metadata?.name || 'Driver'}</Text>
          <NotificationButton />
        </View>

        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Disponibilidad</Text>
              <Text style={[styles.statusText, isAvailable && styles.statusActive]}>
                {isAvailable ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: COLORS.gray[300], true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* Pending Approval Banner */}
        {!isApproved && (
          <Card style={styles.pendingBanner}>
            <View style={styles.pendingContent}>
              <View style={styles.pendingIcon}>
                <Clock size={24} color={COLORS.warning} />
              </View>
              <View style={styles.pendingText}>
                <Text style={styles.pendingTitle}>⚠️ Cuenta Pendiente de Aprobación</Text>
                <Text style={styles.pendingDescription}>
                  Tu solicitud está siendo revisada. Asegúrate de haber subido toda tu documentación.
                </Text>
                <TouchableOpacity
                  style={styles.uploadLinkButton}
                  onPress={() => router.push('/driver/documents')}
                >
                  <Text style={styles.uploadLinkText}>Subir/Ver Documentos →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/driver/earnings' as any)}
          >
            <Card style={styles.statCardInner}>
              <DollarSign size={24} color={COLORS.secondary} />
              <Text style={styles.statValue}>${stats.earnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Hoy</Text>
            </Card>
          </TouchableOpacity>
          <Card style={styles.statCard}>
            <Package size={24} color={COLORS.accent} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </Card>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/driver/ratings' as any)}
          >
            <Card style={styles.statCardInner}>
              <Star size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
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
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDriverData} />
        }
      >
        {activeOrders.length > 0 && (
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={styles.sectionTitle}>
              Pedidos Activos ({activeOrders.length})
            </Text>
            {activeOrders.map(order => renderOrderCard(order, true))}
          </View>
        )}

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
          availableOrders.map(order => renderOrderCard(order, false))
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
    textAlign: 'center',
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
    textAlign: 'center',
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
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
});