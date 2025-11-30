import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Notification } from '@/types';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/providers/AppProvider';
import * as Haptics from 'expo-haptics';

type NotificationsContextValue = {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
};

export const [NotificationsProvider, useNotifications] = createContextHook((): NotificationsContextValue => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useApp();

    const fetchNotifications = async () => {
        try {
            if (!user) return;

            console.log('[NotificationsProvider] Fetching notifications for user:', user.id);

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                // Check if error is due to missing table
                if (error.code === 'PGRST204' || error.code === 'PGRST205') {
                    console.warn(
                        '[NotificationsProvider] Notifications table not found. Please apply the SQL schema from supabase/notifications.sql'
                    );
                    // Don't throw error, just set empty notifications
                    setNotifications([]);
                    return;
                }
                throw error;
            }

            console.log('[NotificationsProvider] Fetched notifications:', data?.length);

            if (data) {
                const mappedNotifications: Notification[] = data.map((item: any) => ({
                    id: item.id,
                    userId: item.user_id,
                    type: item.type,
                    title: item.title,
                    message: item.message,
                    orderId: item.order_id,
                    metadata: item.metadata,
                    isRead: item.is_read,
                    createdAt: new Date(item.created_at),
                }));
                setNotifications(mappedNotifications);
            }
        } catch (error) {
            console.error('[NotificationsProvider] Error fetching notifications:', error);
            // Set empty array on error to prevent infinite loading
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Subscribe to realtime notifications
            const subscription = supabase
                .channel('notifications_channel')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload: any) => {
                        console.log('[NotificationsProvider] Realtime notification:', payload);

                        if (payload.eventType === 'INSERT') {
                            // New notification received
                            const newNotification: Notification = {
                                id: payload.new.id,
                                userId: payload.new.user_id,
                                type: payload.new.type,
                                title: payload.new.title,
                                message: payload.new.message,
                                orderId: payload.new.order_id,
                                metadata: payload.new.metadata,
                                isRead: payload.new.is_read,
                                createdAt: new Date(payload.new.created_at),
                            };

                            setNotifications((prev) => [newNotification, ...prev]);

                            // Trigger haptic feedback
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                        } else if (payload.eventType === 'UPDATE') {
                            // Notification updated (marked as read)
                            setNotifications((prev) =>
                                prev.map((n) =>
                                    n.id === payload.new.id
                                        ? {
                                            ...n,
                                            isRead: payload.new.is_read,
                                        }
                                        : n
                                )
                            );
                        } else if (payload.eventType === 'DELETE') {
                            // Notification deleted
                            setNotifications((prev) =>
                                prev.filter((n) => n.id !== payload.old.id)
                            );
                        }
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        } else {
            setNotifications([]);
            setIsLoading(false);
        }
    }, [user?.id]);

    const markAsRead = useCallback(async (id: string) => {
        console.log('[NotificationsProvider] Marking notification as read:', id);
        try {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('[NotificationsProvider] Error marking as read:', error);
            // Revert on error
            fetchNotifications();
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        console.log('[NotificationsProvider] Marking all notifications as read');
        try {
            if (!user) return;

            // Optimistic update
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
        } catch (error) {
            console.error('[NotificationsProvider] Error marking all as read:', error);
            // Revert on error
            fetchNotifications();
        }
    }, [user?.id]);

    const deleteNotification = useCallback(async (id: string) => {
        console.log('[NotificationsProvider] Deleting notification:', id);
        try {
            // Optimistic update
            setNotifications((prev) => prev.filter((n) => n.id !== id));

            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('[NotificationsProvider] Error deleting notification:', error);
            // Revert on error
            fetchNotifications();
        }
    }, []);

    const refreshNotifications = useCallback(async () => {
        setIsLoading(true);
        await fetchNotifications();
    }, [user?.id]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.isRead).length;
    }, [notifications]);

    return useMemo(
        () => ({
            notifications,
            unreadCount,
            isLoading,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            refreshNotifications,
        }),
        [
            notifications,
            unreadCount,
            isLoading,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            refreshNotifications,
        ]
    );
});
