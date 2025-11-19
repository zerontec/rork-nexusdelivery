import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Star, TrendingUp, Award, MessageCircle, ThumbsUp } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

type Review = {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string;
  tips: number;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    orderId: 'o1',
    rating: 5,
    comment: '¡Excelente servicio! Muy rápido y amable.',
    customerName: 'María G.',
    date: '2025-01-11',
    tips: 5,
  },
  {
    id: 'r2',
    orderId: 'o2',
    rating: 5,
    comment: 'Entrega a tiempo y en perfectas condiciones.',
    customerName: 'Carlos R.',
    date: '2025-01-10',
    tips: 0,
  },
  {
    id: 'r3',
    orderId: 'o3',
    rating: 4,
    comment: 'Buen servicio, llegó un poco tarde pero todo bien.',
    customerName: 'Ana M.',
    date: '2025-01-09',
    tips: 3,
  },
  {
    id: 'r4',
    orderId: 'o4',
    rating: 5,
    comment: 'Muy profesional y educado. Recomendado.',
    customerName: 'Luis P.',
    date: '2025-01-08',
    tips: 7,
  },
  {
    id: 'r5',
    orderId: 'o5',
    rating: 5,
    comment: 'Perfecto como siempre.',
    customerName: 'Sofia V.',
    date: '2025-01-07',
    tips: 2,
  },
];

export default function RatingsScreen() {
  const avgRating = 4.8;
  const totalReviews = MOCK_REVIEWS.length;
  const totalTips = MOCK_REVIEWS.reduce((sum, r) => sum + r.tips, 0);
  const fiveStarCount = MOCK_REVIEWS.filter((r) => r.rating === 5).length;
  const fiveStarPercentage = (fiveStarCount / totalReviews) * 100;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? COLORS.warning : COLORS.gray[300]}
        fill={i < rating ? COLORS.warning : 'transparent'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Calificaciones' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.summaryCard}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingValue}>{avgRating.toFixed(1)}</Text>
            <View style={styles.stars}>{renderStars(5)}</View>
            <Text style={styles.ratingCount}>
              {totalReviews} calificaciones
            </Text>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
              <TrendingUp size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{fiveStarPercentage.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>5 Estrellas</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.accent + '20' }]}>
              <Award size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.statValue}>${totalTips.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Propinas</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageCircle size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Comentarios</Text>
          </View>

          {MOCK_REVIEWS.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewHeaderLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {review.customerName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.customerName}>{review.customerName}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                </View>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              {review.tips > 0 && (
                <View style={styles.tipsContainer}>
                  <ThumbsUp size={14} color={COLORS.secondary} />
                  <Text style={styles.tipsText}>
                    Propina: ${review.tips.toFixed(2)}
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>💡 Mantén tu calificación alta</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Sé puntual en las entregas</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>
              Mantén los productos en buen estado
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>
              Comunícate con el cliente si hay retrasos
            </Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Sé amable y profesional</Text>
          </View>
        </Card>
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
    gap: SPACING.md,
  },
  summaryCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  ratingCircle: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 56,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  ratingCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginVertical: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
  },
  section: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
  },
  reviewCard: {
    padding: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.white,
  },
  customerName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.gray[900],
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  tipsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.secondary,
  },
  tipsCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.info + '10',
    borderColor: COLORS.info + '40',
    borderWidth: 1,
  },
  tipsCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.info,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
});
