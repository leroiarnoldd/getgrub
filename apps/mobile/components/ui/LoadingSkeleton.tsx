import { View, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

interface Props {
  style?: object;
}

export function LoadingSkeleton({ style }: Props) {
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
    <Animated.View style={[styles.skeleton, style, { opacity }]} />
  );
}

export function DealCardSkeleton() {
  return (
    <View style={styles.card}>
      <LoadingSkeleton style={styles.image} />
      <View style={styles.body}>
        <LoadingSkeleton style={styles.line1} />
        <LoadingSkeleton style={styles.line2} />
        <LoadingSkeleton style={styles.line3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    height: 192,
    borderRadius: 0,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  line1: {
    height: 20,
    width: '75%',
  },
  line2: {
    height: 16,
    width: '50%',
  },
  line3: {
    height: 16,
    width: '66%',
  },
});
