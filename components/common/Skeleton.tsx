import React, { useEffect } from 'react';
import { DimensionValue, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  variant?: 'rect' | 'circle';
  style?: ViewStyle | ViewStyle[];
}

export function Skeleton({ width = '100%', height = 20, variant = 'rect', style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const borderRadius = variant === 'circle' ? 9999 : 8;

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          backgroundColor: '#CBD5E1', // Slate-300 like color
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
