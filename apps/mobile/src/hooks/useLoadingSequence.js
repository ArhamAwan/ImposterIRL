import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

/**
 * Hook that orchestrates staggered entrance animations on mount
 * Returns opacity/transform shared values for each element
 * 
 * Timeline:
 * - 0ms: Fade in background
 * - 200ms: Silhouettes appear and start rotating
 * - 400ms: Logo drops from top with bounce
 * - 600ms: Title fades in
 * - 800ms: Tagline fades in
 * - 1000ms: Buttons slide up (staggered 100ms each)
 * - 1200ms: Bottom icons fade in
 * - 1400ms: Particles start spawning
 */
export function useLoadingSequence() {
  // Background
  const backgroundOpacity = useSharedValue(0);
  
  // Silhouettes
  const silhouettesOpacity = useSharedValue(0);
  const silhouettesScale = useSharedValue(0.8);
  
  // Logo
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-50);
  const logoScale = useSharedValue(0.8);
  
  // Title
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  
  // Tagline
  const taglineOpacity = useSharedValue(0);
  
  // Buttons (3 buttons)
  const button1Opacity = useSharedValue(0);
  const button1TranslateY = useSharedValue(30);
  const button2Opacity = useSharedValue(0);
  const button2TranslateY = useSharedValue(30);
  const button3Opacity = useSharedValue(0);
  const button3TranslateY = useSharedValue(30);
  
  // Bottom icons
  const bottomIconsOpacity = useSharedValue(0);
  
  // Particles ready flag
  const particlesReady = useSharedValue(0);

  useEffect(() => {
    // 0ms: Background fade in
    backgroundOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });

    // 200ms: Silhouettes appear
    silhouettesOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    silhouettesScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));

    // 400ms: Logo drops with bounce
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
    logoTranslateY.value = withDelay(400, withSpring(0, { damping: 12, stiffness: 150 }));
    logoScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 120 }));

    // 600ms: Title fades in
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
    titleTranslateY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 100 }));

    // 800ms: Tagline fades in
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));

    // 1000ms: Buttons slide up (staggered)
    button1Opacity.value = withDelay(1000, withTiming(1, { duration: 300 }));
    button1TranslateY.value = withDelay(1000, withSpring(0, { damping: 15, stiffness: 100 }));

    button2Opacity.value = withDelay(1100, withTiming(1, { duration: 300 }));
    button2TranslateY.value = withDelay(1100, withSpring(0, { damping: 15, stiffness: 100 }));

    button3Opacity.value = withDelay(1200, withTiming(1, { duration: 300 }));
    button3TranslateY.value = withDelay(1200, withSpring(0, { damping: 15, stiffness: 100 }));

    // 1200ms: Bottom icons fade in
    bottomIconsOpacity.value = withDelay(1300, withTiming(1, { duration: 300 }));

    // 1400ms: Particles ready
    particlesReady.value = withDelay(1400, withTiming(1, { duration: 100 }));
  }, []);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const silhouettesStyle = useAnimatedStyle(() => ({
    opacity: silhouettesOpacity.value,
    transform: [{ scale: silhouettesScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoTranslateY.value },
      { scale: logoScale.value },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const button1Style = useAnimatedStyle(() => ({
    opacity: button1Opacity.value,
    transform: [{ translateY: button1TranslateY.value }],
  }));

  const button2Style = useAnimatedStyle(() => ({
    opacity: button2Opacity.value,
    transform: [{ translateY: button2TranslateY.value }],
  }));

  const button3Style = useAnimatedStyle(() => ({
    opacity: button3Opacity.value,
    transform: [{ translateY: button3TranslateY.value }],
  }));

  const bottomIconsStyle = useAnimatedStyle(() => ({
    opacity: bottomIconsOpacity.value,
  }));

  return {
    backgroundStyle,
    silhouettesStyle,
    logoStyle,
    titleStyle,
    taglineStyle,
    button1Style,
    button2Style,
    button3Style,
    bottomIconsStyle,
    particlesReady,
  };
}

export default useLoadingSequence;

