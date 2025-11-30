import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useNotifications } from '@/providers/NotificationsProvider';
import { NotificationItem, EmptyState, LoadingSpinner } from '@/components/ui';
import { Notification } from '@/types';

export default function NotificationsScreen() {
    const router = useRouter();
    const {
        notifications,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
    } = useNotifications();

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate to order detail if has orderId
        if (notification.orderId) {
            router.push(`/order-detail?id=${notification.orderId}`);
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {notifications.length > 0 && (
                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {notifications.filter((n) => !n.isRead).length} sin leer
                    </Text>
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllButton}>Marcar todas como leídas</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={item}
                        onPress={() => handleNotificationPress(item)}
                        onMarkAsRead={() => markAsRead(item.id)}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refreshNotifications}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon={Bell}
                        title="Sin notificaciones"
                        message="No tienes notificaciones nuevas"
                    />
                }
                contentContainerStyle={
                    notifications.length === 0 ? styles.emptyList : undefined
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
        backgroundColor: COLORS.gray[50],
    },
    headerText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.gray[600],
    },
    markAllButton: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    },
    emptyList: {
        flex: 1,
    },
});
