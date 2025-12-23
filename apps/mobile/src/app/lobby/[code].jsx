import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Share2,
  ArrowLeft,
  Play,
  User,
  Users,
  Settings,
  Clock,
  Hash,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { colors } from "@/constants/imposterColors";
import { getPlayerData, clearGameData } from "@/utils/gameStorage";
import { apiUrl } from "@/constants/api";
import { PhaseTransition } from "@/components/game/PhaseTransition";

export default function LobbyWaitingRoom() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Animals");
  const [roundDuration, setRoundDuration] = useState(300);
  const [totalRounds, setTotalRounds] = useState(3);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    const playerData = await getPlayerData();
    setCurrentPlayer(playerData);
  };

  const { data: lobbyData, refetch } = useQuery({
    queryKey: ["lobby", code],
    queryFn: async () => {
      const response = await fetch(apiUrl(`/api/lobby/${code}`));
      if (!response.ok) {
        throw new Error("Failed to fetch lobby");
      }
      return response.json();
    },
    refetchInterval: 2000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(apiUrl("/api/categories"));
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (lobbyData?.lobby?.status === "playing") {
      router.replace(`/game/${code}`);
    }
  }, [lobbyData]);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Join my IRL Imposter game!\nLobby Code: ${code}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleStartGame = async () => {
    if (!currentPlayer?.isHost) return;

    if (lobbyData?.players?.length < 2) {
      Alert.alert(
        "Not Enough Players",
        "You need at least 2 players to start the game."
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsStarting(true);

    try {
      const response = await fetch(apiUrl("/api/lobby/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          category: selectedCategory,
          roundDuration,
          totalRounds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start game");
      }

      queryClient.invalidateQueries({ queryKey: ["lobby", code] });
    } catch (error) {
      console.error("Error starting game:", error);
      Alert.alert("Error", "Failed to start game. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Leave Lobby", "Are you sure you want to leave?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          await clearGameData();
          router.replace("/");
        },
      },
    ]);
  };

  if (!fontsLoaded || !lobbyData) {
    return (
      <View style={styles.container}>
        <AnimatedBackground />
        <View style={styles.loadingContainer}>
          <GlitchText
            style={styles.loadingText}
            intensity={0.5}
            frequency={3000}
          >
            Loading...
          </GlitchText>
        </View>
      </View>
    );
  }

  const canStartGame = lobbyData?.players?.length >= 2 && currentPlayer?.isHost;
  const categories = categoriesData?.categories || [
    "Animals",
    "Food",
    "Movies",
    "Sports",
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PhaseTransition>
        {/* Animated Background */}
        <AnimatedBackground />

        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleLeave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={20} color={colors.neutral.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.lobbyLabel}>Lobby</Text>
              <GlitchText
                style={styles.lobbyCode}
                intensity={0.6}
                frequency={4000}
                corrupt={true}
              >
                {code}
              </GlitchText>
            </View>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Share2 size={20} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Players Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Users size={20} color={colors.primary.purple} />
                <Text style={styles.cardTitle}>
                  Players ({lobbyData?.players?.length}/10)
                </Text>
              </View>

              {lobbyData?.players?.map((player, index) => (
                <View
                  key={player.id}
                  style={[
                    styles.playerRow,
                    index > 0 && styles.playerRowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.playerAvatar,
                      { backgroundColor: player.avatar_color },
                    ]}
                  >
                    <User size={20} color="#000" />
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  {player.is_host && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>HOST</Text>
                    </View>
                  )}
                </View>
              ))}

              {lobbyData?.players?.length < 2 && (
                <View style={styles.waitingForPlayers}>
                  <Text style={styles.waitingText}>
                    Waiting for more players to join...
                  </Text>
                </View>
              )}
            </View>

            {/* Game Settings (Host Only) */}
            {currentPlayer?.isHost && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Settings size={20} color={colors.primary.purple} />
                  <Text style={styles.cardTitle}>Game Settings</Text>
                </View>

                {/* Category Selection */}
                <Text style={styles.settingLabel}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryPill,
                        selectedCategory === category &&
                          styles.categoryPillSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCategory(category);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category &&
                            styles.categoryTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Round Duration */}
                <View style={styles.settingRow}>
                  <Clock size={16} color={colors.neutral.lightGray} />
                  <Text style={styles.settingLabel}>Round Duration</Text>
                </View>
                <View style={styles.optionsRow}>
                  {[180, 300, 420].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.optionButton,
                        roundDuration === duration &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRoundDuration(duration);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          roundDuration === duration &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {duration / 60} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Number of Rounds */}
                <View style={styles.settingRow}>
                  <Hash size={16} color={colors.neutral.lightGray} />
                  <Text style={styles.settingLabel}>Number of Rounds</Text>
                </View>
                <View style={styles.optionsRow}>
                  {[1, 3, 5].map((rounds) => (
                    <TouchableOpacity
                      key={rounds}
                      style={[
                        styles.optionButton,
                        totalRounds === rounds && styles.optionButtonSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTotalRounds(rounds);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          totalRounds === rounds && styles.optionTextSelected,
                        ]}
                      >
                        {rounds}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Non-host waiting message */}
            {!currentPlayer?.isHost && (
              <View style={styles.waitingCard}>
                <GlitchView intensity={0.4} frequency={5000}>
                  <Text style={styles.waitingTitle}>Waiting for Host</Text>
                </GlitchView>
                <Text style={styles.waitingSubtitle}>
                  The host will start the game when everyone is ready
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Start Game Button (Host Only) */}
          {currentPlayer?.isHost && (
            <View style={styles.bottomBar}>
              <GradientButton
                variant={canStartGame ? "primary" : "secondary"}
                onPress={handleStartGame}
                disabled={!canStartGame}
                icon={
                  <Play
                    size={20}
                    color={colors.neutral.white}
                    fill={colors.neutral.white}
                  />
                }
                style={styles.startButton}
                loading={isStarting}
              >
                {canStartGame
                  ? "Start Game"
                  : `Need ${
                      2 - (lobbyData?.players?.length || 0)
                    } more player(s)`}
              </GradientButton>
            </View>
          )}
        </View>
      </PhaseTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  lobbyLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 4,
  },
  lobbyCode: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.purple,
    letterSpacing: 6,
    textShadowColor: colors.primary.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  playerRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.white,
  },
  hostBadge: {
    backgroundColor: "rgba(138, 43, 226, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.purple,
  },
  hostBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.purple,
    letterSpacing: 1,
  },
  waitingForPlayers: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  waitingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.midGray,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginRight: 10,
  },
  categoryPillSelected: {
    backgroundColor: "rgba(138, 43, 226, 0.3)",
    borderColor: colors.primary.purple,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
  },
  categoryTextSelected: {
    color: colors.neutral.white,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "rgba(138, 43, 226, 0.3)",
    borderColor: colors.primary.purple,
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.lightGray,
  },
  optionTextSelected: {
    color: colors.neutral.white,
  },
  waitingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },
  waitingTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.midGray,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  startButton: {
    width: "100%",
  },
});
