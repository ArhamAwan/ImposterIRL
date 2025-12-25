import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Trophy,
  User,
  Target,
  Skull,
  Home,
  Crown,
  RefreshCw,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  BounceIn,
  FadeInDown,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { colors } from "@/constants/imposterColors";

const GOLD = "#FFD700";
const SILVER = "#C0C0C0";
const BRONZE = "#CD7F32";

export function GameFinishedScreen({ sortedScores, onEndGame }) {
  const insets = useSafeAreaInsets();

  // Top 3 players
  const winner = sortedScores?.[0];
  const second = sortedScores?.[1];
  const third = sortedScores?.[2];
  const others = sortedScores?.slice(3) || [];

  // Shared Values for sequencing
  const headerOpacity = useSharedValue(0);
  const podiumScale = useSharedValue(0.8);
  const podiumOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(0);
  const listTranslateY = useSharedValue(50);

  useEffect(() => {
    // Initial celebration haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Sequence animations
    headerOpacity.value = withTiming(1, { duration: 600 });

    // Podium entrance (pop in)
    podiumOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    podiumScale.value = withDelay(300, withSpring(1));

    // List entrance (slide up)
    listOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    listTranslateY.value = withDelay(800, withSpring(0));
  }, []);

  const handleEndGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEndGame();
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const podiumContainerStyle = useAnimatedStyle(() => ({
    opacity: podiumOpacity.value,
    transform: [{ scale: podiumScale.value }],
  }));

  const listContainerStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    transform: [{ translateY: listTranslateY.value }],
  }));

  const PodiumItem = ({ player, rank, color, height }) => (
    <View style={[styles.podiumItem, { height, marginTop: -height / 2 }]}>
      <View style={[styles.avatarContainer, { borderColor: color }]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: player?.player?.avatar_color || "#333" },
          ]}
        >
          <User size={32} color="#FFF" />
        </View>
        <View style={[styles.rankBadge, { backgroundColor: color }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>

      <View
        style={[
          styles.podiumBase,
          { borderColor: color, backgroundColor: `${color}20` },
        ]}
      >
        <Text style={styles.podiumName} numberOfLines={1}>
          {player?.player?.name}
        </Text>
        <Text style={styles.podiumScore}>{player?.total_score}</Text>
        <Text style={styles.podiumPts}>pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AnimatedBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        {/* HEADER */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Trophy size={48} color={GOLD} style={styles.headerIcon} />
          <GlitchText style={styles.title} intensity={0.5}>
            VICTORY!
          </GlitchText>
          <Text style={styles.subtitle}>The results are in...</Text>
        </Animated.View>

        {/* PODIUM SECTION */}
        <Animated.View style={[styles.podiumContainer, podiumContainerStyle]}>
          {/* 2nd Place */}
          {second && (
            <PodiumItem player={second} rank="2" color={SILVER} height={140} />
          )}

          {/* 1st Place (Winner) */}
          {winner && (
            <View style={[styles.podiumItem, styles.winnerPodium]}>
              <View style={styles.crownContainer}>
                <Crown size={32} color={GOLD} />
              </View>
              <View
                style={[
                  styles.avatarContainer,
                  styles.winnerAvatar,
                  { borderColor: GOLD },
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: winner?.player?.avatar_color || "#333",
                      width: 80,
                      height: 80,
                    },
                  ]}
                >
                  <User size={40} color="#FFF" />
                </View>
                <View style={[styles.rankBadge, styles.winnerBadge]}>
                  <Text style={styles.rankText}>1</Text>
                </View>
              </View>

              <View style={[styles.podiumBase, styles.winnerBase]}>
                <Text
                  style={[styles.podiumName, styles.winnerName]}
                  numberOfLines={1}
                >
                  {winner?.player?.name}
                </Text>
                <Text style={[styles.podiumScore, styles.winnerScore]}>
                  {winner?.total_score}
                </Text>
                <Text style={styles.podiumPts}>POINTS</Text>
              </View>
            </View>
          )}

          {/* 3rd Place */}
          {third && (
            <PodiumItem player={third} rank="3" color={BRONZE} height={120} />
          )}
        </Animated.View>

        {/* REMAINING PLAYERS LIST */}
        {others.length > 0 && (
          <Animated.View style={[styles.listContainer, listContainerStyle]}>
            <Text style={styles.listTitle}>Runners Up</Text>
            {others.map((score, index) => (
              <View key={score.player_id} style={styles.listItem}>
                <View style={styles.listRank}>
                  <Text style={styles.listRankText}>{index + 4}</Text>
                </View>
                <View
                  style={[
                    styles.listAvatar,
                    { backgroundColor: score.player?.avatar_color },
                  ]}
                >
                  <User size={16} color="#FFF" />
                </View>

                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{score.player?.name}</Text>
                  <View style={styles.listStats}>
                    {/* Stats: Correct Votes & Imposter Survival */}
                    <View style={styles.miniStat}>
                      <Target size={10} color={colors.accent.green} />
                      <Text style={styles.miniStatText}>
                        {score.correct_votes || 0}
                      </Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Skull size={10} color={colors.accent.red} />
                      <Text style={styles.miniStatText}>
                        {score.survived_as_imposter || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.listScoreContainer}>
                  <Text style={styles.listScore}>{score.total_score}</Text>
                  <Text style={styles.listPts}>pts</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <GradientButton
          variant="primary"
          onPress={handleEndGame}
          icon={<Home size={24} color="#FFF" />}
          style={styles.homeButton}
        >
          Back to Lobby
        </GradientButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerIcon: {
    marginBottom: 10,
    shadowColor: GOLD,
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  title: {
    fontFamily: "Poppins_900Black",
    fontSize: 42,
    color: "#FFF",
    letterSpacing: 2,
    textShadowColor: "rgba(255, 215, 0, 0.5)",
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
  },
  // PODIUM
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
    marginBottom: 40,
    height: 300,
  },
  podiumItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    // width is handled inline for responsiveness
  },
  winnerPodium: {
    zIndex: 10,
    // width is handled inline
  },
  avatarContainer: {
    marginBottom: -20,
    zIndex: 5,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  winnerAvatar: {
    marginBottom: -30,
  },
  rankBadge: {
    position: "absolute",
    bottom: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background.dark,
  },
  winnerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GOLD,
    bottom: -10,
  },
  rankText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: colors.background.dark,
  },
  crownContainer: {
    marginBottom: 8,
  },
  podiumBase: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 4,
  },
  winnerBase: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderColor: GOLD,
    height: 180,
    paddingTop: 40,
  },
  podiumName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#FFF",
    marginBottom: 4,
    textAlign: "center",
  },
  winnerName: {
    fontSize: 16,
    marginBottom: 8,
  },
  podiumScore: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#FFF",
  },
  winnerScore: {
    fontSize: 32,
    color: GOLD,
  },
  podiumPts: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  // LIST
  listContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 20,
  },
  listTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  listRank: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  listRankText: {
    fontFamily: "Poppins_700Bold",
    color: "rgba(255,255,255,0.5)",
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listName: {
    fontFamily: "Poppins_500Medium",
    color: "#FFF",
    fontSize: 14,
  },
  listScore: {
    fontFamily: "Poppins_700Bold",
    color: "#FFF",
  },
  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  homeButton: {
    width: "100%",
  },
  listInfo: {
    flex: 1,
    justifyContent: "center",
  },
  listStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  miniStatText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  listScoreContainer: {
    alignItems: "flex-end",
  },
  listPts: {
    fontFamily: "Poppins_500Medium",
    fontSize: 8,
    color: "rgba(255,255,255,0.5)",
    marginTop: -2,
  },
});
