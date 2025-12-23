import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Trophy, User, Target, Skull, Home, Crown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { colors } from "@/constants/imposterColors";

const GOLD = "#FFD700";
const SILVER = "#C0C0C0";
const BRONZE = "#CD7F32";

export function GameFinishedScreen({ sortedScores, onEndGame }) {
  const insets = useSafeAreaInsets();
  const winner = sortedScores?.[0];

  // Animation values
  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(0);
  const winnerOpacity = useSharedValue(0);
  const scoresOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Dramatic entrance animation
    trophyScale.value = withSequence(
      withTiming(1.3, { duration: 500, easing: Easing.out(Easing.back) }),
      withTiming(1, { duration: 300 })
    );

    trophyRotate.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 200 }),
      withTiming(0, { duration: 150 })
    );

    winnerOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    scoresOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Continuous glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Celebration haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const trophyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const winnerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: winnerOpacity.value,
  }));

  const scoresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scoresOpacity.value,
  }));

  const handleEndGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onEndGame();
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

      {/* Animated Background */}
      <AnimatedBackground style={{ zIndex: -1 }} />

      {/* Gold celebration overlay */}
      <View style={styles.celebrationOverlay} pointerEvents="none" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trophy Section */}
        <View style={styles.trophySection}>
          <GlitchView intensity={0.5} frequency={4000}>
            <Animated.View
              style={[
                styles.trophyContainer,
                trophyAnimatedStyle,
                glowAnimatedStyle,
              ]}
            >
              <Trophy size={64} color={GOLD} />
            </Animated.View>
          </GlitchView>

          <GlitchText
            style={styles.gameOverTitle}
            intensity={0.6}
            frequency={3000}
            corrupt={true}
          >
            Game Over!
          </GlitchText>
        </View>

        {/* Winner Card */}
        {winner && (
          <Animated.View style={[styles.winnerCard, winnerAnimatedStyle]}>
            <View style={styles.winnerBadge}>
              <Crown size={20} color={GOLD} />
            </View>
            <Text style={styles.winnerLabel}>Champion</Text>

            <View style={styles.winnerInfo}>
              <View
                style={[
                  styles.winnerAvatar,
                  { backgroundColor: winner.player?.avatar_color },
                ]}
              >
                <User size={32} color="#000" />
              </View>
              <Text style={styles.winnerName}>{winner.player?.name}</Text>
            </View>

            <Text style={styles.winnerScore}>{winner.total_score}</Text>
            <Text style={styles.winnerScoreLabel}>points</Text>
          </Animated.View>
        )}

        {/* Leaderboard Card */}
        <Animated.View style={[styles.leaderboardCard, scoresAnimatedStyle]}>
          <Text style={styles.leaderboardTitle}>Final Leaderboard</Text>

          {sortedScores?.map((score, index) => (
            <View
              key={score.player_id}
              style={[styles.scoreRow, index > 0 && styles.scoreRowBorder]}
            >
              {/* Rank Badge */}
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: getRankBgColor(index) },
                ]}
              >
                <Text style={[styles.rankText, { color: getRankColor(index) }]}>
                  {index + 1}
                </Text>
              </View>

              {/* Player Avatar */}
              <View
                style={[
                  styles.playerAvatar,
                  { backgroundColor: score.player?.avatar_color },
                ]}
              >
                <User size={20} color="#000" />
              </View>

              {/* Player Info */}
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{score.player?.name}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Target size={12} color={colors.accent.green} />
                    <Text style={styles.statText}>
                      {score.correct_votes || 0}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Skull size={12} color={colors.accent.red} />
                    <Text style={styles.statText}>
                      {score.survived_as_imposter || 0}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Score */}
              <View style={styles.scoreContainer}>
                <Text
                  style={[styles.scoreValue, index === 0 && { color: GOLD }]}
                >
                  {score.total_score || 0}
                </Text>
                <Text style={styles.scorePts}>pts</Text>
              </View>
            </View>
          ))}

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <Target size={14} color={colors.accent.green} />
              <Text style={styles.legendText}>Correct votes</Text>
            </View>
            <View style={styles.legendItem}>
              <Skull size={14} color={colors.accent.red} />
              <Text style={styles.legendText}>Survived as imposter</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar with Button - Outside ScrollView */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable onPress={handleEndGame} style={styles.mainMenuButton}>
          <Home size={20} color={colors.neutral.white} />
          <Text style={styles.mainMenuButtonText}>Back to Main Menu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 215, 0, 0.03)",
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  trophySection: {
    alignItems: "center",
    marginBottom: 24,
  },
  trophyContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderWidth: 3,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
  },
  gameOverTitle: {
    fontSize: 36,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    textAlign: "center",
  },
  winnerCard: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.4)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  winnerBadge: {
    position: "absolute",
    top: -16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.dark,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  winnerLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: GOLD,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
    marginTop: 8,
  },
  winnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  winnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  winnerName: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
  },
  winnerScore: {
    fontSize: 56,
    fontFamily: "Poppins_700Bold",
    color: GOLD,
    lineHeight: 64,
  },
  winnerScoreLabel: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginTop: -4,
  },
  leaderboardCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  scoreRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
  },
  scorePts: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.midGray,
    marginTop: -2,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.midGray,
  },
  buttonContainer: {
    marginTop: 8,
  },
  endButton: {
    width: "100%",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 10,
  },
  mainMenuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary.purple,
  },
  mainMenuButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.white,
  },
});
