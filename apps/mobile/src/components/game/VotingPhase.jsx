import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { User, Check, Vote, Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { GhostCrewmate } from "@/components/svg/Crewmates";
import { colors } from "@/constants/imposterColors";

export function VotingPhase({
  activePlayers,
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
  const playersWhoVoted = votes?.map((v) => v.voter_id) || [];
  const hasCurrentPlayerVoted = playersWhoVoted.includes(currentPlayerId);
  const totalPlayers = activePlayers.length;
  const votedCount = playersWhoVoted.length;
  const allVoted = votedCount === totalPlayers;

  const handleSelectPlayer = (playerId) => {
    if (isEliminated || hasCurrentPlayerVoted) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingVote(playerId);
  };

  const handleConfirmVote = () => {
    if (!pendingVote || hasCurrentPlayerVoted) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onVote(pendingVote);
  };

  const handleShowResults = () => {
    if (!isHost) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onShowResults();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated Background */}
      <AnimatedBackground style={{ zIndex: -1 }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 180,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <GlitchView
            intensity={0.5}
            frequency={4000}
            style={styles.iconContainer}
          >
            <Target size={32} color={colors.primary.purple} />
          </GlitchView>
          <GlitchText
            style={styles.title}
            intensity={0.6}
            frequency={3500}
            corrupt={true}
          >
            Time to Vote!
          </GlitchText>
          <GlitchText
            style={styles.subtitle}
            intensity={0.3}
            frequency={6000}
            corrupt={false}
          >
            {isEliminated
              ? "You're eliminated. Watch the voting!"
              : hasCurrentPlayerVoted
              ? "Your vote has been submitted!"
              : "Select who you think is the imposter"}
          </GlitchText>
        </View>

        {/* Voting Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Votes Submitted</Text>
          <Text style={styles.progressCount}>
            {votedCount} / {totalPlayers}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(votedCount / totalPlayers) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Who has voted */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Players Status:</Text>
          <View style={styles.statusGrid}>
            {activePlayers.map((player) => {
              const hasVoted = playersWhoVoted.includes(player.id);
              return (
                <View
                  key={player.id}
                  style={[
                    styles.statusChip,
                    hasVoted && styles.statusChipVoted,
                  ]}
                >
                  <View
                    style={[
                      styles.statusAvatar,
                      { backgroundColor: player.avatar_color },
                    ]}
                  >
                    <User size={12} color="#000" />
                  </View>
                  <Text style={styles.statusName}>{player.name}</Text>
                  {hasVoted && <Check size={16} color={colors.accent.green} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Player selection list */}
        {!hasCurrentPlayerVoted && !isEliminated && (
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Vote for the Imposter:</Text>
            <View style={styles.playerList}>
              {activePlayers
                .filter((p) => p.id !== currentPlayerId) // Can't vote for yourself
                .map((player) => {
                  const isSelected = pendingVote === player.id;

                  return (
                    <TouchableOpacity
                      key={player.id}
                      style={[
                        styles.playerCard,
                        isSelected && styles.playerCardSelected,
                        // pressed state is handled internally by TouchableOpacity opacity prop
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleSelectPlayer(player.id)}
                    >
                      <View
                        style={[
                          styles.playerAvatar,
                          { backgroundColor: player.avatar_color },
                        ]}
                      >
                        <User size={24} color="#000" />
                      </View>

                      <View style={styles.playerInfo}>
                        <Text
                          style={[
                            styles.playerName,
                            isSelected && styles.playerNameSelected,
                          ]}
                        >
                          {player.name}
                        </Text>
                      </View>

                      {isSelected && (
                        <View style={styles.checkCircle}>
                          <Check size={18} color={colors.primary.purple} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

        {/* Already voted message */}
        {hasCurrentPlayerVoted && !isEliminated && (
          <View style={styles.votedCard}>
            <View style={styles.votedIconCircle}>
              <Check size={32} color={colors.accent.green} />
            </View>
            <Text style={styles.votedTitle}>Vote Submitted!</Text>
            <Text style={styles.votedSubtitle}>
              Waiting for other players...
            </Text>
          </View>
        )}

        {/* Eliminated player message */}
        {isEliminated && (
          <View style={styles.eliminatedCard}>
            <GhostCrewmate size={80} opacity={0.8} />
            <Text style={styles.eliminatedTitle}>You're a Ghost</Text>
            <Text style={styles.eliminatedSubtitle}>
              You were eliminated and can only observe the voting.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        {/* Test button */}

        {/* Vote button for non-hosts */}
        {!hasCurrentPlayerVoted && !isEliminated && (
          <Pressable
            onPress={() => {
              console.log("VOTE BUTTON PRESSED");
              handleConfirmVote();
            }}
            style={[
              styles.voteButton,
              pendingVote ? styles.voteButtonActive : styles.voteButtonInactive,
            ]}
          >
            <Vote size={20} color={colors.neutral.white} />
            <Text style={styles.voteButtonText}>
              {pendingVote ? "Confirm Vote" : "Select a Player"}
            </Text>
          </Pressable>
        )}

        {/* Show Results button for host */}
        {isHost && (
          <Pressable
            onPress={() => {
              console.log("SHOW RESULTS BUTTON PRESSED");
              handleShowResults();
            }}
            style={[
              styles.voteButton,
              allVoted ? styles.voteButtonActive : styles.voteButtonInactive,
              !hasCurrentPlayerVoted && !isEliminated && { marginTop: 12 },
            ]}
          >
            <Target size={20} color={colors.neutral.white} />
            <Text style={styles.voteButtonText}>
              {allVoted
                ? "Show Results"
                : `Show Results (${votedCount}/${totalPlayers} voted)`}
            </Text>
          </Pressable>
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
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(138, 43, 226, 0.2)",
    borderWidth: 2,
    borderColor: colors.primary.purple,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 8,
  },
  progressCount: {
    fontSize: 36,
    fontFamily: "Poppins_700Bold",
    color: colors.primary.purple,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    marginTop: 16,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary.purple,
    borderRadius: 4,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.lightGray,
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusChipVoted: {
    backgroundColor: "rgba(0, 255, 136, 0.15)",
    borderColor: colors.accent.green,
  },
  statusAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statusName: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.white,
    marginRight: 6,
  },
  selectionSection: {
    marginBottom: 24,
  },
  playerList: {
    gap: 12,
  },
  playerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  playerCardSelected: {
    backgroundColor: "rgba(138, 43, 226, 0.25)",
    borderColor: colors.primary.purple,
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
  },
  playerNameSelected: {
    color: colors.neutral.white,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
  },
  votedCard: {
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderWidth: 1,
    borderColor: colors.accent.green,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },
  votedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 255, 136, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  votedTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: colors.accent.green,
    marginBottom: 8,
  },
  votedSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
  eliminatedCard: {
    backgroundColor: "rgba(0, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },
  eliminatedTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#00FFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  eliminatedSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.dark,
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 10,
  },
  actionButton: {
    width: "100%",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 64,
    borderRadius: 16,
    width: "100%",
  },
  voteButtonActive: {
    backgroundColor: colors.primary.purple,
  },
  voteButtonInactive: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  voteButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.white,
  },
});
