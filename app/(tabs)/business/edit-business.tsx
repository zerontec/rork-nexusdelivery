import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

export default function EditBusinessScreen() {
    const router = useRouter();
    const { businessProfile, refreshProfile } = useApp();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [minimumOrder, setMinimumOrder] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const fetchBusiness = async () => {
            if (!businessProfile?.id) return;

            try {
                const { data, error } = await supabase
                    .from('businesses')
                    .select('*')
                    .eq('id', businessProfile.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setPhone(data.phone || '');
                    setAddress(data.location?.address || '');
                    setDeliveryTime(data.delivery_time || '');
                    setDeliveryFee(data.delivery_fee?.toString() || '');
                    setMinimumOrder(data.minimum_order?.toString() || '');
                    setIsOpen(data.is_open ?? true);
                }
            } catch (error) {
                console.error('Error fetching business:', error);
            }
        };

        fetchBusiness();
    }, [businessProfile]);

    const handleSave = async () => {
        if (!name || !phone || !address) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
            return;
        }

        if (!businessProfile?.id) {
            Alert.alert('Error', 'No se pudo identificar el negocio');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    name,
                    description,
                    phone,
                    location: {
                        address,
                    },
                    delivery_time: deliveryTime,
                    delivery_fee: deliveryFee ? parseFloat(deliveryFee) : 0,
                    minimum_order: minimumOrder ? parseFloat(minimumOrder) : 0,
                    is_open: isOpen,
                })
                .eq('id', businessProfile.id);

            if (error) throw error;

            await refreshProfile();

            Alert.alert('Éxito', 'Información del negocio actualizada correctamente', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Error updating business:', error);
            Alert.alert('Error', `No se pudo actualizar el negocio: ${error.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!businessProfile) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ title: 'Editar Negocio' }} />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Editar Negocio' }} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.formCard}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Nombre del Negocio <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Restaurante El Buen Sabor"
                            placeholderTextColor={COLORS.gray[400]}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe tu negocio..."
                            placeholderTextColor={COLORS.gray[400]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Teléfono <Text style={styles.required}>*</Text>
                        </Text>
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
                        <Text style={styles.label}>
                            Dirección <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Dirección completa del negocio"
                            placeholderTextColor={COLORS.gray[400]}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tiempo de Entrega</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 30-45 min"
                            placeholderTextColor={COLORS.gray[400]}
                            value={deliveryTime}
                            onChangeText={setDeliveryTime}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Costo de Envío ($)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.gray[400]}
                                value={deliveryFee}
                                onChangeText={setDeliveryFee}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Pedido Mínimo ($)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.gray[400]}
                                value={minimumOrder}
                                onChangeText={setMinimumOrder}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.switchInfo}>
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchLabel}>Negocio Abierto</Text>
                                <Text style={styles.switchDescription}>
                                    Los clientes pueden hacer pedidos
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isOpen}
                            onValueChange={setIsOpen}
                            trackColor={{ false: COLORS.gray[300], true: COLORS.success }}
                            thumbColor={COLORS.white}
                        />
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
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    halfWidth: {
        flex: 1,
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
    textArea: {
        minHeight: 80,
        paddingTop: SPACING.sm,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.gray[50],
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
    },
    switchInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    switchTextContainer: {
        flex: 1,
    },
    switchLabel: {
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.gray[900],
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.gray[600],
    },
});
