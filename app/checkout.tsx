import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MapPin, CreditCard, Wallet, CheckCircle } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/providers/CartProvider';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

type PaymentMethod = 'card' | 'cash';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, clearCart, getProduct } = useCart();
  const { currentRole, user } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [deliveryAddress, setDeliveryAddress] = useState('Calle Principal 123, Centro');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/(tabs)/home' as any);
      return;
    }

    const fetchBusiness = async () => {
      const firstProduct = getProduct(items[0].productId);
      if (firstProduct?.businessId) {
        const { data } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', firstProduct.businessId)
          .single();

        if (data) {
          setBusiness({
            ...data,
            deliveryFee: data.delivery_fee,
            deliveryTime: data.delivery_time,
          });
        }
      }
    };

    fetchBusiness();
  }, [items, getProduct, router]);

  if (items.length === 0) {
    return null;
  }

  const deliveryFee = business?.deliveryFee || 0;
  const total = subtotal + deliveryFee;
  const businessId = business?.id;

  const handlePlaceOrder = async () => {
    if (!currentRole || currentRole !== 'client') {
      Alert.alert(
        'Registro Requerido',
        'Para completar tu pedido necesitas registrarte como cliente',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Registrarme',
            onPress: () => router.push('/register-customer' as any),
          },
        ]
      );
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No se pudo identificar el usuario');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'No se pudo identificar el negocio');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: businessId,
          client_id: user.id,
          status: 'pending',
          total: total,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          delivery_address: {
            address: deliveryAddress,
            lat: 0, // Placeholder
            lng: 0, // Placeholder
          },
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (!orderData) throw new Error('No se pudo crear el pedido');

      // 2. Create Order Items
      const orderItems = items.map(item => {
        const product = getProduct(item.productId);
        return {
          order_id: orderData.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: product?.price || 0,
          notes: item.notes || '',
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Success
      clearCart();
      router.replace('/(tabs)/orders' as any);

      Alert.alert(
        '¡Pedido confirmado!',
        'Tu pedido ha sido recibido y está siendo preparado.',
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert('Error', `Hubo un problema al procesar tu pedido: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Finalizar Pedido' }} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
          </View>
          <TextInput
            style={styles.addressInput}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Ingresa tu dirección"
            placeholderTextColor={COLORS.gray[400]}
            multiline
          />
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Cambiar dirección</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Método de Pago</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionContent}>
              <CreditCard size={24} color={COLORS.gray[700]} />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Tarjeta</Text>
                <Text style={styles.paymentOptionDescription}>
                  Débito o crédito
                </Text>
              </View>
            </View>
            {paymentMethod === 'card' && (
              <CheckCircle size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cash' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.paymentOptionContent}>
              <Wallet size={24} color={COLORS.gray[700]} />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Efectivo</Text>
                <Text style={styles.paymentOptionDescription}>
                  Paga al recibir
                </Text>
              </View>
            </View>
            {paymentMethod === 'cash' && (
              <CheckCircle size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notas para el repartidor</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej: Tocar el timbre, Casa azul..."
            placeholderTextColor={COLORS.gray[400]}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </Card>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Al confirmar tu pedido, aceptas nuestros términos y condiciones.
            Tiempo estimado de entrega: {business?.deliveryTime || '30-40 min'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handlePlaceOrder}
          size="lg"
          disabled={isProcessing}
          testID="place-order-button"
        >
          {isProcessing ? 'Procesando...' : `Confirmar Pedido - $${total.toFixed(2)}`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  addressInput: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    minHeight: 60,
  },
  changeButton: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.sm,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  paymentOptionText: {
    gap: 2,
  },
  paymentOptionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  paymentOptionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  notesInput: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: SPACING.md,
  },
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  infoCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});
