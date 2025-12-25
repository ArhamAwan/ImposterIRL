import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Vibration } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Fingerprint,
  Lock,
  Unlock,
  ShieldAlert,
  FileText,
  MessageCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
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
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);

  // Animation values
  const scanProgress = useSharedValue(0); // 0 to 1
  const scannerScale = useSharedValue(1);
  const lockIconScale = useSharedValue(1);
  const fingerprintOpacity = useSharedValue(0.5);

  const scanIntervalRef = useRef(null);

  useEffect(() => {
    // Reveal word if already visible (re-entering component)
    if (wordVisible) {
      setScanComplete(true);
      setShowIdentity(true);
      scanProgress.value = 1;
    }
  }, [wordVisible]);

  // IDLE ANIMATIONS
  useEffect(() => {
    if (!scanComplete) {
      fingerprintOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [scanComplete]);

  // --- INTERACTION HANDLERS ---

  const handlePressIn = () => {
    if (scanComplete) return;

    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Initial scale down effect for touch response
    scannerScale.value = withSpring(0.95);

    // Start filling progress
    // Scan takes 2 seconds to complete
    scanProgress.value = withTiming(
      1,
      {
        duration: 2000,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(handleScanComplete)();
        }
      }
    );

    // Continuous haptics loop simulation
    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 0.1;
      if (progress < 1) {
        // Increase intensity
        if (progress > 0.7) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }, 150); // Tick every 150ms
  };

  const handlePressOut = () => {
    if (scanComplete) return;

    setIsScanning(false);

    // Cancel scan
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    // Reset animations
    scannerScale.value = withSpring(1);
    scanProgress.value = withTiming(0, { duration: 300 }); // Fast reset

    // Haptic fail feedback
    Vibration.vibrate([0, 50]);
  };

  const handleScanComplete = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    setScanComplete(true);
    setIsScanning(false);

    // Success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Trigger external reveal handler
    onRevealWord();

    // Delay showing the identity identity for a brief "ACCESS GRANTED" moment
    setTimeout(() => {
      setShowIdentity(true);
    }, 800);
  };

  // --- HOST CONTROLS ---

  const handleStartDiscussion = () => {
    if (!isHost) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStartDiscussion();
  };

  // --- ANIMATED STYLES ---

  const scannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scannerScale.value }],
    borderColor: isScanning
      ? colors.primary.purpleLight
      : "rgba(255, 255, 255, 0.2)",
    shadowOpacity: isScanning ? 0.5 : 0,
  }));

  const fingerprintStyle = useAnimatedStyle(() => ({
    opacity: isScanning ? 1 : fingerprintOpacity.value,
    transform: [{ scale: isScanning ? 1.1 : 1 }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    height: `${scanProgress.value * 100}%`,
    opacity: 0.2,
  }));

  const progressBarLineStyle = useAnimatedStyle(() => ({
    top: `${scanProgress.value * 100}%`,
    opacity: isScanning ? 1 : 0,
  }));

  // --- COLORS ---
  // Determine theme based on revealed role
  const themeColor = showIdentity
    ? isImposter
      ? colors.accent.red
      : colors.accent.teal
    : colors.primary.purple;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AnimatedBackground />

      {/* HEADER */}
      <View style={[styles.header, { marginTop: insets.top + 20 }]}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>
            MISSION {currentRound}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.content}>
        {/* STATE 1: SCANNER (Not Revealed) */}
        {!scanComplete && (
          <Animated.View
            exiting={FadeIn.duration(300)}
            style={styles.scannerContainer}
          >
            <AnimatedPressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[styles.scannerButton, scannerAnimatedStyle]}
            >
              {/* Progress Fill Background */}
              <Animated.View
                style={[
                  styles.progressFill,
                  progressBarStyle,
                  { backgroundColor: themeColor },
                ]}
              />

              {/* Scanner Line */}
              <Animated.View style={[styles.scanLine, progressBarLineStyle]} />

              {/* Fingerprint Icon */}
              <Animated.View style={fingerprintStyle}>
                <Fingerprint
                  size={100}
                  color={isScanning ? "#FFF" : "rgba(255,255,255,0.5)"}
                  style={{ opacity: 0.9 }}
                />
              </Animated.View>

              <View style={styles.scannerTextContainer}>
                <Text style={styles.scannerTitle}>
                  {isScanning ? "VERIFYING..." : "IDENTITY SCAN"}
                </Text>
                <Text style={styles.scannerSubtitle}>
                  {isScanning ? "Hold steady" : "Hold to reveal role"}
                </Text>
              </View>
            </AnimatedPressable>

            <View style={styles.securityBadge}>
              <Lock size={14} color={colors.neutral.midGray} />
              <Text style={styles.securityText}>BIOMETRIC LOCK ENGAGED</Text>
            </View>
          </Animated.View>
        )}

        {/* STATE 2: REVEALED (Access Granted) */}
        {scanComplete && !showIdentity && (
          <View style={styles.accessGrantedContainer}>
            <Unlock size={64} color={colors.accent.green} />
            <GlitchText
              style={styles.accessGrantedText}
              intensity={0.5}
              frequency={100} // Fast glitch
            >
              ACCESS GRANTED
            </GlitchText>
          </View>
        )}

        {/* STATE 3: IDENTITY REVEALED */}
        {showIdentity && (
          <Animated.View
            entering={ZoomIn.springify()}
            style={styles.identityContainer}
          >
            {/* ROLE CARD */}
            <View
              style={[
                styles.roleCard,
                {
                  borderColor: isImposter
                    ? colors.accent.red
                    : colors.accent.teal,
                },
              ]}
            >
              {/* Header Badge */}
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: isImposter
                      ? "rgba(255, 87, 87, 0.2)"
                      : "rgba(0, 217, 192, 0.2)",
                  },
                ]}
              >
                {isImposter ? (
                  <ShieldAlert size={24} color={colors.accent.red} />
                ) : (
                  <FileText size={24} color={colors.accent.teal} />
                )}
                <Text
                  style={[
                    styles.roleBadgeText,
                    {
                      color: isImposter
                        ? colors.accent.red
                        : colors.accent.teal,
                    },
                  ]}
                >
                  {isImposter ? "THREAT DETECTED" : "CONFIDENTIAL"}
                </Text>
              </View>

              {/* Main Role Title */}
              <GlitchText
                style={[
                  styles.roleTitle,
                  {
                    color: isImposter ? colors.accent.red : colors.accent.teal,
                  },
                ]}
                intensity={isImposter ? 0.8 : 0.2}
              >
                {isImposter ? "IMPOSTER" : "CREWMATE"}
              </GlitchText>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: isImposter
                      ? colors.accent.red
                      : colors.accent.teal,
                  },
                ]}
              />

              {/* Content / Word */}
              {isImposter ? (
                <View style={styles.infoContainer}>
                  <Text style={styles.imposterInstruction}>
                    ELIMINATE THE CREW
                  </Text>
                  <Text style={styles.imposterSubtext}>
                    Use sabotage and deception.{"\n"}Don't get caught.
                  </Text>
                </View>
              ) : (
                <View style={styles.infoContainer}>
                  <Text style={styles.secretWordLabel}>SECRET PASSWORD</Text>
                  <Text style={styles.secretWord}>{word}</Text>
                  <Text style={styles.crewmateSubtext}>
                    Identify the Imposter.{"\n"}Trust no one.
                  </Text>
                </View>
              )}
            </View>

            {/* Caution Text */}
            <Text style={styles.cautionText}>⚠️ DO NOT SHARE THIS SCREEN</Text>
          </Animated.View>
        )}
      </View>

      {/* FOOTER ACTIONS (Host Only) */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {isHost && showIdentity && (
          <Animated.View entering={FadeIn.delay(1000)}>
            <GradientButton
              variant="primary"
              onPress={handleStartDiscussion}
              icon={<MessageCircle size={20} color="#FFF" />}
            >
              START MISSION
            </GradientButton>
          </Animated.View>
        )}

        {!isHost && showIdentity && (
          <Text style={styles.waitingText}>Waiting for host...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    alignItems: "center",
    paddingVertical: 10,
  },
  roundBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  roundText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: colors.neutral.lightGray,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  // SCANNER STYLES
  scannerContainer: {
    alignItems: "center",
    gap: 20,
  },
  scannerButton: {
    width: 280,
    height: 400,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FFF",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  scannerTextContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  scannerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#FFF",
    letterSpacing: 2,
  },
  scannerSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.neutral.lightGray,
    marginTop: 4,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.6,
  },
  securityText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    color: colors.neutral.midGray,
    letterSpacing: 1,
  },
  // ACCESS GRANTED STYLES
  accessGrantedContainer: {
    alignItems: "center",
    gap: 20,
  },
  accessGrantedText: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: colors.accent.green,
    letterSpacing: 2,
  },
  // IDENTITY STYLES
  identityContainer: {
    width: "100%",
    alignItems: "center",
  },
  roleCard: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  roleBadgeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  roleTitle: {
    fontSize: 42,
    fontFamily: "Poppins_900Black",
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: "center",
  },
  divider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  infoContainer: {
    alignItems: "center",
  },
  imposterInstruction: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  imposterSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.neutral.lightGray,
    textAlign: "center",
    lineHeight: 22,
  },
  secretWordLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: colors.neutral.midGray,
    marginBottom: 8,
    letterSpacing: 2,
  },
  secretWord: {
    fontFamily: "Poppins_700Bold",
    fontSize: 48,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 16,
  },
  crewmateSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.neutral.lightGray,
    textAlign: "center",
    lineHeight: 22,
  },
  cautionText: {
    marginTop: 24,
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: colors.neutral.midGray,
  },
  footer: {
    paddingHorizontal: 24,
    minHeight: 100,
    justifyContent: "center",
  },
  waitingText: {
    textAlign: "center",
    color: colors.neutral.midGray,
    fontFamily: "Poppins_400Regular",
  },
});
