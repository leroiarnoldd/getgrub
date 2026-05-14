import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { analyzeFeedback } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useClaim } from '../../hooks/useClaim';

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <View className="mb-4">
      <Text className="text-getgrub-navy font-medium mb-2">{label}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={{ fontSize: 28, color: star <= value ? '#e8593c' : '#d1d5db' }}>★</Text>
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
      // Analyze feedback via AI
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

      // Save feedback
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

      // Mark feedback as submitted on the claim
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
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-black text-getgrub-navy">How was it?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-gray-400">Skip</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 mb-6">
          Your honest feedback helps restaurants improve and helps other diners find great deals.
        </Text>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <StarRating value={foodRating} onChange={setFoodRating} label="Food quality" />
          <StarRating value={vibeRating} onChange={setVibeRating} label="Atmosphere & service" />
          <StarRating value={valueRating} onChange={setValueRating} label="Value for money" />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6">
          <Text className="text-getgrub-navy font-medium mb-2">Anything else to share? (optional)</Text>
          <TextInput
            value={freetext}
            onChangeText={setFreetext}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            className="text-getgrub-navy text-sm"
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`rounded-2xl py-4 items-center ${canSubmit ? 'bg-getgrub-coral' : 'bg-gray-300'} ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
