import React, { useEffect, useState, memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, gradients } from '@/constants/imposterColors';
import {
  RedCrewmate,
  BlueCrewmate,
  OrangeCrewmate,
  GhostCrewmate,
} from '@/components/svg/Crewmates';

const { width, height } = Dimensions.get('window');
const NUM_SILHOUETTES = 8;

// Crewmate types for random selection
const CREWMATE_TYPES = ['red', 'blue', 'orange', 'ghost'];

// Random starting positions spread across the screen
const getRandomPosition = (index) => ({
  x: 40 + (index % 4) * ((width - 80) / 3) + (Math.random() - 0.5) * 60,
  y: 80 + Math.floor(index / 4) * ((height - 200) / 2) + (Math.random() - 0.5) * 80,
});

// Get random crewmate type (ghost is less common)
const getRandomCrewmateType = () => {
  const rand = Math.random();
  if (rand < 0.35) return 'red';
  if (rand < 0.65) return 'blue';
  if (rand < 0.9) return 'orange';
  return 'ghost';
};

const FloatingSilhouette = memo(({ index, isGlowing, reduceMotion, crewmateType }) => {
  const initialPos = getRandomPosition(index);
  
  const translateX = useSharedValue(initialPos.x);
  const translateY = useSharedValue(initialPos.y);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.9 + Math.random() * 0.3);

  useEffect(() => {
    if (reduceMotion) return;

    // Random float duration between 4-8 seconds
    const floatDuration = 4000 + Math.random() * 4000;
    const floatRange = 30 + Math.random() * 40;
    const delay = index * 300;

    // Horizontal floating
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(initialPos.x + floatRange, { 
            duration: floatDuration, 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(initialPos.x - floatRange, { 
            duration: floatDuration, 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1,
        true
      )
    );

    // Vertical floating (different timing for organic movement)
    const verticalDuration = 3000 + Math.random() * 3000;
    const verticalRange = 20 + Math.random() * 30;
    
    translateY.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(initialPos.y - verticalRange, { 
            duration: verticalDuration, 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(initialPos.y + verticalRange, { 
            duration: verticalDuration, 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1,
        true
      )
    );

    // Gentle rotation
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-15, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Subtle scale pulsing
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  // Varying sizes: 36, 44, 52
  const size = 36 + (index % 3) * 8;
  
  // Apply glow effect opacity
  const glowOpacity = isGlowing ? 1 : 0.25;

  const renderCrewmate = () => {
    const style = { opacity: glowOpacity };
    
    switch (crewmateType) {
      case 'red':
        return <RedCrewmate size={size} style={style} />;
      case 'blue':
        return <BlueCrewmate size={size} style={style} />;
      case 'orange':
        return <OrangeCrewmate size={size} style={style} />;
      case 'ghost':
        return <GhostCrewmate size={size} style={style} opacity={isGlowing ? 0.8 : 0.4} />;
      default:
        return <BlueCrewmate size={size} style={style} />;
    }
  };

  return (
    <Animated.View style={[styles.silhouette, animatedStyle]}>
      {renderCrewmate()}
    </Animated.View>
  );
});

export function AnimatedBackground({ style }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [glowingIndex, setGlowingIndex] = useState(-1);

  // Generate random crewmate types once on mount
  const crewmateTypes = useMemo(() => 
    Array.from({ length: NUM_SILHOUETTES }).map(() => getRandomCrewmateType()),
    []
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => listener?.remove?.();
  }, []);

  // Random red glow effect every 2-4 seconds
  useEffect(() => {
    if (reduceMotion) return;

    let timeoutId;
    const triggerGlow = () => {
      const randomIndex = Math.floor(Math.random() * NUM_SILHOUETTES);
      setGlowingIndex(randomIndex);
      setTimeout(() => setGlowingIndex(-1), 600);
    };

    const scheduleGlow = () => {
      const delay = 2000 + Math.random() * 2000;
      timeoutId = setTimeout(() => {
        triggerGlow();
        scheduleGlow();
      }, delay);
    };

    // First glow after 1 second
    setTimeout(triggerGlow, 1000);
    scheduleGlow();
    return () => clearTimeout(timeoutId);
  }, [reduceMotion]);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <LinearGradient
        colors={gradients.background}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Randomly floating crewmates */}
      {Array.from({ length: NUM_SILHOUETTES }).map((_, i) => (
        <FloatingSilhouette
          key={i}
          index={i}
          isGlowing={i === glowingIndex}
          reduceMotion={reduceMotion}
          crewmateType={crewmateTypes[i]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  silhouette: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default memo(AnimatedBackground);
