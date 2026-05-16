import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ConciergeInput({ value, onChangeText, onSubmit, isLoading }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="What are you in the mood for?"
        placeholderTextColor="#9ca3af"
        style={styles.input}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#1a1a2e',
    fontSize: 16,
  },
});
