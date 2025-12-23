import React, { useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

/**
 * GlitchView - Wraps any component to add glitch effects
 * 
 * @param {ReactNode} children - Child components
 * @param {object} style - Container style
 * @param {number} intensity - Glitch intensity (0-1), default 0.5
 * @param {number} frequency - How often glitches occur in ms, default 5000
 * @param {boolean} enabled - Whether glitching is enabled
 * @param {boolean} jitter - Enable position jitter effect
 * @param {boolean} flicker - Enable opacity flicker effect
 * @param {boolean} scale - Enable scale pulse effect
 */
export function GlitchView({
  children,
  style,
  intensity = 0.5,
  frequency = 5000,
  enabled = true,
  jitter = true,
  flicker = true,
  scale = true,
  ...props
}) {
  // Animation values
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const rotation = useSharedValue(0);
  const skewX = useSharedValue(0);

  const triggerGlitch = useCallback(() => {
    if (!enabled) return;

    const jitterAmount = intensity * 8;
    const flickerMin = 1 - intensity * 0.7;

    // Opacity flicker
    if (flicker) {
      opacity.value = withSequence(
        withTiming(flickerMin, { duration: 20 }),
        withTiming(1, { duration: 15 }),
        withTiming(0.2, { duration: 25 }),
        withTiming(1, { duration: 20 }),
        withTiming(flickerMin + 0.3, { duration: 15 }),
        withTiming(1, { duration: 30 })
      );
    }

    // Position jitter
    if (jitter) {
      translateX.value = withSequence(
        withTiming(jitterAmount, { duration: 25 }),
        withTiming(-jitterAmount * 0.7, { duration: 20 }),
        withTiming(jitterAmount * 0.4, { duration: 20 }),
        withTiming(-jitterAmount * 0.2, { duration: 15 }),
        withTiming(0, { duration: 25 })
      );

      translateY.value = withSequence(
        withTiming(-jitterAmount * 0.5, { duration: 20 }),
        withTiming(jitterAmount * 0.4, { duration: 25 }),
        withTiming(-jitterAmount * 0.2, { duration: 20 }),
        withTiming(0, { duration: 20 })
      );
    }

    // Scale pulse
    if (scale) {
      scaleValue.value = withSequence(
        withTiming(1 + intensity * 0.08, { duration: 30 }),
        withTiming(1 - intensity * 0.03, { duration: 25 }),
        withTiming(1 + intensity * 0.02, { duration: 20 }),
        withTiming(1, { duration: 35 })
      );
    }

    // Rotation glitch
    rotation.value = withSequence(
      withTiming(intensity * 2, { duration: 25 }),
      withTiming(-intensity * 1.5, { duration: 20 }),
      withTiming(intensity * 0.5, { duration: 20 }),
      withTiming(0, { duration: 30 })
    );

    // Skew distortion
    skewX.value = withSequence(
      withTiming(intensity * 5, { duration: 30 }),
      withTiming(-intensity * 3, { duration: 25 }),
      withTiming(0, { duration: 35 })
    );
  }, [enabled, intensity, jitter, flicker, scale, opacity, translateX, translateY, scaleValue, rotation, skewX]);

  // Schedule glitches
  useEffect(() => {
    if (!enabled) return;

    let timeoutId;
    const scheduleGlitch = () => {
      const delay = frequency * (0.6 + Math.random() * 0.8);
      timeoutId = setTimeout(() => {
        triggerGlitch();
        scheduleGlitch();
      }, delay);
    };

    // First glitch after random delay
    setTimeout(triggerGlitch, 500 + Math.random() * 2000);
    scheduleGlitch();

    return () => clearTimeout(timeoutId);
  }, [enabled, frequency, triggerGlitch]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scaleValue.value },
      { rotate: `${rotation.value}deg` },
      { skewX: `${skewX.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
}

/**
 * Simpler version for subtle ambient glitching
 */
export function SubtleGlitchView({
  children,
  style,
  frequency = 8000,
  enabled = true,
  ...props
}) {
  return (
    <GlitchView
      style={style}
      intensity={0.3}
      frequency={frequency}
      enabled={enabled}
      jitter={true}
      flicker={true}
      scale={false}
      {...props}
    >
      {children}
    </GlitchView>
  );
}

export default GlitchView;

