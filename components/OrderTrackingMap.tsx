import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MapPin, Bike, Package, CheckCircle, Navigation } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { OrderStatus } from '@/types';

type OrderTrackingMapProps = {
  status: OrderStatus;
  estimatedTime?: string;
  driverLocation?: { lat: number; lng: number };
  driverName?: string;
  testID?: string;
};

export function OrderTrackingMap({
  status,
  estimatedTime = '15-20 min',
  driverLocation,
  driverName,
  testID,
}: OrderTrackingMapProps) {
  const [progress, setProgress] = useState(0);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const [simulatedLocation, setSimulatedLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        setProgress(0.25);
        break;
      case 'preparing':
        setProgress(0.4);
        break;
      case 'ready':
        setProgress(0.5);
        break;
      case 'assigned':
      case 'picking_up':
        setProgress(0.65);
        break;
      case 'in_transit':
        setProgress(0.85);
        break;
      case 'delivered':
        setProgress(1);
        break;
      default:
        setProgress(0);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'in_transit' || status === 'picking_up') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      const locationInterval = setInterval(() => {
        setSimulatedLocation({
          lat: Math.random() * 0.01,
          lng: Math.random() * 0.01,
        });
      }, 3000);

      return () => {
        pulse.stop();
        clearInterval(locationInterval);
      };
    }
  }, [status, pulseAnim]);

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'Buscando repartidor...';
      case 'preparing':
        return 'Tu pedido está siendo preparado';
      case 'ready':
        return 'Tu pedido está listo';
      case 'assigned':
      case 'picking_up':
        return 'El repartidor va camino al negocio';
      case 'in_transit':
        return 'Tu pedido está en camino';
      case 'delivered':
        return '¡Pedido entregado!';
      default:
        return 'Procesando pedido...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return <Package size={32} color={COLORS.primary} />;
      case 'assigned':
      case 'picking_up':
      case 'in_transit':
        return <Bike size={32} color={COLORS.secondary} />;
      case 'delivered':
        return <CheckCircle size={32} color={COLORS.success} />;
      default:
        return <MapPin size={32} color={COLORS.primary} />;
    }
  };

  const isDriverMoving = status === 'in_transit' || status === 'picking_up';

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapContent}>
          {isDriverMoving ? (
            <Animated.View
              style={[
                styles.driverMarker,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Bike size={32} color={COLORS.white} />
            </Animated.View>
          ) : (
            getStatusIcon()
          )}
          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
          {driverName && isDriverMoving && (
            <View style={styles.driverInfoBadge}>
              <Navigation size={16} color={COLORS.secondary} />
              <Text style={styles.driverName}>{driverName} está en camino</Text>
            </View>
          )}
          {status !== 'delivered' && (
            <Text style={styles.estimatedTime}>
              Tiempo estimado: {estimatedTime}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <View
            style={[
              styles.stepDot,
              progress >= 0.25 && styles.stepDotActive,
            ]}
          >
            <Package size={16} color={COLORS.white} />
          </View>
          <Text style={styles.stepLabel}>Confirmado</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.step}>
          <View
            style={[
              styles.stepDot,
              progress >= 0.5 && styles.stepDotActive,
            ]}
          >
            <Package size={16} color={COLORS.white} />
          </View>
          <Text style={styles.stepLabel}>Preparando</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.step}>
          <View
            style={[
              styles.stepDot,
              progress >= 0.75 && styles.stepDotActive,
            ]}
          >
            <Bike size={16} color={COLORS.white} />
          </View>
          <Text style={styles.stepLabel}>En camino</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.step}>
          <View
            style={[
              styles.stepDot,
              progress >= 1 && styles.stepDotActive,
            ]}
          >
            <CheckCircle size={16} color={COLORS.white} />
          </View>
          <Text style={styles.stepLabel}>Entregado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%' as const,
  },
  mapPlaceholder: {
    height: 240,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden' as const,
  },
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  statusMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.md,
    textAlign: 'center' as const,
  },
  estimatedTime: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    marginTop: SPACING.sm,
  },
  progressContainer: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  step: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.xs,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    textAlign: 'center' as const,
    maxWidth: 60,
  },
  driverMarker: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  driverInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  driverName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
});
