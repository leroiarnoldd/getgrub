import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { analyzeFeedback } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useClaim } from '../../hooks/useClaim';

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <View style={styles.starBlock}>
      <Text style={styles.starLabel}>{label}</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, { color: star <= value ? '#e8593c' : '#d1d5db' }]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function FeedbackScreen() {
  const { claimId } = useLocalSearchParams<{ claimId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: claim } = useClaim(claimId);
  const [foodRating, setFoodRating] = useState(0);
  const [vibeRating, setVibeRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [freetext, setFreetext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = foodRating > 0 && vibeRating > 0 && valueRating > 0;

  const handleSubmit = async () => {
    if (!claim || !user || !canSubmit) return;
    setIsSubmitting(true);

    try {
      let aiThemes: string[] = [];
      let aiSentiment: string = 'neutral';

      try {
        const analysis = await analyzeFeedback({
          freetext: freetext || 'No written feedback provided.',
          food_rating: foodRating,
          vibe_rating: vibeRating,
          value_rating: valueRating,
        });
        aiThemes = analysis.themes;
        aiSentiment = analysis.sentiment;
      } catch {
        // AI analysis is non-critical
      }

      await supabase.from('feedback').insert({
        claim_id: claim.id,
        user_id: user.id,
        restaurant_id: claim.restaurant_id,
        deal_id: claim.deal_id,
        food_rating: foodRating,
        vibe_rating: vibeRating,
        value_rating: valueRating,
        freetext: freetext || null,
        ai_themes: aiThemes,
        ai_sentiment: aiSentiment,
        would_return: valueRating >= 4 && foodRating >= 4,
      });

      await supabase
        .from('claims')
        .update({ feedback_submitted: true })
        .eq('id', claim.id);

      Alert.alert('Thank you!', 'Your feedback helps other diners find great deals.', [
        { text: 'Done', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>How was it?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.intro}>
          Your honest feedback helps restaurants improve and helps other diners find great deals.
        </Text>

        <View style={styles.ratingsCard}>
          <StarRating value={foodRating} onChange={setFoodRating} label="Food quality" />
          <StarRating value={vibeRating} onChange={setVibeRating} label="Atmosphere & service" />
          <StarRating value={valueRating} onChange={setValueRating} label="Value for money" />
        </View>

        <View style={styles.freetextCard}>
          <Text style={styles.freetextLabel}>Anything else to share? (optional)</Text>
          <TextInput
            value={freetext}
            onChangeText={setFreetext}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            style={styles.freetextInput}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={[
            styles.submitButton,
            canSubmit ? styles.submitButtonActive : styles.submitButtonInactive,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  skipText: {
    color: '#9ca3af',
  },
  intro: {
    color: '#6b7280',
    marginBottom: 24,
  },
  ratingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  starBlock: {
    marginBottom: 16,
  },
  starLabel: {
    color: '#1a1a2e',
    fontWeight: '500',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 28,
  },
  freetextCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  freetextLabel: {
    color: '#1a1a2e',
    fontWeight: '500',
    marginBottom: 8,
  },
  freetextInput: {
    color: '#1a1a2e',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#e8593c',
  },
  submitButtonInactive: {
    backgroundColor: '#d1d5db',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
});
