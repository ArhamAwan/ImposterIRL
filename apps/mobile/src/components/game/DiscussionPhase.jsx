import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MessageSquare, Vote } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { colors } from "@/constants/imposterColors";
import { formatTime } from "@/utils/gameHelpers";

export function DiscussionPhase({
  timeRemaining,
  isHost,
  onStartVoting,
}) {
  const insets = useSafeAreaInsets();

  // Progressive shake animation
  const shakeX = useSharedValue(0);
  const timerScale = useSharedValue(1);
  const timerGlow = useSharedValue(0.5);

  // Calculate shake intensity based on time remaining
  const getShakeIntensity = () => {
    if (timeRemaining > 60) return 0;
    if (timeRemaining > 30) return 2;
    if (timeRemaining > 10) return 5;
    if (timeRemaining > 0) return 12;
    return 0;
  };

  // Calculate shake speed based on time remaining
  const getShakeSpeed = () => {
    if (timeRemaining > 60) return 200;
    if (timeRemaining > 30) return 150;
    if (timeRemaining > 10) return 80;
    if (timeRemaining > 0) return 40;
    return 200;
  };

  // Get timer color based on time
  const getTimerColor = () => {
    if (timeRemaining <= 10) return colors.accent.red;
    if (timeRemaining <= 30) return colors.accent.orange;
    return colors.primary.purple;
  };

  useEffect(() => {
    const intensity = getShakeIntensity();
    const speed = getShakeSpeed();

    if (intensity > 0) {
      // Progressive shake effect
      shakeX.value = withRepeat(
        withSequence(
          withTiming(intensity, { duration: speed, easing: Easing.linear }),
          withTiming(-intensity, { duration: speed, easing: Easing.linear })
        ),
        -1,
        true
      );

      // Pulsing timer when low on time
      if (timeRemaining <= 10) {
        timerScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }

      // Haptic feedback at key moments
      if (timeRemaining === 30 || timeRemaining === 10 || timeRemaining === 5) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      cancelAnimation(shakeX);
      shakeX.value = withTiming(0, { duration: 100 });
    }

    // Glow animation
    timerGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [timeRemaining]);

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: timerScale.value }
    ],
    shadowOpacity: timerGlow.value,
  }));

  const handleStartVoting = () => {
    if (!isHost) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStartVoting();
  };

  const timerColor = getTimerColor();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Red flash overlay when time is critical */}
      {timeRemaining <= 10 && timeRemaining > 0 && (
        <Animated.View 
          style={[
            styles.criticalOverlay,
            { opacity: (10 - timeRemaining) * 0.03 }
          ]} 
          pointerEvents="none" 
        />
      )}

      {/* Main content */}
      <View style={styles.content}>
      <View
          style={[
            styles.innerContent,
            {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <GlitchView intensity={0.4} frequency={5000}>
              <MessageSquare size={24} color={colors.neutral.lightGray} />
            </GlitchView>
            <GlitchText
              style={styles.headerText}
              intensity={0.5}
              frequency={4000}
              corrupt={true}
            >
              Discussion Time
            </GlitchText>
          </View>

          {/* Timer Circle */}
          <View style={styles.timerSection}>
            <Animated.View
              style={[
                styles.timerCircle,
                {
                  borderColor: timerColor,
                  shadowColor: timerColor,
                },
                timerAnimatedStyle,
              ]}
            >
              <Text style={[styles.timerText, { color: timerColor }]}>
              {formatTime(timeRemaining)}
              </Text>
              {timeRemaining <= 10 && timeRemaining > 0 && (
                <Text style={styles.hurryText}>HURRY!</Text>
              )}
            </Animated.View>

            {/* Time status message */}
            <Text style={styles.statusText}>
              {timeRemaining > 60
                ? "Take your time discussing"
                : timeRemaining > 30
                  ? "Discussion winding down..."
                  : timeRemaining > 10
                    ? "Wrap up your discussion!"
                    : timeRemaining > 0
                      ? "⚠️ Almost out of time!"
                      : "Time's up!"}
            </Text>
        </View>

          {/* Rules Card */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>💬 Discussion Rules</Text>
            <View style={styles.rulesList}>
              <Text style={styles.ruleItem}>
              • Put your phones face-down during discussion
            </Text>
              <Text style={styles.ruleItem}>
              • Ask questions and give clues about the word
            </Text>
              <Text style={styles.ruleItem}>
              • Don't say the word directly!
            </Text>
              <Text style={styles.ruleItem}>
              • Everyone must participate
            </Text>
          </View>
        </View>

          {/* Start Voting Button (host only, when time is up) */}
          {isHost && (
            <View style={styles.buttonContainer}>
              <GradientButton
                variant={timeRemaining === 0 ? "primary" : "secondary"}
            onPress={handleStartVoting}
                icon={<Vote size={20} color={colors.neutral.white} />}
                accessibilityLabel="Start the voting phase"
                accessibilityHint="Begin voting for the imposter"
                style={styles.voteButton}
                disabled={timeRemaining > 0}
              >
                {timeRemaining === 0 ? "Start Voting" : `Voting in ${formatTime(timeRemaining)}`}
              </GradientButton>
            </View>
          )}

          {!isHost && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                {timeRemaining === 0
                  ? "Waiting for host to start voting..."
                  : "Discuss with your group!"}
            </Text>
            </View>
        )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  criticalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent.red,
    zIndex: 50,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
  },
  timerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    elevation: 10,
  },
  timerText: {
    fontSize: 56,
    fontFamily: "Poppins_700Bold",
    marginTop: 8,
  },
  hurryText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: colors.accent.red,
    letterSpacing: 2,
    marginTop: 4,
  },
  statusText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginTop: 20,
    textAlign: "center",
  },
  rulesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  rulesTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
    marginBottom: 16,
  },
  rulesList: {
    gap: 10,
  },
  ruleItem: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 20,
  },
  voteButton: {
    width: "100%",
  },
  waitingContainer: {
    marginTop: "auto",
    marginBottom: 40,
    alignItems: "center",
  },
  waitingText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.midGray,
    textAlign: "center",
  },
});
