import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Package,
  Clock,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_ORDERS } from '@/mocks/orders';
import { MOCK_BUSINESSES } from '@/mocks/businesses';
import { useOrders } from '@/providers/OrdersProvider';

type OrderStep = 'pickup' | 'transit' | 'delivered';

export default function ActiveOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOrderStatus } = useOrders();
  const [currentStep, setCurrentStep] = useState<OrderStep>('pickup');
  const [elapsedTime, setElapsedTime] = useState(0);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const order = MOCK_ORDERS.find((o) => o.id === id);
  const business = order ? MOCK_BUSINESSES.find((b) => b.id === order.businessId) : null;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 60000);

    return () => {
      pulse.stop();
      clearInterval(timer);
    };
  }, [pulseAnim]);

  const handleNextStep = () => {
    if (currentStep === 'pickup') {
      console.log('[Driver] Picked up order:', id);
      updateOrderStatus(id, 'in_transit');
      setCurrentStep('transit');
    } else if (currentStep === 'transit') {
      console.log('[Driver] Delivered order:', id);
      updateOrderStatus(id, 'delivered');
      setCurrentStep('delivered');
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  };

  const getStepButton = () => {
    switch (currentStep) {
      case 'pickup':
        return 'Confirmar Recolección';
      case 'transit':
        return 'Confirmar Entrega';
      case 'delivered':
        return 'Pedido Entregado';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.gray[50] }]}>
      <View style={[styles.mapPlaceholder, { paddingTop: insets.top }]}>
        <View style={styles.mapHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.mapTitleContainer}>
            <Text style={styles.mapTitle}>
              {currentStep === 'pickup'
                ? 'Dirigiéndote al negocio'
                : currentStep === 'transit'
                ? 'En camino al cliente'
                : 'Pedido entregado'}
            </Text>
            {currentStep !== 'delivered' && (
              <View style={styles.timeBadge}>
                <Clock size={14} color={COLORS.secondary} />
                <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.stepIndicator}>
          <Animated.View
            style={[
              styles.stepDot,
              currentStep !== 'pickup' && styles.stepDotCompleted,
              currentStep === 'pickup' && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {currentStep !== 'pickup' ? (
              <CheckCircle size={20} color={COLORS.white} />
            ) : (
              <Package size={20} color={COLORS.white} />
            )}
          </Animated.View>
          <View
            style={[
              styles.stepLine,
              currentStep === 'delivered' && styles.stepLineCompleted,
            ]}
          />
          <Animated.View
            style={[
              styles.stepDot,
              currentStep === 'delivered' && styles.stepDotCompleted,
              currentStep === 'transit' && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <MapPin size={20} color={COLORS.white} />
          </Animated.View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'pickup' && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Recoger en</Text>
            <Text style={styles.infoBusinessName}>{business.name}</Text>
            <Text style={styles.infoAddress}>{business.location.address}</Text>
            <View style={styles.infoActions}>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => console.log('[Driver] Navigate to business')}
              >
                <Navigation size={20} color={COLORS.secondary} />
                <Text style={styles.infoButtonText}>Navegar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => console.log('[Driver] Call business')}
              >
                <Phone size={20} color={COLORS.secondary} />
                <Text style={styles.infoButtonText}>Llamar</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {currentStep === 'transit' && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Entregar en</Text>
            <Text style={styles.infoAddress}>{order.deliveryAddress.address}</Text>
            <View style={styles.infoActions}>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => console.log('[Driver] Navigate to customer')}
              >
                <Navigation size={20} color={COLORS.primary} />
                <Text style={styles.infoButtonText}>Navegar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => console.log('[Driver] Call customer')}
              >
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.infoButtonText}>Llamar</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {currentStep === 'delivered' && (
          <Card style={styles.successCard}>
            <CheckCircle size={64} color={COLORS.success} />
            <Text style={styles.successTitle}>¡Pedido entregado!</Text>
            <Text style={styles.successText}>
              Ganaste ${(order.total * 0.15 + 2.5).toFixed(2)}
            </Text>
          </Card>
        )}

        <Card style={styles.orderDetailsCard}>
          <Text style={styles.cardTitle}>Detalles del Pedido</Text>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>ID del pedido</Text>
            <Text style={styles.orderDetailValue}>#{order.id.slice(0, 8)}</Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Productos</Text>
            <Text style={styles.orderDetailValue}>{order.items.length}</Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Total</Text>
            <Text style={styles.orderDetailValue}>
              ${order.total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailLabel}>Tu ganancia</Text>
            <Text style={[styles.orderDetailValue, styles.earningsText]}>
              ${(order.total * 0.15 + 2.5).toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {currentStep !== 'delivered' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
          <Button onPress={handleNextStep} size="lg" testID="next-step-button">
            {getStepButton()}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 320,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'space-between',
    paddingBottom: SPACING.lg,
  },
  mapHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.gray[900],
  },
  mapTitleContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  mapTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start' as const,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.secondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  stepDot: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stepLine: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.sm,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.success,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  infoCard: {
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  infoBusinessName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[700],
    marginBottom: SPACING.md,
  },
  infoActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
  },
  infoButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  successCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.md,
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    marginTop: SPACING.xs,
  },
  orderDetailsCard: {
    padding: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  orderDetailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  orderDetailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  earningsText: {
    color: COLORS.secondary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});
