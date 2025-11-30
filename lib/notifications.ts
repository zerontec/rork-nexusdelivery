import { supabase } from './supabase';
import { NotificationType, Notification } from '@/types';
import {
    Bell,
    CheckCircle,
    Truck,
    PackageCheck,
    XCircle,
    ShoppingBag,
    Clock,
    DollarSign,
} from 'lucide-react-native';

/**
 * Get icon component for notification type
 */
export const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'order_confirmed':
            return CheckCircle;
        case 'driver_assigned':
            return Truck;
        case 'order_picking_up':
            return PackageCheck;
        case 'order_in_transit':
            return Truck;
        case 'order_delivered':
            return CheckCircle;
        case 'order_cancelled':
            return XCircle;
        case 'new_order':
            return ShoppingBag;
        case 'order_ready':
            return Clock;
        case 'payment_received':
            return DollarSign;
        default:
            return Bell;
    }
};

/**
 * Get color for notification type
 */
export const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
        case 'order_confirmed':
            return '#95E1D3'; // success
        case 'driver_assigned':
            return '#4ECDC4'; // secondary
        case 'order_picking_up':
            return '#FFE66D'; // accent
        case 'order_in_transit':
            return '#5DADE2'; // info
        case 'order_delivered':
            return '#95E1D3'; // success
        case 'order_cancelled':
            return '#E74C3C'; // error
        case 'new_order':
            return '#FF6B6B'; // primary
        case 'order_ready':
            return '#FFE66D'; // accent
        case 'payment_received':
            return '#95E1D3'; // success
        default:
            return '#6B7280'; // gray
    }
};

/**
 * Format notification time as relative time
 */
export const formatNotificationTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
        return 'Ahora';
    } else if (diffInMinutes < 60) {
        return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
        return `Hace ${diffInHours}h`;
    } else if (diffInDays < 7) {
        return `Hace ${diffInDays}d`;
    } else {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }
};

/**
 * Create a notification in Supabase
 */
export const createNotification = async (params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    orderId?: string;
    metadata?: Record<string, any>;
}): Promise<Notification | null> => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                order_id: params.orderId,
                metadata: params.metadata || {},
                is_read: false,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            title: data.title,
            message: data.message,
            orderId: data.order_id,
            metadata: data.metadata,
            isRead: data.is_read,
            createdAt: new Date(data.created_at),
        };
    } catch (error) {
        console.error('[Notifications] Error creating notification:', error);
        return null;
    }
};

/**
 * Generate notification message based on type and metadata
 */
export const getNotificationMessage = (
    type: NotificationType,
    metadata?: Record<string, any>
): string => {
    const businessName = metadata?.business_name || 'el negocio';
    const orderNumber = metadata?.order_number || '';

    switch (type) {
        case 'order_confirmed':
            return `Tu pedido de ${businessName} ha sido confirmado y está siendo preparado`;
        case 'driver_assigned':
            return 'Un repartidor ha sido asignado a tu pedido';
        case 'order_picking_up':
            return orderNumber
                ? `Repartidor está recogiendo el pedido #${orderNumber}`
                : 'Repartidor está recogiendo tu pedido';
        case 'order_in_transit':
            return 'Tu pedido está en camino';
        case 'order_delivered':
            return '¡Tu pedido ha sido entregado!';
        case 'order_cancelled':
            return 'Tu pedido ha sido cancelado';
        case 'new_order':
            return orderNumber
                ? `Nuevo pedido recibido #${orderNumber}`
                : 'Nuevo pedido recibido';
        case 'order_ready':
            return orderNumber
                ? `Pedido #${orderNumber} listo para recoger`
                : 'Pedido listo para recoger';
        case 'payment_received':
            return 'Pago recibido exitosamente';
        default:
            return 'Nueva notificación';
    }
};
