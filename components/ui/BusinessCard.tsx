import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, Clock, Truck, Tag, TrendingUp } from 'lucide-react-native';
import { Business } from '@/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Card } from './Card';

type BusinessCardProps = {
  business: Business;
  onPress: (business: Business) => void;
  testID?: string;
};

export function BusinessCard({ business, onPress, testID }: BusinessCardProps) {
  return (
    <Card onPress={() => onPress(business)} style={styles.card} testID={testID}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: business.image }} style={styles.image} />

        {business.discount && (
          <View style={styles.discountBadge}>
            <Tag size={14} color={COLORS.white} />
            <Text style={styles.discountText}>{business.discount}% OFF</Text>
          </View>
        )}

        {business.featured && (
          <View style={styles.featuredBadge}>
            <TrendingUp size={12} color={COLORS.white} />
            <Text style={styles.featuredText}>DESTACADO</Text>
          </View>
        )}

        {!business.isOpen && (
          <View style={styles.closedOverlay}>
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Cerrado</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {business.name}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {business.description}
        </Text>

        {business.tags && business.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {business.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <View style={styles.rating}>
              <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.ratingText}>
                {business.rating || 0}
              </Text>
              <Text style={styles.reviewsText}>({business.reviews})</Text>
            </View>

            <View style={styles.deliveryTimeContainer}>
              <Clock size={14} color={COLORS.gray[500]} />
              <Text style={styles.deliveryTime}>{business.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.deliveryFeeContainer}>
            <Truck size={14} color={business.freeDelivery ? COLORS.success : COLORS.gray[500]} />
            <Text style={[
              styles.deliveryFee,
              business.freeDelivery && styles.freeDelivery
            ]}>
              {business.freeDelivery ? 'Envío Gratis' : `$${(business.deliveryFee || 0).toFixed(2)}`}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden' as const,
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%' as const,
    height: 180,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: COLORS.gray[200],
  },
  discountBadge: {
    position: 'absolute' as const,
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.md,
  },
  discountText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  featuredBadge: {
    position: 'absolute' as const,
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    ...SHADOWS.sm,
  },
  featuredText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0.5,
  },
  closedOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  closedText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    flex: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.gray[700],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  footer: {
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[900],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  reviewsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  deliveryFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryFee: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  freeDelivery: {
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
