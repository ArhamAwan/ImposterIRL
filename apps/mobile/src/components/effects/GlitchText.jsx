import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

const GLITCH_CHARS = "█▓▒░╳╱╲⌷�765";

/**
 * GlitchText - Text that randomly glitches with flicker and chromatic effects
 * 
 * @param {string} children - The text content
 * @param {object} style - Text style
 * @param {number} intensity - Glitch intensity (0-1), default 0.5
 * @param {number} frequency - How often glitches occur in ms, default 4000
 * @param {boolean} enabled - Whether glitching is enabled
 * @param {boolean} corrupt - Whether to corrupt characters during glitch
 */
export function GlitchText({
  children,
  style,
  intensity = 0.5,
  frequency = 4000,
  enabled = true,
  corrupt = true,
  ...props
}) {
  const [displayText, setDisplayText] = useState(children);
  const [isCorrupted, setIsCorrupted] = useState(false);

  // Animation values
  const opacity = useSharedValue(1);
  const redOffsetX = useSharedValue(0);
  const blueOffsetX = useSharedValue(0);
  const skewX = useSharedValue(0);
  const scaleX = useSharedValue(1);

  // Corrupt random characters in text
  const corruptText = useCallback((text) => {
    if (typeof text !== "string") return text;
    
    const chars = text.split("");
    const numToCorrupt = Math.floor(chars.length * 0.2 * intensity);
    
    for (let i = 0; i < numToCorrupt; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      if (chars[idx] !== " ") {
        chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
    }
    
    return chars.join("");
  }, [intensity]);

  const triggerGlitch = useCallback(() => {
    if (!enabled) return;

    const glitchIntensity = intensity * 4;

    // Rapid opacity flicker
    opacity.value = withSequence(
      withTiming(0, { duration: 30 }),
      withTiming(1, { duration: 20 }),
      withTiming(0.3, { duration: 25 }),
      withTiming(1, { duration: 20 }),
      withTiming(0, { duration: 15 }),
      withTiming(1, { duration: 30 })
    );

    // Chromatic aberration - red shifts left, blue shifts right
    redOffsetX.value = withSequence(
      withTiming(-glitchIntensity, { duration: 30 }),
      withTiming(glitchIntensity * 0.5, { duration: 25 }),
      withTiming(-glitchIntensity * 0.3, { duration: 20 }),
      withTiming(0, { duration: 50 })
    );

    blueOffsetX.value = withSequence(
      withTiming(glitchIntensity, { duration: 30 }),
      withTiming(-glitchIntensity * 0.5, { duration: 25 }),
      withTiming(glitchIntensity * 0.3, { duration: 20 }),
      withTiming(0, { duration: 50 })
    );

    // Slight skew distortion
    skewX.value = withSequence(
      withTiming(intensity * 3, { duration: 40 }),
      withTiming(-intensity * 2, { duration: 30 }),
      withTiming(0, { duration: 40 })
    );

    // Scale glitch
    scaleX.value = withSequence(
      withTiming(1 + intensity * 0.05, { duration: 25 }),
      withTiming(1 - intensity * 0.02, { duration: 20 }),
      withTiming(1, { duration: 30 })
    );

    // Character corruption (10% chance)
    if (corrupt && Math.random() < 0.15) {
      setIsCorrupted(true);
      setDisplayText(corruptText(children));
      
      setTimeout(() => {
        setDisplayText(children);
        setIsCorrupted(false);
      }, 100 + Math.random() * 100);
    }
  }, [enabled, intensity, corrupt, children, corruptText, opacity, redOffsetX, blueOffsetX, skewX, scaleX]);

  // Schedule glitches
  useEffect(() => {
    if (!enabled) return;

    let timeoutId;
    const scheduleGlitch = () => {
      const delay = frequency * (0.7 + Math.random() * 0.6);
      timeoutId = setTimeout(() => {
        triggerGlitch();
        scheduleGlitch();
      }, delay);
    };

    // First glitch after random delay
    setTimeout(triggerGlitch, 1000 + Math.random() * 2000);
    scheduleGlitch();

    return () => clearTimeout(timeoutId);
  }, [enabled, frequency, triggerGlitch]);

  // Update display text when children change
  useEffect(() => {
    if (!isCorrupted) {
      setDisplayText(children);
    }
  }, [children, isCorrupted]);

  // Main text style
  const mainTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { skewX: `${skewX.value}deg` },
      { scaleX: scaleX.value },
    ],
  }));

  // Red channel (chromatic aberration)
  const redStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: redOffsetX.value }],
    opacity: Math.abs(redOffsetX.value) > 0.5 ? 0.7 : 0,
  }));

  // Blue channel (chromatic aberration)
  const blueStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: blueOffsetX.value }],
    opacity: Math.abs(blueOffsetX.value) > 0.5 ? 0.7 : 0,
  }));

  const textStyle = useMemo(() => [styles.text, style], [style]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Red chromatic layer */}
      <Animated.Text
        style={[textStyle, styles.chromaticRed, redStyle]}
        {...props}
      >
        {displayText}
      </Animated.Text>

      {/* Blue chromatic layer */}
      <Animated.Text
        style={[textStyle, styles.chromaticBlue, blueStyle]}
        {...props}
      >
        {displayText}
      </Animated.Text>

      {/* Main text */}
      <Animated.Text style={[textStyle, mainTextStyle]} {...props}>
        {displayText}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  text: {
    // Base text style
  },
  chromaticRed: {
    position: "absolute",
    color: "#FF0000",
    opacity: 0,
  },
  chromaticBlue: {
    position: "absolute",
    color: "#0000FF",
    opacity: 0,
  },
});

export default GlitchText;

