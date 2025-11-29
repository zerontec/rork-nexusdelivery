import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function RateDriverScreen() {
  const { orderId, driverId } = useLocalSearchParams<{
    orderId: string;
    driverId: string;
  }>();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!driverId) return;
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', driverId)
          .single();

        if (error) {
          console.error('[RateDriver] Supabase error:', error);
          throw error;
        }
        setDriver(data);
      } catch (error: any) {
        console.error('[RateDriver] Error fetching driver:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md, color: COLORS.gray[500] }}>Cargando repartidor...</Text>
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
          <Text style={styles.errorText}>No se pudo cargar la información del repartidor.</Text>
          <Button onPress={() => router.back()} style={{ marginTop: SPACING.xl }}>Volver</Button>
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!driver || rating === 0) return;

    try {
      // Calculate new rating
      const currentRating = driver.rating || 5.0;
      const currentReviews = driver.reviews || 0;

      const newReviews = currentReviews + 1;
      const newRating = ((currentRating * currentReviews) + rating) / newReviews;

      // Update driver aggregate stats
      const { error: driverError } = await supabase
        .from('drivers')
        .update({
          rating: parseFloat(newRating.toFixed(2)),
          reviews: newReviews,
        })
        .eq('id', driverId);

      if (driverError) throw driverError;

      // Insert individual review with comment (if reviews table exists)
      if (review.trim()) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { error: reviewError } = await supabase
            .from('reviews')
            .insert({
              order_id: orderId,
              driver_id: driverId,
              client_id: userData.user.id,
              rating: rating,
              comment: review.trim(),
            });

          if (reviewError) {
            console.log('[RateDriver] Reviews table may not exist yet:', reviewError.message);
          }
        }
      }

      alert('¡Gracias por tu calificación!');
      router.back();
    } catch (error) {
      console.error('[RateDriver] Error submitting rating:', error);
      alert('Error al enviar la calificación');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Calificar repartidor',
          presentation: 'modal',
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.driverInfo}>
          <Image source={{ uri: driver.photo || 'https://via.placeholder.com/100' }} style={styles.driverPhoto} />
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverStats}>
            {driver.rating || 5.0} ⭐ • {driver.reviews || 0} reseñas
          </Text>
        </View>

        <Text style={styles.question}>
          ¿Cómo fue tu experiencia con el repartidor?
        </Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
              testID={`star-${star}`}
            >
              <Star
                size={48}
                color={star <= rating ? COLORS.warning : COLORS.gray[300]}
                fill={star <= rating ? COLORS.warning : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Text style={styles.ratingText}>
            {rating === 1 && 'Muy malo'}
            {rating === 2 && 'Malo'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bueno'}
            {rating === 5 && 'Excelente'}
          </Text>
        )}

        <TextInput
          style={styles.reviewInput}
          placeholder="Cuéntanos más sobre tu experiencia (opcional)"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor={COLORS.gray[400]}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handleSubmit}
          disabled={rating === 0}
          size="lg"
          testID="submit-rating-button"
        >
          Enviar calificación
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[500],
    textAlign: 'center' as const,
    marginTop: SPACING.xxl,
  },
  driverInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  driverPhoto: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[200],
    marginBottom: SPACING.md,
  },
  driverName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  driverStats: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  question: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.gray[900],
    textAlign: 'center' as const,
    marginBottom: SPACING.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold as any,
    color: COLORS.warning,
    textAlign: 'center' as const,
    marginBottom: SPACING.lg,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[900],
    minHeight: 120,
    backgroundColor: COLORS.gray[50],
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});
