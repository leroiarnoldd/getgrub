import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
      // Get city ID
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
        <View className="gap-3">
          {CITIES.map(city => (
            <TouchableOpacity
              key={city.slug}
              onPress={() => setSelectedCity(city.slug)}
              className={`rounded-2xl px-5 py-4 border-2 ${selectedCity === city.slug ? 'bg-getgrub-coral border-getgrub-coral' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-semibold text-base ${selectedCity === city.slug ? 'text-white' : 'text-getgrub-navy'}`}>
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
        <View className="flex-row flex-wrap gap-3">
          {DIETARY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => toggleDietary(opt.value)}
              className={`rounded-2xl px-4 py-3 border-2 ${selectedDietary.includes(opt.value) ? 'bg-getgrub-teal border-getgrub-teal' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-medium ${selectedDietary.includes(opt.value) ? 'text-white' : 'text-getgrub-navy'}`}>
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
        <View className="flex-row flex-wrap gap-3">
          {VIBE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => toggleVibe(opt.value)}
              className={`rounded-2xl px-4 py-3 border-2 ${selectedVibes.includes(opt.value) ? 'bg-getgrub-navy border-getgrub-navy' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-medium ${selectedVibes.includes(opt.value) ? 'text-white' : 'text-getgrub-navy'}`}>
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
    <SafeAreaView className="flex-1 bg-getgrub-cream">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Progress dots */}
        <View className="flex-row gap-2 mb-8">
          {steps.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === step ? 'w-8 bg-getgrub-coral' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </View>

        <Text className="text-2xl font-black text-getgrub-navy mb-2">{currentStep.title}</Text>
        <Text className="text-gray-500 mb-8">{currentStep.subtitle}</Text>

        {currentStep.content}

        <View className="mt-8 gap-3">
          <TouchableOpacity
            onPress={currentStep.onNext}
            disabled={isLoading}
            className={`bg-getgrub-coral rounded-2xl py-4 items-center ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {step < steps.length - 1 ? 'Continue' : 'Finish setup'}
              </Text>
            )}
          </TouchableOpacity>

          {currentStep.canSkip && (
            <TouchableOpacity
              onPress={step < steps.length - 1 ? currentStep.onNext : handleFinish}
              className="items-center py-2"
            >
              <Text className="text-gray-400">Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
