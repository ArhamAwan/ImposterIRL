import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { User, Check, AlertTriangle, Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// AnimatedBackground handled globally
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { GhostCrewmate } from "@/components/svg/Crewmates";
import { colors } from "@/constants/imposterColors";

const { width: windowWidth } = Dimensions.get("window");
const MAX_CONTENT_WIDTH = 480;
const effectiveWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
const COLUMN_GAP = 12;
const CARD_WIDTH = (effectiveWidth - 48 - COLUMN_GAP) / 2;

export function VotingPhase({
  activePlayers = [],
  votes,
  selectedVote,
  isEliminated,
  currentPlayerId,
  isHost,
  onVote,
  onShowResults,
}) {
  const insets = useSafeAreaInsets();
  const [pendingVote, setPendingVote] = useState(null);

  // Get list of player IDs who have already voted
  // Handle potential non-array votes structure
  const votesArray = Array.isArray(votes) ? votes : Object.values(votes || {});
  const playersWhoVoted = votesArray.map((v) => v.voter_id);
  const hasCurrentPlayerVoted = playersWhoVoted.includes(currentPlayerId);
  const totalPlayers = activePlayers.length;
  const votedCount = playersWhoVoted.length;
  const allVoted = votedCount === totalPlayers;

  const handleSelectPlayer = (playerId) => {
    if (isEliminated || hasCurrentPlayerVoted) {
      return;
    }
    // Toggle selection
    if (pendingVote === playerId) {
      setPendingVote(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setPendingVote(playerId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleConfirmVote = () => {
    if (!pendingVote || hasCurrentPlayerVoted) {
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onVote(pendingVote);
  };

  const handleShowResultsWrapper = () => {
    if (!isHost) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onShowResults();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated Background */}
      {/* AnimatedBackground handled by _layout */}

      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.statsRow}>
          <GlitchView intensity={0.3} frequency={5000}>
            <Text style={styles.headerTitle}>VOTING PHASE</Text>
          </GlitchView>
          <View style={styles.voteCountBadge}>
            <Text style={styles.voteCountText}>
              {votedCount}/{totalPlayers}
            </Text>
          </View>
        </View>

        {/* Who has voted - Tech Style Progress */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(votedCount / totalPlayers) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.statusText}>
          {isEliminated
            ? "You are dead. Silence."
            : hasCurrentPlayerVoted
            ? "Vote cast. Waiting for others..."
            : "Who is the Imposter?"}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Eliminated View */}
        {isEliminated && (
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.eliminatedCard}
          >
            <GhostCrewmate size={60} opacity={0.9} />
            <GlitchText style={styles.eliminatedText} intensity={0.4}>
              SPECTATOR MODE
            </GlitchText>
          </Animated.View>
        )}

        {/* Player Grid */}
        <View style={styles.gridContainer}>
          {activePlayers.map((player, index) => {
            const isMe = player.id === currentPlayerId;
            const isSelected = pendingVote === player.id;
            const hasVoted = playersWhoVoted.includes(player.id);
            const canSelect = !isEliminated && !hasCurrentPlayerVoted && !isMe;

            return (
              <Animated.View
                key={player.id}
                entering={FadeInUp.delay(index * 100)}
                style={{ width: CARD_WIDTH, marginBottom: COLUMN_GAP }}
              >
                <TouchableOpacity
                  activeOpacity={canSelect ? 0.8 : 1}
                  onPress={() => canSelect && handleSelectPlayer(player.id)}
                  style={[
                    styles.playerCard,
                    isSelected && styles.playerCardSelected,
                    !canSelect && styles.playerCardDisabled,
                  ]}
                  disabled={!canSelect}
                >
                  {/* Status Indicators */}
                  <View style={styles.cardHeader}>
                    {hasVoted ? (
                      <View style={styles.votedBadge}>
                        <Check
                          size={12}
                          color={colors.background.dark}
                          strokeWidth={4}
                        />
                      </View>
                    ) : (
                      <View style={styles.pendingBadge} />
                    )}
                  </View>

                  {/* Avatar */}
                  <View
                    style={[
                      styles.avatarContainer,
                      { backgroundColor: player.avatar_color },
                      isSelected && styles.avatarSelected,
                    ]}
                  >
                    <User size={32} color="#000" />
                  </View>

                  {/* Name */}
                  <Text
                    style={[
                      styles.playerName,
                      isSelected && styles.playerNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {isMe ? "YOU" : player.name}
                  </Text>

                  {/* SUS Overlay */}
                  {isSelected && (
                    <View style={styles.susBadge}>
                      <AlertTriangle size={14} color="#FFF" />
                      <Text style={styles.susText}>SUS?</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {!hasCurrentPlayerVoted && !isEliminated && pendingVote && (
          <Animated.View entering={FadeInUp.springify()}>
            <GradientButton
              onPress={handleConfirmVote}
              variant="primary"
              icon={<Target size={24} color="#FFF" />}
            >
              VOTE {activePlayers.find((p) => p.id === pendingVote)?.name}
            </GradientButton>
          </Animated.View>
        )}

        {!hasCurrentPlayerVoted && !isEliminated && !pendingVote && (
          <Text style={styles.selectHint}>Select a player to investigate</Text>
        )}

        {(hasCurrentPlayerVoted || isEliminated) && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              {allVoted ? "Processing Results..." : "Waiting for votes..."}
            </Text>
          </View>
        )}

        {isHost && (hasCurrentPlayerVoted || isEliminated) && (
          <View style={{ marginTop: 12 }}>
            <GradientButton
              onPress={handleShowResultsWrapper}
              variant="secondary"
              disabled={!allVoted}
              icon={<Target size={20} color="#FFF" />}
            >
              {allVoted
                ? "REVEAL RESULTS"
                : `WAITING (${votedCount}/${totalPlayers})`}
            </GradientButton>
          </View>
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
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    letterSpacing: 2,
  },
  voteCountBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voteCountText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary.purple,
    fontSize: 14,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary.purple,
  },
  statusText: {
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    fontSize: 14,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  playerCard: {
    width: "100%",
    aspectRatio: 0.9,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  playerCardSelected: {
    backgroundColor: "rgba(255, 69, 58, 0.15)", // Red tint
    borderColor: "#FF453A",
    transform: [{ scale: 1.05 }],
    shadowColor: "#FF453A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    // elevation removed to prevent dark background artifact on Android
  },
  playerCardDisabled: {
    opacity: 0.5,
  },
  cardHeader: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  votedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent.green,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    margin: 6,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderColor: "#FFF",
  },
  playerName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: colors.neutral.white,
    textAlign: "center",
  },
  playerNameSelected: {
    color: "#FF453A",
  },
  susBadge: {
    position: "absolute",
    bottom: -10,
    backgroundColor: "#FF453A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  susText: {
    color: "#FFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },
  eliminatedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.midGray,
    marginBottom: 24,
    gap: 16,
  },
  eliminatedText: {
    color: colors.neutral.lightGray,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
  },
  bottomBar: {
    paddingTop: 20,
    paddingHorizontal: 24,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  selectHint: {
    textAlign: "center",
    color: colors.neutral.midGray,
    fontFamily: "Poppins_400Regular",
  },
  waitingContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  waitingText: {
    color: colors.neutral.lightGray,
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
  },
});
