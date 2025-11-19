import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Minus, Tag, TrendingUp, Sparkles } from 'lucide-react-native';
import { Product } from '@/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from './Card';

type ProductCardProps = {
  product: Product;
  quantity?: number;
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
  testID?: string;
};

export function ProductCard({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  testID,
}: ProductCardProps) {
  return (
    <Card style={styles.card} testID={testID}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        
        {product.isNew && (
          <View style={styles.newBadge}>
            <Sparkles size={10} color={COLORS.white} />
            <Text style={styles.newText}>NUEVO</Text>
          </View>
        )}
        
        {product.isBestSeller && (
          <View style={styles.bestSellerBadge}>
            <TrendingUp size={10} color={COLORS.white} />
            <Text style={styles.bestSellerText}>MÁS VENDIDO</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ${product.originalPrice.toFixed(2)}
              </Text>
            )}
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>
          
          {product.available ? (
            <View style={styles.quantityContainer}>
              {quantity > 0 ? (
                <>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => onRemove?.(product)}
                    testID={`${testID}-remove`}
                  >
                    <Minus size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </>
              ) : null}
              <TouchableOpacity
                style={[styles.quantityButton, styles.addButton]}
                onPress={() => onAdd?.(product)}
                testID={`${testID}-add`}
              >
                <Plus size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.unavailable}>No disponible</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: SPACING.sm,
  },
  imageContainer: {
    position: 'relative' as const,
    width: 90,
    height: 90,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[200],
  },
  discountBadge: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  newBadge: {
    position: 'absolute' as const,
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    ...SHADOWS.sm,
  },
  newText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  bestSellerBadge: {
    position: 'absolute' as const,
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    ...SHADOWS.sm,
  },
  bestSellerText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.gray[900],
    minWidth: 20,
    textAlign: 'center' as const,
  },
  unavailable: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
