import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, ShoppingCart, TrendingUp, Store, Truck, Briefcase, Percent, Star } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { MOCK_BUSINESSES } from '@/mocks/businesses';
import { BusinessCard } from '@/components/ui/BusinessCard';
import { useCart } from '@/providers/CartProvider';
import { useApp } from '@/providers/AppProvider';
import { Business } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { setRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(
    () => [
      { id: 'all', label: 'Todo', icon: Store },
      { id: 'restaurant', label: 'Comida', icon: Store },
      { id: 'retail', label: 'Tienda', icon: Store },
      { id: 'pharmacy', label: 'Farmacia', icon: Store },
    ],
    []
  );

  const filteredBusinesses = useMemo(() => {
    let filtered = MOCK_BUSINESSES;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((b) => b.type === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleBusinessPress = (business: Business) => {
    console.log('[Home] Business selected:', business.id);
    router.push(`/home/business/${business.id}` as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hola 👋</Text>
            <Text style={styles.subtitle}>¿Qué necesitas hoy?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => {
                console.log('[Home] Switching to driver role');
                setRole('driver');
              }}
              activeOpacity={0.8}
            >
              <Truck size={14} color={COLORS.white} />
              <Text style={styles.promoButtonText}>Repartidor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => {
                console.log('[Home] Navigating to business registration');
                router.push('/business-register' as any);
              }}
              activeOpacity={0.8}
            >
              <Briefcase size={14} color={COLORS.white} />
              <Text style={styles.promoButtonText}>Negocio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/cart' as any)}
              style={styles.cartButton}
              testID="cart-button"
            >
              <ShoppingCart size={24} color={COLORS.primary} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar negocios, productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray[400]}
            testID="search-input"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Offers Section */}
      <View style={styles.offersSection}>
        <View style={styles.offersBanner}>
          <View style={styles.offersContent}>
            <View style={styles.offersIconBadge}>
              <Percent size={20} color={COLORS.primary} />
            </View>
            <View style={styles.offersTextContainer}>
              <Text style={styles.offersTitle}>¡Ofertas Especiales!</Text>
              <Text style={styles.offersSubtitle}>Descuentos de hasta 30% hoy</Text>
            </View>
          </View>
          <View style={styles.offersStarBadge}>
            <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={handleBusinessPress}
            testID={`business-${item.id}`}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Store size={48} color={COLORS.gray[300]} />
            <Text style={styles.emptyText}>
              No se encontraron negocios
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  cartButton: {
    position: 'relative' as const,
    padding: SPACING.sm,
  },
  badge: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
  },
  categoriesContainer: {
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[500],
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  promoButtonText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
  offersSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  offersBanner: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.warning + '30',
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  offersIconBadge: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...SHADOWS.sm,
  },
  offersTextContainer: {
    flex: 1,
  },
  offersTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  offersSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  offersStarBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
