import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { ArrowLeft, Crown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { useGlitchEffect } from "@/hooks/useGlitchEffect";
import { colors } from "@/constants/imposterColors";
import {
  savePlayerData,
  saveLobbyCode,
  generatePlayerId,
} from "@/utils/gameStorage";
import { apiUrl } from "@/constants/api";
import { PhaseTransition } from "@/components/game/PhaseTransition";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CreateLobby() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Glitch effects
  const { shakeStyle, redFlashStyle } = useGlitchEffect();

  // Back button animation
  const backButtonScale = useSharedValue(1);

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const handleBackPressIn = () => {
    backButtonScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackPressOut = () => {
    backButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handleCreate = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const playerId = generatePlayerId();

      const response = await fetch(apiUrl("/api/lobby/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim(), playerId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create lobby");
      }

      const data = await response.json();

      await savePlayerData({
        playerId: data.playerId,
        playerName: data.playerName,
        avatarColor: data.avatarColor,
        isHost: data.isHost,
      });
      await saveLobbyCode(data.code);

      router.replace(`/lobby/${data.code}`);
    } catch (error) {
      console.error("Error creating lobby:", error);
      Alert.alert("Error", "Failed to create lobby. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PhaseTransition>
        {/* Animated Background with floating silhouettes */}
        <AnimatedBackground />

        {/* Glitch red flash overlay */}
        <Animated.View
          style={[styles.glitchOverlay, redFlashStyle]}
          pointerEvents="none"
        />

        {/* Main content with shake effect */}
        <Animated.View style={[styles.content, shakeStyle]}>
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
              <AnimatedPressable
                style={[styles.backButton, backButtonStyle]}
                onPress={() => router.back()}
                onPressIn={handleBackPressIn}
                onPressOut={handleBackPressOut}
              >
                <ArrowLeft size={22} color={colors.neutral.white} />
              </AnimatedPressable>

              <Text style={styles.title}>Create Lobby</Text>

              {/* Spacer for centering */}
              <View style={styles.headerSpacer} />
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Crown
                  size={48}
                  color={colors.primary.purple}
                  strokeWidth={1.5}
                />
              </View>

              <Text style={styles.subtitle}>Host a Game</Text>
              <Text style={styles.description}>
                Enter your name to create a new lobby and invite your friends
              </Text>

              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={[styles.input, inputFocused && styles.inputFocused]}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={playerName}
                  onChangeText={setPlayerName}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  maxLength={20}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Create Button */}
              <GradientButton
                variant="primary"
                onPress={handleCreate}
                disabled={loading}
                icon={<Crown size={20} color={colors.neutral.white} />}
                accessibilityLabel="Create a new game lobby"
                accessibilityHint="Tap to host a game"
                style={styles.createButton}
              >
                {loading ? "Creating..." : "Create Lobby"}
              </GradientButton>
            </View>
          </View>
        </Animated.View>
      </PhaseTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  glitchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  content: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    textAlign: "center",
    textShadowColor: colors.primary.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSpacer: {
    width: 44,
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -60,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(91, 79, 232, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(91, 79, 232, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 10,
  },
  input: {
    height: 60,
    backgroundColor: "transparent",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    fontSize: 17,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.white,
  },
  inputFocused: {
    borderColor: colors.primary.purple,
    borderWidth: 2,
  },
  createButton: {
    width: "100%",
  },
});
