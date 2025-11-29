import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { User, Bell, Globe, Lock, FileText, Info, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';

type SettingOption = {
    icon: typeof User;
    label: string;
    onPress: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
};

export default function SettingsScreen() {
    const router = useRouter();
    const { user } = useApp();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    const accountSettings: SettingOption[] = [
        {
            icon: User,
            label: 'Información Personal',
            onPress: () => router.push('/personal-info' as any),
            showChevron: true,
        },
    ];

    const appSettings: SettingOption[] = [
        {
            icon: Bell,
            label: 'Notificaciones',
            onPress: () => { },
            rightElement: (
                <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
                    thumbColor={COLORS.white}
                />
            ),
        },
        {
            icon: Globe,
            label: 'Idioma',
            onPress: () => console.log('Language'),
            showChevron: true,
        },
        {
            icon: Lock,
            label: 'Privacidad y Seguridad',
            onPress: () => console.log('Privacy'),
            showChevron: true,
        },
    ];

    const aboutSettings: SettingOption[] = [
        {
            icon: FileText,
            label: 'Términos y Condiciones',
            onPress: () => console.log('Terms'),
            showChevron: true,
        },
        {
            icon: Info,
            label: 'Acerca de',
            onPress: () => console.log('About'),
            showChevron: true,
        },
    ];

    const renderSettingItem = (option: SettingOption, index: number) => {
        const Icon = option.icon;
        return (
            <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={option.onPress}
            >
                <View style={styles.settingItemLeft}>
                    <Icon size={20} color={COLORS.gray[700]} />
                    <Text style={styles.settingItemText}>{option.label}</Text>
                </View>
                {option.rightElement || (
                    option.showChevron && <ChevronRight size={20} color={COLORS.gray[400]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Configuración' }} />

            <ScrollView contentContainerStyle={styles.content}>
                <Card style={styles.userCard}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <User size={24} color={COLORS.white} />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>
                                {user?.email?.split('@')[0] || 'Usuario'}
                            </Text>
                            {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Cuenta</Text>
                    <View style={styles.settingsContainer}>
                        {accountSettings.map(renderSettingItem)}
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Aplicación</Text>
                    <View style={styles.settingsContainer}>
                        {appSettings.map(renderSettingItem)}
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Información</Text>
                    <View style={styles.settingsContainer}>
                        {aboutSettings.map(renderSettingItem)}
                    </View>
                </View>

                <Text style={styles.version}>NexusDelivery v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    content: {
        padding: SPACING.md,
        flexGrow: 1,
    },
    userCard: {
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.gray[900],
        marginBottom: 2,
    },
    userEmail: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.gray[600],
    },
    sectionContainer: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.gray[900],
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    settingsContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flex: 1,
    },
    settingItemText: {
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.gray[700],
    },
    version: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.gray[400],
        marginTop: SPACING.xl,
    },
});
