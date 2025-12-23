import React, { useEffect, memo } from 'react';
import { StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/imposterColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BottomNavIcon({
  icon: Icon,
  onPress,
  staggerIndex = 0,
  accessibilityLabel,
  accessibilityHint,
}) {
  const [reduceMotion, setReduceMotion] = React.useState(false);
  
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => listener?.remove?.();
  }, []);

  // Staggered floating animation (2-second loop, 0.3s stagger)
  useEffect(() => {
    if (reduceMotion) return;

    const staggerDelay = staggerIndex * 300; // 0.3s stagger

    floatY.value = withDelay(
      staggerDelay,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [staggerIndex, reduceMotion]);

  const handlePressIn = () => {
    scale.value = withSpring(1.15, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(0.6, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      <Icon size={24} color={colors.neutral.white} strokeWidth={1.5} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default memo(BottomNavIcon);

