import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Percent, Calendar, TrendingUp, Trash2, Edit2 } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { MOCK_PRODUCTS } from '@/mocks/products';

type Offer = {
  id: string;
  productId: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export default function OffersScreen() {
  const router = useRouter();
  const businessId = 'b1';

  const [offers] = useState<Offer[]>([
    {
      id: 'o1',
      productId: 'p1',
      discount: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      id: 'o2',
      productId: 'p3',
      discount: 15,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);

  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.businessId === businessId);
  }, [businessId]);

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleDeleteOffer = (offerId: string) => {
    Alert.alert(
      'Eliminar Oferta',
      '¿Estás seguro de que deseas eliminar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            console.log('[Offers] Deleting offer:', offerId);
            Alert.alert('Éxito', 'Oferta eliminada correctamente');
          },
        },
      ]
    );
  };

  const activeOffers = offers.filter((o) => o.isActive);
  const expiredOffers = offers.filter((o) => !o.isActive);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ofertas',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('[Offers] Create new offer');
                Alert.alert(
                  'Crear Oferta',
                  'Esta función permite crear ofertas especiales para tus productos.',
                  [{ text: 'Entendido' }]
                );
              }}
              style={styles.headerButton}
            >
              <Plus size={24} color={COLORS.accent} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.accent + '20' }]}>
              <TrendingUp size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.statValue}>{activeOffers.length}</Text>
            <Text style={styles.statLabel}>Ofertas Activas</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Percent size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>
              {activeOffers.length > 0
                ? Math.round(
                    activeOffers.reduce((sum, o) => sum + o.discount, 0) /
                      activeOffers.length
                  )
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Descuento Promedio</Text>
          </Card>
        </View>

        {activeOffers.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Percent size={48} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>No hay ofertas activas</Text>
            <Text style={styles.emptyText}>
              Crea ofertas especiales para atraer más clientes
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                Alert.alert(
                  'Crear Oferta',
                  'Esta función permite crear ofertas especiales para tus productos.',
                  [{ text: 'Entendido' }]
                );
              }}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.createButtonText}>Crear Oferta</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ofertas Activas</Text>
            {activeOffers.map((offer) => {
              const product = getProductById(offer.productId);
              if (!product) return null;

              const daysRemaining = getDaysRemaining(offer.endDate);

              return (
                <Card key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerBadge}>
                      <Percent size={16} color={COLORS.white} />
                      <Text style={styles.offerBadgeText}>-{offer.discount}%</Text>
                    </View>
                    <View style={styles.offerActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          console.log('[Offers] Edit offer:', offer.id);
                          Alert.alert(
                            'Editar Oferta',
                            'Esta función permite editar ofertas existentes.',
                            [{ text: 'Entendido' }]
                          );
                        }}
                      >
                        <Edit2 size={18} color={COLORS.gray[600]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteOffer(offer.id)}
                      >
                        <Trash2 size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <Text style={styles.offerPrice}>
                      ${(product.price * (1 - offer.discount / 100)).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.offerFooter}>
                    <View style={styles.dateInfo}>
                      <Calendar size={16} color={COLORS.gray[600]} />
                      <Text style={styles.dateText}>
                        {daysRemaining > 0
                          ? `Termina en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`
                          : 'Expira hoy'}
                      </Text>
                    </View>
                    {daysRemaining <= 2 && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>¡Última oportunidad!</Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {expiredOffers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ofertas Expiradas</Text>
            {expiredOffers.map((offer) => {
              const product = getProductById(offer.productId);
              if (!product) return null;

              return (
                <Card key={offer.id} style={[styles.offerCard, styles.expiredCard]}>
                  <View style={styles.offerHeader}>
                    <View style={[styles.offerBadge, styles.expiredBadge]}>
                      <Percent size={16} color={COLORS.white} />
                      <Text style={styles.offerBadgeText}>-{offer.discount}%</Text>
                    </View>
                  </View>

                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.expiredLabel}>Oferta Expirada</Text>
                </Card>
              );
            })}
          </View>
        )}
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
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    marginTop: 4,
    textAlign: 'center',
  },
  emptyCard: {
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[700],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.white,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  offerCard: {
    padding: SPACING.lg,
  },
  expiredCard: {
    opacity: 0.6,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  expiredBadge: {
    backgroundColor: COLORS.gray[500],
  },
  offerBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  offerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  productCategory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.accent,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  urgentBadge: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  urgentText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.error,
  },
  expiredLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
