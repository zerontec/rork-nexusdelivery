import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';
import { MOCK_DRIVERS } from '@/mocks/drivers';
import { Button } from '@/components/ui/Button';

export default function RateDriverScreen() {
  const { orderId, driverId } = useLocalSearchParams<{
    orderId: string;
    driverId: string;
  }>();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const driver = useMemo(() => {
    return MOCK_DRIVERS.find((d) => d.id === driverId);
  }, [driverId]);

  if (!driver) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Repartidor no encontrado' }} />
        <Text style={styles.errorText}>Repartidor no encontrado</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    console.log('[RateDriver] Submitting rating:', {
      orderId,
      driverId,
      rating,
      review,
    });
    router.back();
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
          <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverStats}>
            {driver.rating} ⭐ • {driver.reviews} reseñas
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
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  driverStats: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray[600],
  },
  question: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
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
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
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
