import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Star, TrendingUp, Award, MessageCircle } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';
import { supabase } from '@/lib/supabase';

export default function RatingsScreen() {
  const { user } = useApp();
  const [driverData, setDriverData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRatings = async () => {
      setIsLoading(true);
      try {
        // Get driver's profile id first
        const { data: driverProfile } = await supabase
          .from('drivers')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!driverProfile) {
          console.log('[Ratings] Driver profile not found');
          setIsLoading(false);
          return;
        }

        const driverId = driverProfile.id;

        // Fetch driver rating info
        const { data: driver } = await supabase
          .from('drivers')
          .select('rating, reviews')
          .eq('id', driverId)
          .single();

        if (driver) {
          setDriverData({
            avgRating: driver.rating || 5.0,
            totalReviews: driver.reviews || 0,
          });
        }

        // Fetch individual reviews from reviews table
        const { data: reviewsData, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('driver_id', driverId)
          .order('created_at', { ascending: false });

        if (error) {
          console.log('[Ratings] Reviews fetch error:', error.message);
          setReviews([]);
        } else if (reviewsData) {
          // Fetch client names for each review
          const reviewsWithClients = await Promise.all(
            reviewsData.map(async (review) => {
              const { data: clientData } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', review.client_id)
                .single();

              return {
                ...review,
                client: clientData || { name: 'Cliente' }
              };
            })
          );
          setReviews(reviewsWithClients);
        }
      } catch (error) {
        console.error('[Ratings] Error fetching ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [user]);

  const avgRating = driverData?.avgRating || 5.0;
  const totalReviews = driverData?.totalReviews || 0;

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Cargando calificaciones...</Text>
        </View>
      ) : (
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
              <Text style={styles.statValue}>{totalReviews}</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.accent + '20' }]}>
                <Award size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </Card>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Comentarios</Text>
            </View>

            {reviews.length === 0 ? (
              <Card style={styles.emptyReviewCard}>
                <MessageCircle size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyReviewTitle}>No hay comentarios aún</Text>
                <Text style={styles.emptyReviewText}>
                  Tus comentarios de clientes aparecerán aquí
                </Text>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewHeaderLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {review.client?.name?.charAt(0) || 'C'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.customerName}>{review.client?.name || 'Cliente'}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString('es-ES', {
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

                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </Card>
              ))
            )}
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
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
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
  emptyReviewCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyReviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.gray[700],
    marginTop: SPACING.md,
  },
  emptyReviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center' as const,
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
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.info,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[700],
    flex: 1,
  },
});
