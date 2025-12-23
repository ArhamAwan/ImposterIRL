import { useEffect, useState, useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

/**
 * Enhanced hook that triggers dramatic glitch effects every 3-6 seconds
 * Returns shared values for screen shake, color shift, flash overlay,
 * chromatic aberration, and visibility flicker
 */
export function useGlitchEffect(enabled = true) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  // Core shake effects
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const redFlash = useSharedValue(0);
  const scanlineY = useSharedValue(-100);

  // Enhanced effects
  const chromaticRedX = useSharedValue(0);
  const chromaticBlueX = useSharedValue(0);
  const flickerOpacity = useSharedValue(1);
  const distortSkewX = useSharedValue(0);
  const distortScaleX = useSharedValue(1);
  const noiseOpacity = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => listener?.remove?.();
  }, []);

  const triggerGlitch = useCallback(() => {
    if (reduceMotion || !enabled) return;

    setIsGlitching(true);

    // DRAMATIC screen shake - more intense
    shakeX.value = withSequence(
      withTiming(12, { duration: 25 }),
      withTiming(-10, { duration: 25 }),
      withTiming(8, { duration: 20 }),
      withTiming(-8, { duration: 20 }),
      withTiming(5, { duration: 18 }),
      withTiming(-4, { duration: 18 }),
      withTiming(2, { duration: 15 }),
      withTiming(0, { duration: 20 })
    );

    shakeY.value = withSequence(
      withTiming(-6, { duration: 22 }),
      withTiming(5, { duration: 22 }),
      withTiming(-4, { duration: 18 }),
      withTiming(3, { duration: 18 }),
      withTiming(-2, { duration: 15 }),
      withTiming(0, { duration: 20 })
    );

    // DRAMATIC red flash - pulsing
    redFlash.value = withSequence(
      withTiming(0.6, { duration: 40 }),
      withTiming(0.15, { duration: 25 }),
      withTiming(0.45, { duration: 35 }),
      withTiming(0.1, { duration: 25 }),
      withTiming(0.3, { duration: 30 }),
      withTiming(0, { duration: 60 })
    );

    // Scanline sweep
    scanlineY.value = -20;
    scanlineY.value = withDelay(
      20,
      withTiming(1000, { duration: 180, easing: Easing.linear })
    );

    // Chromatic aberration - red/blue split
    chromaticRedX.value = withSequence(
      withTiming(-6, { duration: 30 }),
      withTiming(4, { duration: 25 }),
      withTiming(-2, { duration: 20 }),
      withTiming(0, { duration: 40 })
    );

    chromaticBlueX.value = withSequence(
      withTiming(6, { duration: 30 }),
      withTiming(-4, { duration: 25 }),
      withTiming(2, { duration: 20 }),
      withTiming(0, { duration: 40 })
    );

    // Flicker effect - rapid visibility toggling
    flickerOpacity.value = withSequence(
      withTiming(0.3, { duration: 20 }),
      withTiming(1, { duration: 15 }),
      withTiming(0, { duration: 25 }),
      withTiming(1, { duration: 20 }),
      withTiming(0.5, { duration: 18 }),
      withTiming(1, { duration: 25 }),
      withTiming(0.2, { duration: 15 }),
      withTiming(1, { duration: 30 })
    );

    // Skew distortion
    distortSkewX.value = withSequence(
      withTiming(4, { duration: 35 }),
      withTiming(-3, { duration: 30 }),
      withTiming(1.5, { duration: 25 }),
      withTiming(0, { duration: 35 })
    );

    // Scale distortion
    distortScaleX.value = withSequence(
      withTiming(1.03, { duration: 30 }),
      withTiming(0.97, { duration: 25 }),
      withTiming(1.01, { duration: 20 }),
      withTiming(1, { duration: 30 })
    );

    // Noise flash
    noiseOpacity.value = withSequence(
      withTiming(0.15, { duration: 30 }),
      withTiming(0, { duration: 20 }),
      withTiming(0.1, { duration: 25 }),
      withTiming(0, { duration: 40 })
    );

    setTimeout(() => setIsGlitching(false), 350);
  }, [reduceMotion, enabled, shakeX, shakeY, redFlash, scanlineY, chromaticRedX, chromaticBlueX, flickerOpacity, distortSkewX, distortScaleX, noiseOpacity]);

  // Trigger glitch every 3-6 seconds (more frequent)
  useEffect(() => {
    if (reduceMotion || !enabled) return;

    let timeoutId;
    const scheduleNextGlitch = () => {
      const delay = 3000 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        triggerGlitch();
        scheduleNextGlitch();
      }, delay);
    };

    // First glitch after 1.5 seconds
    setTimeout(triggerGlitch, 1500);
    scheduleNextGlitch();
    
    return () => clearTimeout(timeoutId);
  }, [reduceMotion, enabled, triggerGlitch]);

  // Core styles
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { translateY: shakeY.value },
    ],
  }));

  const redFlashStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255, 87, 87, ${redFlash.value})`,
  }));

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlineY.value }],
  }));

  // Enhanced styles
  const chromaticStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: chromaticRedX.value },
    ],
  }));

  const flickerStyle = useAnimatedStyle(() => ({
    opacity: flickerOpacity.value,
  }));

  const distortStyle = useAnimatedStyle(() => ({
    transform: [
      { skewX: `${distortSkewX.value}deg` },
      { scaleX: distortScaleX.value },
    ],
  }));

  const noiseStyle = useAnimatedStyle(() => ({
    opacity: noiseOpacity.value,
  }));

  // Combined glitch style for easy application
  const fullGlitchStyle = useAnimatedStyle(() => ({
    opacity: flickerOpacity.value,
    transform: [
      { translateX: shakeX.value },
      { translateY: shakeY.value },
      { skewX: `${distortSkewX.value}deg` },
      { scaleX: distortScaleX.value },
    ],
  }));

  return {
    // Actions
    triggerGlitch,
    isGlitching,
    reduceMotion,
    
    // Core styles
    shakeStyle,
    redFlashStyle,
    scanlineStyle,
    
    // Enhanced styles
    chromaticStyle,
    flickerStyle,
    distortStyle,
    noiseStyle,
    fullGlitchStyle,
    
    // Raw values for custom use
    shakeX,
    shakeY,
    redFlash,
    chromaticRedX,
    chromaticBlueX,
    flickerOpacity,
    distortSkewX,
    distortScaleX,
    noiseOpacity,
  };
}

export default useGlitchEffect;
