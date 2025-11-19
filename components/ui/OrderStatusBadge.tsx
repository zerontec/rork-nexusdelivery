import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '@/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

type OrderStatusBadgeProps = {
  status: OrderStatus;
  testID?: string;
};

export function OrderStatusBadge({ status, testID }: OrderStatusBadgeProps) {
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', color: COLORS.warning };
      case 'confirmed':
        return { text: 'Confirmado', color: COLORS.info };
      case 'preparing':
        return { text: 'Preparando', color: COLORS.info };
      case 'ready':
        return { text: 'Listo', color: COLORS.success };
      case 'assigned':
        return { text: 'Asignado', color: COLORS.primary };
      case 'picking_up':
        return { text: 'Recogiendo', color: COLORS.primary };
      case 'in_transit':
        return { text: 'En camino', color: COLORS.primary };
      case 'delivered':
        return { text: 'Entregado', color: COLORS.success };
      case 'cancelled':
        return { text: 'Cancelado', color: COLORS.error };
      default:
        return { text: status, color: COLORS.gray[500] };
    }
  };

  const info = getStatusInfo(status);

  return (
    <View style={[styles.badge, { backgroundColor: info.color }]} testID={testID}>
      <Text style={styles.text}>{info.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.white,
  },
});
