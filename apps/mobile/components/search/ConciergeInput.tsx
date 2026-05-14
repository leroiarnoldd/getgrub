import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ConciergeInput({ value, onChangeText, onSubmit, isLoading }: Props) {
  return (
    <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 gap-3">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="What are you in the mood for?"
        placeholderTextColor="#9ca3af"
        className="flex-1 text-getgrub-navy text-base"
        returnKeyType="search"
        autoFocus
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onSubmit} disabled={isLoading}>
          <Ionicons name={isLoading ? 'hourglass' : 'arrow-forward-circle'} size={24} color="#e8593c" />
        </TouchableOpacity>
      )}
    </View>
  );
}
