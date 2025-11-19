import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Package, AlertTriangle, Edit, Trash2 } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { Product } from '@/types';

export default function InventoryScreen() {
  const router = useRouter();
  const businessId = 'b1';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'low' | 'out'>('all');

  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.businessId === businessId);
  }, [businessId]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedFilter === 'low') {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock < 10);
    } else if (selectedFilter === 'out') {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    };
  }, [products]);

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: 'Agotado', color: COLORS.error };
    } else if (product.stock < 10) {
      return { label: 'Stock Bajo', color: COLORS.warning };
    } else {
      return { label: 'Disponible', color: COLORS.success };
    }
  };

  const filters = [
    { id: 'all' as const, label: 'Todos', count: stats.total },
    { id: 'low' as const, label: 'Stock Bajo', count: stats.lowStock },
    { id: 'out' as const, label: 'Agotados', count: stats.outOfStock },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Inventario' }} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  selectedFilter === filter.id && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    selectedFilter === filter.id && styles.filterBadgeTextActive,
                  ]}
                >
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.productsList}
        contentContainerStyle={styles.productsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Package size={48} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No se encontraron productos con ese nombre'
                : 'Agrega productos a tu inventario'}
            </Text>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const status = getStockStatus(product);

            return (
              <Card key={product.id} style={styles.productCard}>
                <View style={styles.productContent}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productCategory}>{product.category}</Text>

                    <View style={styles.productFooter}>
                      <View style={styles.stockInfo}>
                        {product.stock === 0 ? (
                          <AlertTriangle size={16} color={status.color} />
                        ) : (
                          <Package size={16} color={status.color} />
                        )}
                        <Text style={[styles.stockText, { color: status.color }]}>
                          {product.stock} unidades
                        </Text>
                      </View>
                      <Text style={styles.productPrice}>
                        ${product.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => router.push(`/business/edit-product?id=${product.id}` as any)}
                    >
                      <Edit size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </Card>
            );
          })
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
  header: {
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
  },
  filtersContainer: {
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray[700],
  },
  filterTextActive: {
    color: COLORS.white,
  },
  filterBadge: {
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: SPACING.xs,
    minWidth: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeActive: {
    backgroundColor: COLORS.white + '40',
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[700],
  },
  filterBadgeTextActive: {
    color: COLORS.white,
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[700],
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center' as const,
  },
  productCard: {
    padding: SPACING.md,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  productCategory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stockText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
  },
  productActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});
