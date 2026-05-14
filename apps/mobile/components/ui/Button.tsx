import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface Props {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({ onPress, label, variant = 'primary', isLoading, disabled, fullWidth }: Props) {
  const base = 'flex-row items-center justify-center rounded-2xl py-4 px-6';
  const variants = {
    primary: 'bg-getgrub-coral',
    secondary: 'bg-getgrub-navy',
    ghost: 'bg-transparent border border-getgrub-navy',
  };
  const textVariants = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-white font-semibold text-base',
    ghost: 'text-getgrub-navy font-semibold text-base',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled || isLoading ? 'opacity-50' : ''}`}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#1a1a2e' : '#fff'} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
