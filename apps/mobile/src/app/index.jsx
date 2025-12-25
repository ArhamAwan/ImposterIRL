import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  TouchableOpacity,
  Text,
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
import {
  Crown,
  KeyRound,
  Settings,
  HelpCircle,
  Trophy,
} from "lucide-react-native";
import Animated from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { FloatingParticles } from "@/components/home/FloatingParticles";
import { AppLogo } from "@/components/home/AppLogo";
import { GradientButton } from "@/components/home/GradientButton";
import { BottomNavIcon } from "@/components/home/BottomNavIcon";
import { useLoadingSequence } from "@/hooks/useLoadingSequence";
import { useGlitchEffect } from "@/hooks/useGlitchEffect";
import { colors } from "@/constants/imposterColors";
import { apiUrl } from "@/constants/api";
import { getPlayerData, getLobbyCode } from "@/utils/gameStorage";
import { PhaseTransition } from "@/components/game/PhaseTransition";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Animation hooks
  const {
    logoStyle,
    titleStyle,
    taglineStyle,
    button1Style,
    button2Style,
    button3Style,
    bottomIconsStyle,
  } = useLoadingSequence();

  const { shakeStyle, redFlashStyle } = useGlitchEffect();

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Check for existing game session on mount
  useEffect(() => {
    checkExistingGame();
  }, []);

  const checkExistingGame = async () => {
    const lobbyCode = await getLobbyCode();
    const playerData = await getPlayerData();

    if (lobbyCode && playerData) {
      try {
        const response = await fetch(apiUrl(`/api/lobby/${lobbyCode}`));
        if (response.ok) {
          router.push(`/lobby/${lobbyCode}`);
        }
      } catch (error) {
        console.error("Error checking existing game:", error);
      }
    }
  };

  // Navigation handlers
  const handleCreateLobby = () => {
    router.push("/create-lobby");
  };

  const handleJoinLobby = () => {
    router.push("/join-lobby");
  };

  const handleTestMode = () => {
    router.push("/test-game");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleHowToPlay = () => {
    router.push("/how-to-play");
  };

  const handleHistory = () => {
    router.push("/leaderboard");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PhaseTransition>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 20,
            zIndex: 999,
            padding: 12,
            backgroundColor: "rgba(255, 0, 0, 0.3)",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
          onPress={() => router.push("/debug/showcase")}
        >
          <Text
            style={{
              color: "#FFF",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            DEV MODE
          </Text>
        </TouchableOpacity>

        {/* Animated Background with silhouettes - NO wrapper opacity */}
        <AnimatedBackground />

        {/* Floating particles */}
        <FloatingParticles enabled={!reduceMotion} />

        {/* Glitch red flash overlay - DRAMATIC */}
        <Animated.View
          style={[styles.glitchOverlay, redFlashStyle]}
          pointerEvents="none"
        />

        {/* Main content with shake effect */}
        <Animated.View style={[styles.content, shakeStyle]}>
          {/* Logo Section */}
          <View style={[styles.logoSection, { paddingTop: insets.top + 20 }]}>
            <AppLogo
              logoStyle={logoStyle}
              titleStyle={titleStyle}
              taglineStyle={taglineStyle}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsSection}>
            <Animated.View style={button1Style}>
              <GradientButton
                variant="primary"
                onPress={handleCreateLobby}
                icon={<Crown size={22} color={colors.neutral.white} />}
                accessibilityLabel="Create a new game lobby"
                accessibilityHint="Tap to host a game"
                style={styles.button}
              >
                Create Lobby
              </GradientButton>
            </Animated.View>

            <Animated.View style={button2Style}>
              <GradientButton
                variant="secondary"
                onPress={handleJoinLobby}
                icon={<KeyRound size={22} color={colors.neutral.white} />}
                accessibilityLabel="Join an existing game"
                accessibilityHint="Enter a lobby code to join friends"
                style={styles.button}
              >
                Join Lobby
              </GradientButton>
            </Animated.View>

            <Animated.View style={button3Style}>
              <GradientButton
                variant="test"
                onPress={handleTestMode}
                accessibilityLabel="Enter test mode"
                accessibilityHint="Test the game without other players"
                style={styles.button}
              >
                🔧 Test Mode
              </GradientButton>
            </Animated.View>
          </View>

          {/* Bottom Navigation Icons */}
          <Animated.View
            style={[
              styles.bottomNav,
              bottomIconsStyle,
              { paddingBottom: insets.bottom + 24 },
            ]}
          >
            <BottomNavIcon
              icon={Settings}
              staggerIndex={0}
              onPress={handleSettings}
              accessibilityLabel="Settings"
              accessibilityHint="Open app settings"
            />
            <BottomNavIcon
              icon={HelpCircle}
              staggerIndex={1}
              onPress={handleHowToPlay}
              accessibilityLabel="How to Play"
              accessibilityHint="Learn how to play the game"
            />
            <BottomNavIcon
              icon={Trophy}
              staggerIndex={2}
              onPress={handleHistory}
              accessibilityLabel="Game History"
              accessibilityHint="View your past games"
            />
          </Animated.View>
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
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsSection: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  button: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingVertical: 16,
  },
});
