import React, { useEffect, useState, memo } from "react";
import { View, Text, StyleSheet, AccessibilityInfo, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, typography } from "@/constants/imposterColors";
import { GlitchText } from "@/components/effects/GlitchText";

// Import images
const innocentCrewmate = require("../../../assets/images/crewmate-innocent.png");
const scaryCrewmate = require("../../../assets/images/crewmate-scary.png");

export function AppLogo({ style, logoStyle, titleStyle, taglineStyle }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Floating animation values
  const floatY = useSharedValue(0);

  // Scare animation values
  const scaryOpacity = useSharedValue(0);
  const innocentOpacity = useSharedValue(1);
  const scareScale = useSharedValue(1);
  const scaryScale = useSharedValue(1); // Extra scale for scary image
  const flashOpacity = useSharedValue(0);
  const darkOverlay = useSharedValue(0); // Dark vignette
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const scaryGlow = useSharedValue(0); // Red glow intensity

  // Glitch effect values
  const glitchRotation = useSharedValue(0);
  const chromaticOffset = useSharedValue(0);
  const scaryChromaticOffset = useSharedValue(0); // Extra chromatic for scary

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => listener?.remove?.();
  }, []);

  // Floating animation (8px up/down, 3-second loop)
  useEffect(() => {
    if (reduceMotion) return;

    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion]);

  // Trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Scare animation - triggers frequently
  useEffect(() => {
    if (reduceMotion) return;

    const triggerScare = () => {
      // Trigger haptic
      triggerHaptic();

      // Intense shake/vibration
      shakeX.value = withSequence(
        withTiming(12, { duration: 18 }),
        withTiming(-12, { duration: 18 }),
        withTiming(10, { duration: 15 }),
        withTiming(-10, { duration: 15 }),
        withTiming(6, { duration: 12 }),
        withTiming(-6, { duration: 12 }),
        withTiming(3, { duration: 10 }),
        withTiming(0, { duration: 8 })
      );

      shakeY.value = withSequence(
        withTiming(-8, { duration: 15 }),
        withTiming(8, { duration: 15 }),
        withTiming(-5, { duration: 12 }),
        withTiming(5, { duration: 12 }),
        withTiming(0, { duration: 8 })
      );

      // Aggressive rotation glitch
      glitchRotation.value = withSequence(
        withTiming(10, { duration: 20 }),
        withTiming(-10, { duration: 20 }),
        withTiming(6, { duration: 18 }),
        withTiming(-4, { duration: 15 }),
        withTiming(0, { duration: 15 })
      );

      // Strong chromatic aberration
      chromaticOffset.value = withSequence(
        withTiming(20, { duration: 35 }),
        withTiming(-15, { duration: 30 }),
        withTiming(10, { duration: 25 }),
        withTiming(0, { duration: 35 })
      );

      // Dark overlay - screen darkens
      darkOverlay.value = withDelay(
        25,
        withSequence(
          withTiming(0.6, { duration: 40 }),
          withTiming(0.4, { duration: 500 }),
          withTiming(0, { duration: 200 })
        )
      );

      // Intense red flash
      flashOpacity.value = withDelay(
        25,
        withSequence(
          withTiming(1, { duration: 20 }),
          withTiming(0.6, { duration: 30 }),
          withTiming(0.8, { duration: 25 }),
          withTiming(0.4, { duration: 35 }),
          withTiming(0, { duration: 80 })
        )
      );

      // Scary red glow pulsing
      scaryGlow.value = withDelay(
        25,
        withSequence(
          withTiming(1, { duration: 30 }),
          withTiming(0.6, { duration: 100 }),
          withTiming(0.9, { duration: 80 }),
          withTiming(0.5, { duration: 100 }),
          withTiming(0.8, { duration: 80 }),
          withTiming(0, { duration: 150 })
        )
      );

      // Switch to scary - hold it longer (700ms)
      innocentOpacity.value = withSequence(
        withDelay(25, withTiming(0, { duration: 30 })),
        withDelay(700, withTiming(1, { duration: 150 }))
      );

      scaryOpacity.value = withSequence(
        withDelay(25, withTiming(1, { duration: 30 })),
        withDelay(700, withTiming(0, { duration: 150 }))
      );

      // SCARY IMAGE GETS BIGGER - 1.4x its normal size!
      scaryScale.value = withDelay(
        25,
        withSequence(
          withTiming(1.5, { duration: 50, easing: Easing.out(Easing.back) }),
          withTiming(1.35, { duration: 80 }),
          withTiming(1.45, { duration: 60 }),
          withTiming(1.4, { duration: 400 }),
          withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
        )
      );

      // Extra chromatic on scary
      scaryChromaticOffset.value = withDelay(
        25,
        withSequence(
          withTiming(15, { duration: 40 }),
          withTiming(-10, { duration: 60 }),
          withTiming(8, { duration: 80 }),
          withTiming(-5, { duration: 100 }),
          withTiming(0, { duration: 150 })
        )
      );

      // Overall scale pop
      scareScale.value = withDelay(
        25,
        withSequence(
          withTiming(1.3, { duration: 50, easing: Easing.out(Easing.back) }),
          withTiming(1.15, { duration: 80 }),
          withTiming(1.2, { duration: 50 }),
          withTiming(1.1, { duration: 400 }),
          withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
        )
      );
    };

    const scheduleNextScare = () => {
      const delay = 3000 + Math.random() * 3000; // 3-6 seconds (very frequent!)
      return setTimeout(() => {
        triggerScare();
        scheduleNextScare();
      }, delay);
    };

    // First scare after 2 seconds
    const firstScare = setTimeout(triggerScare, 2000);
    const timeoutId = scheduleNextScare();

    return () => {
      clearTimeout(firstScare);
      clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: shakeX.value },
      { translateY: shakeY.value },
      { rotate: `${glitchRotation.value}deg` },
      { scale: scareScale.value },
    ],
  }));

  const innocentStyle = useAnimatedStyle(() => ({
    opacity: innocentOpacity.value,
  }));

  const scaryStyle = useAnimatedStyle(() => ({
    opacity: scaryOpacity.value,
    transform: [
      { scale: scaryScale.value },
      { translateX: scaryChromaticOffset.value * 0.5 },
    ],
    transform: [
      { scale: scaryScale.value },
      { translateX: scaryChromaticOffset.value * 0.5 },
    ],
    // Removed shadow props to prevent artifacts and rely on scaryGlow view
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const darkOverlayStyle = useAnimatedStyle(() => ({
    opacity: darkOverlay.value,
  }));

  const scaryGlowStyle = useAnimatedStyle(() => ({
    opacity: scaryGlow.value * 0.8,
    transform: [{ scale: 1 + scaryGlow.value * 0.3 }],
  }));

  const chromaticLeftStyle = useAnimatedStyle(() => ({
    opacity: 0.5,
    transform: [{ translateX: -chromaticOffset.value }],
    tintColor: "#ff0000",
  }));

  const chromaticRightStyle = useAnimatedStyle(() => ({
    opacity: 0.5,
    transform: [{ translateX: chromaticOffset.value }],
    tintColor: "#00ffff",
  }));

  // Scary chromatic layers
  const scaryChromaticLeftStyle = useAnimatedStyle(() => ({
    opacity: scaryOpacity.value * 0.6,
    transform: [
      { scale: scaryScale.value },
      { translateX: -scaryChromaticOffset.value },
    ],
    tintColor: "#ff0000",
  }));

  const scaryChromaticRightStyle = useAnimatedStyle(() => ({
    opacity: scaryOpacity.value * 0.6,
    transform: [
      { scale: scaryScale.value },
      { translateX: scaryChromaticOffset.value },
    ],
    tintColor: "#00ff00",
  }));

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* Dark overlay for scary effect */}
      <Animated.View style={[styles.darkOverlay, darkOverlayStyle]} />

      {/* Logo with crewmate images */}
      <Animated.View
        style={[styles.logoWrapper, logoStyle, !reduceMotion && containerStyle]}
      >
        <View style={styles.logoContainer}>
          {/* Chromatic aberration layers for innocent (behind main images) */}
          <Animated.Image
            source={innocentCrewmate}
            style={[
              styles.crewmateImage,
              styles.chromaticLayer,
              chromaticLeftStyle,
            ]}
            resizeMode="contain"
          />
          <Animated.Image
            source={innocentCrewmate}
            style={[
              styles.crewmateImage,
              styles.chromaticLayer,
              chromaticRightStyle,
            ]}
            resizeMode="contain"
          />

          {/* Innocent crewmate (default) */}
          <Animated.Image
            source={innocentCrewmate}
            style={[styles.crewmateImage, innocentStyle]}
            resizeMode="contain"
          />

          {/* Red glow behind scary */}
          <Animated.View style={[styles.scaryGlow, scaryGlowStyle]} />

          {/* Chromatic aberration for scary */}
          <Animated.Image
            source={scaryCrewmate}
            style={[
              styles.scaryImage,
              styles.chromaticLayer,
              scaryChromaticLeftStyle,
            ]}
            resizeMode="contain"
          />
          <Animated.Image
            source={scaryCrewmate}
            style={[
              styles.scaryImage,
              styles.chromaticLayer,
              scaryChromaticRightStyle,
            ]}
            resizeMode="contain"
          />

          {/* Scary crewmate (appears during scare) - BIGGER! */}
          <Animated.Image
            source={scaryCrewmate}
            style={[styles.scaryImage, scaryStyle]}
            resizeMode="contain"
          />

          {/* Red danger flash overlay */}
          <Animated.View style={[styles.flashOverlay, flashStyle]} />
        </View>
      </Animated.View>

      {/* Title with GlitchText */}
      <Animated.View style={titleStyle}>
        <GlitchText
          style={styles.title}
          intensity={0.7}
          frequency={3500}
          enabled={!reduceMotion}
          corrupt={true}
        >
          IRL Imposter
        </GlitchText>
      </Animated.View>

      {/* Tagline with subtle GlitchText */}
      <Animated.View style={taglineStyle}>
        <GlitchText
          style={styles.tagline}
          intensity={0.4}
          frequency={5000}
          enabled={!reduceMotion}
          corrupt={false}
        >
          Find the imposter among your friends
        </GlitchText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  darkOverlay: {
    position: "absolute",
    width: 4000,
    height: 4000,
    top: -2000,
    left: -2000,
    backgroundColor: "#000000",
    zIndex: -1,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoContainer: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  crewmateImage: {
    width: 220,
    height: 220,
    position: "absolute",
  },
  scaryImage: {
    width: 260,
    height: 260,
    position: "absolute",
    zIndex: 2,
  },
  scaryGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#ff0000",
    zIndex: 1,
  },
  chromaticLayer: {
    position: "absolute",
    zIndex: -1,
  },
  flashOverlay: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accent.red,
    zIndex: 10,
  },
  title: {
    fontSize: typography.logoTitle.fontSize,
    fontWeight: typography.logoTitle.fontWeight,
    letterSpacing: typography.logoTitle.letterSpacing,
    color: colors.neutral.white,
    textAlign: "center",
    marginBottom: 8,
    // Purple shadow
    textShadowColor: colors.primary.purple,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: typography.tagline.fontSize,
    fontWeight: typography.tagline.fontWeight,
    letterSpacing: typography.tagline.letterSpacing,
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
});

export default memo(AppLogo);
