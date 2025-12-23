import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Trophy,
  ArrowLeft,
  User,
  Target,
  Skull,
  Gamepad2,
  TrendingUp,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeIn,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { GhostCrewmate, BlueCrewmate } from "@/components/svg/Crewmates";
import { colors } from "@/constants/imposterColors";
import { apiUrl } from "@/constants/api";
import { getPlayerData } from "@/utils/gameStorage";
import { PhaseTransition } from "@/components/game/PhaseTransition";

const GOLD = "#FFD700";
const SILVER = "#C0C0C0";
const BRONZE = "#CD7F32";

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [ownStats, setOwnStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get player name from storage
      const playerData = await getPlayerData();
      const name = playerData?.playerName || "";
      setPlayerName(name);

      if (!name) {
        setError("No player name found. Play a game first!");
        setLoading(false);
        return;
      }

      // Fetch leaderboard from API
      const response = await fetch(
        apiUrl(`/api/leaderboard?player_name=${encodeURIComponent(name)}`)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();
      setOwnStats(data.own_stats);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getRankColor = (index) => {
    if (index === 0) return GOLD;
    if (index === 1) return SILVER;
    if (index === 2) return BRONZE;
    return colors.neutral.lightGray;
  };

  const getRankBgColor = (index) => {
    if (index === 0) return "rgba(255, 215, 0, 0.2)";
    if (index === 1) return "rgba(192, 192, 192, 0.2)";
    if (index === 2) return "rgba(205, 127, 50, 0.2)";
    return "rgba(255, 255, 255, 0.1)";
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PhaseTransition>
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <GlitchView intensity={0.5} frequency={4000}>
              <Trophy size={28} color={GOLD} />
            </GlitchView>
            <GlitchText
              style={styles.headerTitle}
              intensity={0.5}
              frequency={3500}
              corrupt={true}
            >
              Leaderboard
            </GlitchText>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.purple} />
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <GhostCrewmate size={100} opacity={0.6} />
            <Text style={styles.emptyTitle}>No Games Yet</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <GradientButton
              variant="primary"
              onPress={handleBack}
              style={styles.emptyButton}
            >
              Go Play!
            </GradientButton>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BlueCrewmate size={100} />
            <Text style={styles.emptyTitle}>No Opponents Yet</Text>
            <Text style={styles.emptySubtitle}>
              Play some games with friends to see your stats!
            </Text>
            <GradientButton
              variant="primary"
              onPress={handleBack}
              style={styles.emptyButton}
            >
              Start Playing
            </GradientButton>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
          >
            {/* Your Stats Card */}
            {ownStats && (
              <Animated.View
                entering={FadeIn.delay(100).duration(400)}
                style={styles.ownStatsCard}
              >
                <Text style={styles.ownStatsTitle}>Your Stats</Text>
                <Text style={styles.ownStatsName}>{playerName}</Text>

                <View style={styles.ownStatsGrid}>
                  <View style={styles.ownStatItem}>
                    <Gamepad2 size={20} color={colors.primary.purple} />
                    <Text style={styles.ownStatValue}>
                      {ownStats.total_games}
                    </Text>
                    <Text style={styles.ownStatLabel}>Games</Text>
                  </View>
                  <View style={styles.ownStatItem}>
                    <Trophy size={20} color={GOLD} />
                    <Text style={styles.ownStatValue}>
                      {ownStats.total_wins}
                    </Text>
                    <Text style={styles.ownStatLabel}>Wins</Text>
                  </View>
                  <View style={styles.ownStatItem}>
                    <TrendingUp size={20} color={colors.accent.green} />
                    <Text style={styles.ownStatValue}>
                      {ownStats.win_rate}%
                    </Text>
                    <Text style={styles.ownStatLabel}>Win Rate</Text>
                  </View>
                  <View style={styles.ownStatItem}>
                    <Skull size={20} color={colors.accent.red} />
                    <Text style={styles.ownStatValue}>
                      {ownStats.times_survived}
                    </Text>
                    <Text style={styles.ownStatLabel}>Escaped</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Opponents Section */}
            <Text style={styles.sectionTitle}>Players You've Faced</Text>

            {leaderboard.map((player, index) => (
              <Animated.View
                key={player.opponent_name}
                entering={FadeIn.delay(200 + index * 100).duration(400)}
                style={styles.playerCard}
              >
                <View style={styles.playerRow}>
                  {/* Rank Badge */}
                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: getRankBgColor(index) },
                    ]}
                  >
                    <Text
                      style={[styles.rankText, { color: getRankColor(index) }]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  {/* Player Info */}
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.opponent_name}
                    </Text>
                    <Text style={styles.gamesPlayed}>
                      {player.games_played} game
                      {player.games_played !== 1 ? "s" : ""} together
                    </Text>
                  </View>

                  {/* Win Rate */}
                  <View style={styles.winRateContainer}>
                    <Text style={styles.winRateValue}>{player.win_rate}%</Text>
                    <Text style={styles.winRateLabel}>vs them</Text>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Trophy size={14} color={GOLD} />
                    <Text style={styles.statChipText}>{player.wins} W</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Target size={14} color={colors.accent.red} />
                    <Text style={styles.statChipText}>
                      {player.times_caught_as_imposter} caught
                    </Text>
                  </View>
                  <View style={styles.statChip}>
                    <Skull size={14} color={colors.accent.green} />
                    <Text style={styles.statChipText}>
                      {player.times_survived_as_imposter} escaped
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </PhaseTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
  },
  headerSpacer: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    zIndex: 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    width: 200,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  ownStatsCard: {
    backgroundColor: "rgba(138, 43, 226, 0.15)",
    borderWidth: 2,
    borderColor: colors.primary.purple,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  ownStatsTitle: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 4,
  },
  ownStatsName: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    marginBottom: 20,
  },
  ownStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ownStatItem: {
    alignItems: "center",
    flex: 1,
  },
  ownStatValue: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    marginTop: 8,
  },
  ownStatLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
  },
  gamesPlayed: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    marginTop: 2,
  },
  winRateContainer: {
    alignItems: "flex-end",
  },
  winRateValue: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: colors.accent.green,
  },
  winRateLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statChipText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
  },
});
