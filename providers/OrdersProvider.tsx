import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { Order, OrderStatus } from '@/types';
import { MOCK_ORDERS } from '@/mocks/orders';

type OrdersContextValue = {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  assignDriver: (orderId: string, driverId: string) => void;
};

export const [OrdersProvider, useOrders] = createContextHook((): OrdersContextValue => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const getOrderById = useCallback((id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: OrderStatus): Order[] => {
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    console.log('[OrdersProvider] Updating order status:', id, status);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  }, []);

  const assignDriver = useCallback((orderId: string, driverId: string) => {
    console.log('[OrdersProvider] Assigning driver:', orderId, driverId);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, driverId, status: 'assigned' as OrderStatus }
          : order
      )
    );
  }, []);

  return useMemo(
    () => ({
      orders,
      getOrderById,
      getOrdersByStatus,
      updateOrderStatus,
      assignDriver,
    }),
    [orders, getOrderById, getOrdersByStatus, updateOrderStatus, assignDriver]
  );
});
