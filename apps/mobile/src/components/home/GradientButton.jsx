import React, { useEffect, memo } from 'react';
import { StyleSheet, Pressable, Text, View, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, gradients } from '@/constants/imposterColors';
import { GlitchText } from '@/components/effects/GlitchText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function GradientButton({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'test'
  onPress,
  icon,
  style,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  glitchText = true, // Enable text glitching
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const borderOpacity = useSharedValue(0.3);
  const shimmerPosition = useSharedValue(0);

  // Pulsing glow effect for primary button
  useEffect(() => {
    if (variant === 'primary') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1250, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [variant]);

  // Shimmer effect for secondary button border
  useEffect(() => {
    if (variant === 'secondary') {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [variant]);

  const handlePressIn = () => {
    const springConfig = { damping: 15, stiffness: 150 };
    
    if (variant === 'primary') {
      scale.value = withSpring(1.03, springConfig);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (variant === 'secondary') {
      scale.value = withSpring(1.02, springConfig);
      borderOpacity.value = withTiming(0.6, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      scale.value = withSpring(0.98, springConfig);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    if (variant === 'secondary') {
      borderOpacity.value = withTiming(0.3, { duration: 200 });
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255, 255, 255, ${borderOpacity.value})`,
    backgroundColor: interpolate(
      borderOpacity.value,
      [0.3, 0.6],
      [0, 0.15]
    ) > 0 ? `rgba(91, 79, 232, ${interpolate(borderOpacity.value, [0.3, 0.6], [0, 0.15])})` : 'transparent',
  }));

  const renderText = () => {
    const textStyle = [
      styles.text,
      variant === 'secondary' && styles.secondaryText,
      variant === 'test' && styles.testText,
    ];

    if (glitchText && typeof children === 'string') {
      return (
        <GlitchText
          style={textStyle}
          intensity={variant === 'primary' ? 0.5 : 0.3}
          frequency={variant === 'primary' ? 4000 : 6000}
          corrupt={variant === 'primary'}
        >
          {children}
        </GlitchText>
      );
    }

    return <Text style={textStyle}>{children}</Text>;
  };

  const getButtonContent = () => (
    <View style={styles.content}>
      {icon && <View style={styles.icon}>{icon}</View>}
      {renderText()}
    </View>
  );

  if (variant === 'primary') {
    return (
      <Animated.View style={[animatedContainerStyle, style]}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
        >
          <Animated.View style={[styles.primaryShadow, animatedGlowStyle]}>
            <LinearGradient
              colors={gradients.primaryButton}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {getButtonContent()}
            </LinearGradient>
          </Animated.View>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[animatedContainerStyle, style]}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
        >
          <Animated.View style={[styles.secondaryButton, animatedBorderStyle]}>
            {getButtonContent()}
          </Animated.View>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  // Test button
  return (
    <Animated.View style={[animatedContainerStyle, style]}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={gradients.testButton}
          style={styles.testButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {getButtonContent()}
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryShadow: {
    borderRadius: 16,
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  primaryButton: {
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: 64,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  testButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontSize: typography.buttonText.fontSize,
    fontWeight: typography.buttonText.fontWeight,
    letterSpacing: typography.buttonText.letterSpacing,
    color: colors.neutral.white,
  },
  secondaryText: {
    color: colors.neutral.white,
  },
  testText: {
    fontSize: 16,
    color: colors.background.darker,
  },
});

export default memo(GradientButton);
