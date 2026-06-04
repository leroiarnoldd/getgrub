import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { analyzeFeedback } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useClaim } from '../../hooks/useClaim';

function StarRating({ value, onChange, label, emoji }: { value: number; onChange: (v: number) => void; label: string; emoji: string }) {
  return (
    <View style={styles.starBlock}>
      <View style={styles.starLabelRow}>
        <Text style={styles.starEmoji}>{emoji}</Text>
        <Text style={styles.starLabel}>{label}</Text>
      </View>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, { color: star <= value ? '#FF0000' : '#e5e7eb' }]}>★</Text>
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
      let aiSentiment = 'neutral';
      try {
        const analysis = await analyzeFeedback({
          freetext: freetext || 'No written feedback provided.',
          food_rating: foodRating,
          vibe_rating: vibeRating,
          value_rating: valueRating,
        });
        aiThemes = analysis.themes;
        aiSentiment = analysis.sentiment;
      } catch {}

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

      await supabase.from('claims').update({ feedback_submitted: true }).eq('id', claim.id);

      Alert.alert('Thanks for your feedback! 🙌', 'Your review helps other diners find great deals.', [
        { text: 'Done', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>How was it?</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.intro}>Your honest review helps restaurants improve and helps other diners find great deals.</Text>

        <View style={styles.card}>
          <StarRating value={foodRating} onChange={setFoodRating} label="Food quality" emoji="🍽️" />
          <View style={styles.divider} />
          <StarRating value={vibeRating} onChange={setVibeRating} label="Atmosphere & service" emoji="✨" />
          <View style={styles.divider} />
          <StarRating value={valueRating} onChange={setValueRating} label="Value for money" emoji="💰" />
        </View>

        <View style={styles.card}>
          <Text style={styles.freetextLabel}>Anything to add? <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            value={freetext}
            onChangeText={setFreetext}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={[styles.submitBtn, canSubmit ? styles.submitBtnActive : styles.submitBtnDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF5' },
  scroll: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  skipText: { color: '#9ca3af', fontWeight: '500' },
  intro: { color: '#6b7280', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16 },
  starBlock: { paddingVertical: 4 },
  starLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  starEmoji: { fontSize: 18 },
  starLabel: { color: '#1a1a2e', fontWeight: '600', fontSize: 15 },
  starRow: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 32 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  freetextLabel: { fontWeight: '600', color: '#1a1a2e', fontSize: 15, marginBottom: 10 },
  optional: { fontWeight: '400', color: '#9ca3af' },
  textInput: { color: '#1a1a2e', fontSize: 14, minHeight: 90, textAlignVertical: 'top', lineHeight: 20 },
  submitBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#FF0000' },
  submitBtnDisabled: { backgroundColor: '#e5e7eb' },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});