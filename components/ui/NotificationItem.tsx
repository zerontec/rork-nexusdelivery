import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from '@/types';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import {
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
} from '@/lib/notifications';

type NotificationItemProps = {
    notification: Notification;
    onPress: () => void;
    onMarkAsRead?: () => void;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    onMarkAsRead,
}) => {
    const Icon = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);
    const backgroundColor = notification.isRead ? COLORS.white : COLORS.gray[50];

    const handlePress = () => {
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead();
        }
        onPress();
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Icon size={24} color={iconColor} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {notification.title}
                    </Text>
                    <Text style={styles.time}>
                        {formatNotificationTime(notification.createdAt)}
                    </Text>
                </View>

                <Text style={styles.message} numberOfLines={2}>
                    {notification.message}
                </Text>

                {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
        color: COLORS.gray[900],
        flex: 1,
        marginRight: SPACING.sm,
    },
    time: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.gray[500],
    },
    message: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.gray[600],
        lineHeight: 20,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
});
