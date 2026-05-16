import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const CITIES = [
  { name: 'Milton Keynes', slug: 'milton-keynes' },
  { name: 'Manchester', slug: 'manchester' },
  { name: 'Bristol', slug: 'bristol' },
  { name: 'Birmingham', slug: 'birmingham' },
  { name: 'Leeds', slug: 'leeds' },
];

const DIETARY_OPTIONS = [
  { label: 'Halal', value: 'halal' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Gluten-free', value: 'gluten-free' },
  { label: 'Dairy-free', value: 'dairy-free' },
  { label: 'Nut-free', value: 'nut-free' },
];

const VIBE_OPTIONS = [
  { label: 'Casual', value: 'casual' },
  { label: 'Date night', value: 'date-night' },
  { label: 'Family-friendly', value: 'family-friendly' },
  { label: 'Group-friendly', value: 'group-friendly' },
  { label: 'Quick bite', value: 'quick-bite' },
  { label: 'Fine dining', value: 'fine-dining' },
  { label: 'Outdoor seating', value: 'outdoor-seating' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const toggleDietary = (value: string) => {
    setSelectedDietary(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleVibe = (value: string) => {
    setSelectedVibes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let cityId: string | null = null;
      if (selectedCity) {
        const { data } = await supabase
          .from('cities')
          .select('id')
          .eq('slug', selectedCity)
          .single();
        cityId = data?.id ?? null;
      }

      await supabase
        .from('user_profiles')
        .update({
          city_id: cityId,
          dietary_tags: selectedDietary,
          vibe_preferences: selectedVibes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Onboarding error:', e);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: 'Where are you based?',
      subtitle: "We'll show you deals in your city",
      content: (
        <View style={styles.cityList}>
          {CITIES.map(city => (
            <TouchableOpacity
              key={city.slug}
              onPress={() => setSelectedCity(city.slug)}
              style={[
                styles.cityOption,
                selectedCity === city.slug ? styles.cityOptionSelected : styles.cityOptionDefault,
              ]}
            >
              <Text style={[
                styles.cityOptionText,
                selectedCity === city.slug ? styles.cityOptionTextSelected : styles.cityOptionTextDefault,
              ]}>
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      canSkip: true,
      onNext: () => setStep(1),
    },
    {
      title: 'Any dietary requirements?',
      subtitle: "We'll highlight relevant options for you",
      content: (
        <View style={styles.chipRow}>
          {DIETARY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => toggleDietary(opt.value)}
              style={[
                styles.chip,
                selectedDietary.includes(opt.value) ? styles.chipTealSelected : styles.chipDefault,
              ]}
            >
              <Text style={[
                styles.chipText,
                selectedDietary.includes(opt.value) ? styles.chipTextSelected : styles.chipTextDefault,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      canSkip: true,
      onNext: () => setStep(2),
    },
    {
      title: 'What kind of vibe?',
      subtitle: 'Pick your favourite dining occasions',
      content: (
        <View style={styles.chipRow}>
          {VIBE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => toggleVibe(opt.value)}
              style={[
                styles.chip,
                selectedVibes.includes(opt.value) ? styles.chipNavySelected : styles.chipDefault,
              ]}
            >
              <Text style={[
                styles.chipText,
                selectedVibes.includes(opt.value) ? styles.chipTextSelected : styles.chipTextDefault,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      canSkip: true,
      onNext: handleFinish,
    },
  ];

  const currentStep = steps[step];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === step ? styles.progressDotActive : styles.progressDotInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

        {currentStep.content}

        <View style={styles.ctaBlock}>
          <TouchableOpacity
            onPress={currentStep.onNext}
            disabled={isLoading}
            style={[styles.continueButton, isLoading && styles.disabledButton]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>
                {step < steps.length - 1 ? 'Continue' : 'Finish setup'}
              </Text>
            )}
          </TouchableOpacity>

          {currentStep.canSkip && (
            <TouchableOpacity
              onPress={step < steps.length - 1 ? currentStep.onNext : handleFinish}
              style={styles.skipButton}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    height: 8,
    borderRadius: 999,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: '#e8593c',
  },
  progressDotInactive: {
    width: 8,
    backgroundColor: '#d1d5db',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#6b7280',
    marginBottom: 32,
  },
  cityList: {
    gap: 12,
  },
  cityOption: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
  },
  cityOptionSelected: {
    backgroundColor: '#e8593c',
    borderColor: '#e8593c',
  },
  cityOptionDefault: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  cityOptionText: {
    fontWeight: '600',
    fontSize: 16,
  },
  cityOptionTextSelected: {
    color: '#ffffff',
  },
  cityOptionTextDefault: {
    color: '#1a1a2e',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
  },
  chipDefault: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  chipTealSelected: {
    backgroundColor: '#1d9e75',
    borderColor: '#1d9e75',
  },
  chipNavySelected: {
    backgroundColor: '#1a1a2e',
    borderColor: '#1a1a2e',
  },
  chipText: {
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  chipTextDefault: {
    color: '#1a1a2e',
  },
  ctaBlock: {
    marginTop: 32,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#e8593c',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#9ca3af',
  },
});
