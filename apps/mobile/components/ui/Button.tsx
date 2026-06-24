import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({ onPress, label, variant = 'primary', isLoading, disabled, fullWidth }: Props) {
  const variantStyle = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    ghost: styles.variantGhost,
  }[variant];

  const textStyle = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    ghost: styles.textGhost,
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        variantStyle,
        fullWidth && styles.fullWidth,
        (disabled || isLoading) && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#1a1a2e' : '#fff'} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  variantPrimary: {
    backgroundColor: '#1A1A2E',
  },
  variantSecondary: {
    backgroundColor: '#1a1a2e',
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  textPrimary: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  textSecondary: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  textGhost: {
    color: '#1a1a2e',
    fontWeight: '600',
    fontSize: 16,
  },
});
