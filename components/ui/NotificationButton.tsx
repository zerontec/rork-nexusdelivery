import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '@/constants/theme';
import { useNotifications } from '@/providers/NotificationsProvider';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

interface NotificationButtonProps {
    color?: string;
    style?: any;
}

export const NotificationButton = ({ color = COLORS.gray[900], style }: NotificationButtonProps) => {
    const router = useRouter();
    const { unreadCount } = useNotifications();

    return (
        <TouchableOpacity
            onPress={() => router.push('/notifications' as any)}
            style={[styles.container, style]}
            activeOpacity={0.7}
        >
            <View>
                <Bell size={24} color={color} />
                <View style={styles.badgeContainer}>
                    <NotificationBadge count={unreadCount} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
    }
});
