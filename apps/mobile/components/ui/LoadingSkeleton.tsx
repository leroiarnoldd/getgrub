import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={{ opacity }} className={`bg-gray-200 rounded-lg ${className}`} />
  );
}

export function DealCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
      <LoadingSkeleton className="h-48 rounded-none" />
      <View className="p-4 gap-2">
        <LoadingSkeleton className="h-5 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-4 w-2/3" />
      </View>
    </View>
  );
}
