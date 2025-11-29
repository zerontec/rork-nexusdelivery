import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

export default function PersonalInfoScreen() {
    const router = useRouter();
    const { user } = useApp();
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            // You can fetch additional profile data from a profiles table if needed
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 means no rows found, which is okay
                console.error('Error fetching profile:', error);
                return;
            }

            if (data) {
                setFullName(data.full_name || '');
                setPhone(data.phone || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSave = async () => {
        if (!fullName) {
            Alert.alert('Error', 'Por favor ingresa tu nombre completo');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'No se pudo identificar el usuario');
            return;
        }

        setLoading(true);

        try {
            // Upsert profile data
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    phone,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            Alert.alert('Éxito', 'Información actualizada correctamente', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', `No se pudo actualizar la información: ${error.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ title: 'Información Personal' }} />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Información Personal' }} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.formCard}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Nombre Completo <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Juan Pérez"
                            placeholderTextColor={COLORS.gray[400]}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: +1 809-555-1234"
                            placeholderTextColor={COLORS.gray[400]}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={email}
                            editable={false}
                        />
                        <Text style={styles.helperText}>
                            El email no se puede cambiar
                        </Text>
                    </View>
                </Card>

                <Button
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    loadingText: {
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.gray[600],
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: SPACING.md,
        gap: SPACING.md,
    },
    formCard: {
        padding: SPACING.lg,
        gap: SPACING.lg,
    },
    formGroup: {
        gap: SPACING.sm,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.gray[700],
    },
    required: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.gray[50],
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.gray[900],
    },
    disabledInput: {
        backgroundColor: COLORS.gray[100],
        color: COLORS.gray[500],
    },
    helperText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.gray[500],
        marginTop: 4,
    },
});
