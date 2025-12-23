import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { View, StyleSheet, Dimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { HelpCircle, Search, Eye } from 'lucide-react-native';
import { colors } from '@/constants/imposterColors';

const { width, height } = Dimensions.get('window');
const MAX_PARTICLES = 15;

const PARTICLE_ICONS = [
  { Icon: HelpCircle, name: 'question' },
  { Icon: Search, name: 'magnify' },
  { Icon: Eye, name: 'eye' },
];

const Particle = memo(({ id, startX, size, duration, onComplete }) => {
  const translateY = useSharedValue(height + 50);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  const particleType = PARTICLE_ICONS[id % PARTICLE_ICONS.length];

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(0.2, { duration: 1000 });
    scale.value = withTiming(1, { duration: 500 });

    // Move upward
    translateY.value = withTiming(-100, { 
      duration, 
      easing: Easing.linear 
    });

    // Horizontal sway
    translateX.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Gentle rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Fade out near top and cleanup
    const fadeTimer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 1000 });
    }, duration - 1500);

    const cleanupTimer = setTimeout(() => {
      onComplete(id);
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const IconComponent = particleType.Icon;

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: startX },
        animatedStyle,
      ]}
    >
      <IconComponent
        size={size}
        color={colors.neutral.white}
        strokeWidth={1.5}
      />
    </Animated.View>
  );
});

export function FloatingParticles({ enabled = true }) {
  const [particles, setParticles] = useState([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const nextIdRef = useRef(0);
  const spawnTimeoutRef = useRef(null);

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => listener?.remove?.();
  }, []);

  const removeParticle = useCallback((id) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const spawnParticle = useCallback(() => {
    setParticles(prev => {
      if (prev.length >= MAX_PARTICLES) return prev;

      const newParticle = {
        id: nextIdRef.current++,
        startX: Math.random() * (width - 50) + 25,
        size: 20 + Math.random() * 12, // 20-32px
        duration: 6000 + Math.random() * 2000, // 6-8 seconds
      };

      return [...prev, newParticle];
    });
  }, []);

  // Spawn particles every 3-4 seconds
  useEffect(() => {
    if (reduceMotion || !enabled) return;

    const scheduleSpawn = () => {
      const delay = 3000 + Math.random() * 1000; // 3-4 seconds
      spawnTimeoutRef.current = setTimeout(() => {
        spawnParticle();
        scheduleSpawn();
      }, delay);
    };

    // Initial spawn after a short delay
    const initialDelay = setTimeout(() => {
      spawnParticle();
      scheduleSpawn();
    }, 500);

    return () => {
      clearTimeout(initialDelay);
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }
    };
  }, [reduceMotion, enabled, spawnParticle]);

  if (reduceMotion || !enabled) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <Particle
          key={`particle-${particle.id}`}
          id={particle.id}
          startX={particle.startX}
          size={particle.size}
          duration={particle.duration}
          onComplete={removeParticle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    bottom: 0,
  },
});

export default memo(FloatingParticles);
