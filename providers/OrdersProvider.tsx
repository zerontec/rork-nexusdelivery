import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { supabase } from '@/lib/supabase';

type OrdersContextValue = {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  assignDriver: (orderId: string, driverId: string) => Promise<void>;
  isLoading: boolean;
};

import { useApp } from '@/providers/AppProvider';

export const [OrdersProvider, useOrders] = createContextHook((): OrdersContextValue => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, currentRole, businessProfile } = useApp();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setIsLoading(false);
    }

    const subscription = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[OrdersProvider] Realtime update:', payload);
          // Refresh orders on any change to ensure consistency with relations
          if (user) fetchOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentRole, businessProfile?.id]);

  const fetchOrders = async () => {
    try {
      if (!user) return;

      console.log('[OrdersProvider] Fetching orders for role:', currentRole);
      console.log('[OrdersProvider] Business Profile ID:', businessProfile?.id);
      console.log('[OrdersProvider] User ID:', user.id);

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (currentRole === 'client') {
        console.log('[OrdersProvider] Filtering by client_id:', user.id);
        query = query.eq('client_id', user.id);
      } else if (currentRole === 'business' && businessProfile?.id) {
        console.log('[OrdersProvider] Filtering by business_id:', businessProfile.id);
        query = query.eq('business_id', businessProfile.id);
      } else if (currentRole === 'driver') {
        console.log('[OrdersProvider] Filtering for driver:', user.id);
        // Show orders assigned to this driver OR orders ready for pickup (available)
        query = query.or(`driver_id.eq.${user.id},and(status.eq.ready,driver_id.is.null)`);
      }


      const { data, error } = await query;

      if (error) {
        console.error('[OrdersProvider] Error executing query:', error);
        throw error;
      }

      console.log('[OrdersProvider] Fetched orders:', data?.length, 'orders');
      if (currentRole === 'driver') {
        console.log('[OrdersProvider] Driver Query Result:', JSON.stringify(data, null, 2));
      }
      if (data && data.length > 0) {
        console.log('[OrdersProvider] First order business_id:', data[0].business_id);
      }

      if (data) {
        const mappedOrders: Order[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id,
          clientId: item.client_id,
          driverId: item.driver_id,
          items: item.order_items.map((oi: any) => ({
            productId: oi.product_id,
            quantity: oi.quantity,
            price: oi.price,
            notes: oi.notes,
          })),
          status: item.status,
          total: item.total,
          subtotal: item.subtotal,
          deliveryFee: item.delivery_fee,
          createdAt: new Date(item.created_at),
          estimatedDelivery: item.estimated_delivery ? new Date(item.estimated_delivery) : undefined,
          deliveryAddress: item.delivery_address, // Assuming JSONB
          paymentMethod: item.payment_method,
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('[OrdersProvider] Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderById = useCallback((id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: OrderStatus): Order[] => {
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    console.log('[OrdersProvider] Updating order status:', id, status);
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('[OrdersProvider] Error updating status:', error);
      // Revert on error (could implement rollback logic here)
      fetchOrders();
    }
  }, []);

  const assignDriver = useCallback(async (orderId: string, driverId: string) => {
    console.log('[OrdersProvider] Assigning driver:', orderId, driverId);
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, driverId, status: 'assigned' as OrderStatus }
            : order
        )
      );

      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('[OrdersProvider] Error assigning driver:', error);
      fetchOrders();
    }
  }, []);

  return useMemo(
    () => ({
      orders,
      getOrderById,
      getOrdersByStatus,
      updateOrderStatus,
      assignDriver,
      isLoading,
    }),
    [orders, getOrderById, getOrdersByStatus, updateOrderStatus, assignDriver, isLoading]
  );
});
