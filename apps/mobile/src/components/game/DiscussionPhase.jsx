import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  MessageSquare,
  Vote,
  Siren,
  Megaphone,
  AlertTriangle,
  Lightbulb,
  FastForward,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  cancelAnimation,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { colors } from "@/constants/imposterColors";
import { formatTime } from "@/utils/gameHelpers";

const { width } = Dimensions.get("window");

export function DiscussionPhase({ timeRemaining, isHost, onStartVoting }) {
  const insets = useSafeAreaInsets();

  // Animations
  const heartbeatScale = useSharedValue(1);
  const timerCircleScale = useSharedValue(1);
  const emergencyOpacity = useSharedValue(0.5);
  const backgroundRedOpacity = useSharedValue(0);

  // Determine urgency state
  const isUrgent = timeRemaining <= 30;
  const isCritical = timeRemaining <= 10;
  const isEmergency = timeRemaining === 0;

  useEffect(() => {
    // 1. CRITICAL HEARTBEAT EFFECT (Low Time)
    if (isCritical && timeRemaining > 0) {
      heartbeatScale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.05, {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }) // Pause
        ),
        -1,
        true
      );

      backgroundRedOpacity.value = withTiming(
        0.3 + (10 - timeRemaining) * 0.05
      );

      // Haptic Heartbeat
      if (Math.floor(Date.now() / 1000) % 2 === 0) {
        // Throttle haptics slightly
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else if (isUrgent) {
      // Gentle pulse for urgency
      backgroundRedOpacity.value = withTiming(0.1);
      heartbeatScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      // Normal state
      heartbeatScale.value = withSpring(1);
      backgroundRedOpacity.value = withTiming(0);
    }

    // 2. EMERGENCY LIGHTS
    emergencyOpacity.value = withRepeat(
      withTiming(isCritical ? 1 : 0.6, { duration: isCritical ? 300 : 1500 }),
      -1,
      true
    );
  }, [isCritical, isUrgent, timeRemaining]);

  // Handle Voting Start
  const handleStartVoting = () => {
    if (!isHost) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStartVoting();
  };

  // Styled Components
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeatScale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent.red,
    opacity: backgroundRedOpacity.value,
    zIndex: 1,
  }));

  const getTimerColor = () => {
    if (isCritical) return colors.accent.red;
    if (isUrgent) return colors.accent.orange;
    return colors.accent.teal; // Hi-tech feel
  };
  const timerColor = getTimerColor();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AnimatedBackground />

      {/* Red Pulse Overlay for Low Time */}
      <Animated.View style={bgStyle} pointerEvents="none" />

      {/* Main Content */}
      <Animated.View style={[styles.content, containerStyle]}>
        {/* HEADER: EMERGENCY MEETING LOGO */}
        <View style={[styles.header, { marginTop: insets.top + 20 }]}>
          <View style={styles.headerIconContainer}>
            <Siren size={32} color={colors.accent.red} />
            <View
              style={[styles.glowDot, { backgroundColor: colors.accent.red }]}
            />
          </View>
          <GlitchText
            style={styles.headerTitle}
            intensity={0.4}
            frequency={3000}
          >
            EMERGENCY MEETING
          </GlitchText>
        </View>

        {/* CENTER: TIMER DISK */}
        <View style={styles.timerContainer}>
          {/* Outer Ring */}
          <View style={[styles.outerRing, { borderColor: timerColor }]}>
            {/* Inner Ring */}
            <View style={styles.innerRing}>
              <Text style={[styles.timerValue, { color: timerColor }]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.timerLabel}>
                {isCritical ? "CRITICAL" : "REMAINING"}
              </Text>
            </View>
          </View>

          {/* Critical Warning Label */}
          {isCritical && (
            <Animated.View
              entering={FadeInDown.springify()}
              style={styles.criticalBadge}
            >
              <AlertTriangle size={16} color="#FFF" />
              <Text style={styles.criticalText}>SYSTEM CRITICAL</Text>
            </Animated.View>
          )}
        </View>

        {/* BOTTOM: TACTICAL INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.discussionPrompt}>WHO IS THE IMPOSTER?</Text>

          {/* Discussion Tips Carousel */}
          <View style={styles.tipCard}>
            <Lightbulb
              size={20}
              color={colors.accent.orangeLight}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.tipText}>
              "Check if anyone is staying silent or agreeing too quickly."
            </Text>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          {isHost ? (
            <GradientButton
              variant={isEmergency ? "primary" : "secondary"}
              onPress={handleStartVoting}
              icon={
                isEmergency ? (
                  <Vote size={24} color="#FFF" />
                ) : (
                  <FastForward size={20} color="#FFF" />
                )
              }
              style={{ opacity: 1 }}
            >
              {isEmergency
                ? "INITIATE VOTE"
                : `FORCE VOTE NOW (${timeRemaining}s)`}
            </GradientButton>
          ) : (
            <Text style={styles.waitingText}>
              {isEmergency
                ? "Waiting for Host to start vote..."
                : "Discuss with your crew"}
            </Text>
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
  content: {
    flex: 1,
    zIndex: 10,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 87, 87, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.accent.red,
  },
  headerTitle: {
    fontFamily: "Poppins_900Black",
    fontSize: 22,
    color: "#FFF",
    letterSpacing: 2,
    textAlign: "center",
  },
  glowDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 10,
    right: 15,
    shadowColor: colors.accent.red,
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  // TIMER STYLES
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  outerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  innerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.darker,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  timerValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 64,
    fontVariant: ["tabular-nums"],
  },
  timerLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.neutral.midGray,
    letterSpacing: 2,
    marginTop: -5,
  },
  criticalBadge: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent.red,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  criticalText: {
    color: "#FFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  // INFO SECTION
  infoSection: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  discussionPrompt: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#FFF",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: colors.accent.red,
    textShadowRadius: 10,
  },
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.neutral.lightGray,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  waitingText: {
    textAlign: "center",
    color: colors.neutral.midGray,
    fontFamily: "Poppins_400Regular",
  },
});
