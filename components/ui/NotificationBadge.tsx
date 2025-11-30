import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '@/constants/theme';

type NotificationBadgeProps = {
    count: number;
};

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
    if (count === 0) return null;

    return (
        <View style={styles.badge}>
            <Text style={styles.text}>
                {count > 99 ? '99+' : count}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.error,
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    text: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.bold as any,
        textAlign: 'center',
    },
});
