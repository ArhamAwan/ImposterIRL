import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, Skull, MessageCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { useGlitchEffect } from "@/hooks/useGlitchEffect";
import { colors } from "@/constants/imposterColors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WordRevealPhase({
  isImposter,
  wordVisible,
  word,
  currentRound,
  totalRounds,
  isHost,
  onRevealWord,
  onStartDiscussion,
}) {
  const insets = useSafeAreaInsets();
  const { shakeStyle, redFlashStyle } = useGlitchEffect();

  // Card animations
  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0.3);
  const imposterPulse = useSharedValue(1);

  // Reveal button animation
  const revealScale = useSharedValue(1);

  useEffect(() => {
    // Pulsing glow effect
    cardGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Imposter pulse effect
    if (isImposter && wordVisible) {
      imposterPulse.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isImposter, wordVisible]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isImposter && wordVisible ? imposterPulse.value : 1 }],
    shadowOpacity: cardGlow.value,
  }));

  const revealButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealScale.value }],
  }));

  const handleRevealWord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onRevealWord();
  };

  const handleRevealPressIn = () => {
    revealScale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handleRevealPressOut = () => {
    revealScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handleStartDiscussion = () => {
    if (!isHost) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStartDiscussion();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Imposter red overlay */}
      {isImposter && wordVisible && (
        <View style={styles.imposterOverlay} pointerEvents="none" />
      )}

      {/* Glitch red flash overlay */}
      <Animated.View style={[styles.glitchOverlay, redFlashStyle]} pointerEvents="none" />

      {/* Main content with shake effect */}
      <Animated.View style={[styles.content, shakeStyle]}>
        <View
          style={[
            styles.innerContent,
            {
              paddingTop: insets.top + 40,
              paddingBottom: insets.bottom + 40,
            },
          ]}
        >
          {/* Round indicator */}
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>
              Round {currentRound} of {totalRounds}
            </Text>
          </View>

          {/* Main reveal card */}
          <Animated.View
            style={[
              styles.card,
              isImposter && wordVisible && styles.cardImposter,
              cardAnimatedStyle,
            ]}
          >
            {!wordVisible ? (
              <AnimatedPressable
                style={[styles.revealButton, revealButtonStyle]}
                onPress={handleRevealWord}
                onPressIn={handleRevealPressIn}
                onPressOut={handleRevealPressOut}
              >
                <View style={styles.eyeContainer}>
                  <Eye size={72} color={colors.primary.purple} strokeWidth={1.5} />
                </View>
                <Text style={styles.tapToReveal}>Tap to Reveal</Text>
                <Text style={styles.dontLetOthers}>
                  🤫 Don't let others see your screen!
                </Text>
              </AnimatedPressable>
            ) : (
              <View style={styles.revealedContent}>
                {isImposter ? (
                  <>
                    <Skull size={64} color={colors.accent.red} strokeWidth={1.5} />
                    <Text style={styles.imposterLabel}>YOU ARE THE</Text>
                    <Text style={styles.imposterTitle}>IMPOSTER</Text>
                    <View style={styles.imposterDivider} />
                    <Text style={styles.imposterHint}>
                      Blend in with the others.{"\n"}
                      Figure out the word without{"\n"}
                      revealing yourself!
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.yourWordLabel}>Your word is:</Text>
                    <Text style={styles.wordText}>{word}</Text>
                    <View style={styles.wordDivider} />
                    <Text style={styles.wordHint}>
                      Give clues without saying it directly.{"\n"}
                      Find the imposter!
                    </Text>
                  </>
                )}
              </View>
            )}
          </Animated.View>

          {/* Start Discussion button (host only) */}
          {isHost && (
            <View style={styles.buttonContainer}>
              <GradientButton
                variant="primary"
                onPress={handleStartDiscussion}
                icon={<MessageCircle size={20} color={colors.neutral.white} />}
                accessibilityLabel="Start the discussion phase"
                accessibilityHint="Begin the group discussion"
                style={styles.startButton}
              >
                Start Discussion
              </GradientButton>
            </View>
          )}

          {!isHost && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                Waiting for host to start discussion...
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  imposterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 50, 50, 0.15)",
    zIndex: 1,
  },
  glitchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  roundBadge: {
    position: "absolute",
    top: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  roundText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 0.85,
    backgroundColor: "transparent",
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary.purple,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  cardImposter: {
    backgroundColor: "transparent",
    borderColor: colors.accent.red,
  },
  revealButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(91, 79, 232, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  tapToReveal: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    marginBottom: 12,
  },
  dontLetOthers: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
  revealedContent: {
    alignItems: "center",
  },
  imposterLabel: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.accent.red,
    marginTop: 16,
    letterSpacing: 2,
  },
  imposterTitle: {
    fontSize: 42,
    fontFamily: "Poppins_700Bold",
    color: colors.accent.red,
    textShadowColor: colors.accent.red,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  imposterDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.accent.red,
    borderRadius: 2,
    marginVertical: 20,
  },
  imposterHint: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 150, 150, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  yourWordLabel: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 52,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    textShadowColor: colors.primary.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  wordDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary.purple,
    borderRadius: 2,
    marginVertical: 20,
  },
  wordHint: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 120,
    left: 24,
    right: 24,
  },
  startButton: {
    width: "100%",
  },
  waitingContainer: {
    position: "absolute",
    bottom: 140,
  },
  waitingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.midGray,
    textAlign: "center",
  },
});
