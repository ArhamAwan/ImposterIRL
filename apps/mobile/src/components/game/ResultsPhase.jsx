import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { User, Shield, Skull, Trophy, ArrowRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";
import { GlitchView } from "@/components/effects/GlitchView";
import { colors } from "@/constants/imposterColors";

export function ResultsPhase({
  voteResults,
  imposterPlayer,
  imposterCaught,
  word,
  currentRound,
  totalRounds,
  isHost,
  onNextRound,
}) {
  const insets = useSafeAreaInsets();

  // Animation values
  const resultScale = useSharedValue(0);
  const resultOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  // Find the max votes for highlighting
  const maxVotes = Math.max(...voteResults.map((r) => r.votes), 0);

  useEffect(() => {
    // Dramatic entrance animation
    resultScale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back) }),
      withTiming(1, { duration: 200 })
    );
    resultOpacity.value = withTiming(1, { duration: 400 });
    cardsOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

    // Haptic feedback based on result
    if (imposterCaught) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  const handleNextRound = () => {
    if (!isHost) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onNextRound();
  };

  const resultColor = imposterCaught ? colors.accent.green : colors.accent.red;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Colored overlay based on result */}
      <View
        style={[
          styles.resultOverlay,
          {
            backgroundColor: imposterCaught
              ? "rgba(0, 255, 136, 0.08)"
              : "rgba(255, 59, 48, 0.1)",
          },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 140,
          },
        ]}
      >
        {/* Result Announcement */}
        <Animated.View style={[styles.resultSection, resultAnimatedStyle]}>
          <GlitchView
            intensity={0.6}
            frequency={3000}
            style={[
              styles.resultIconContainer,
              {
                backgroundColor: imposterCaught
                  ? "rgba(0, 255, 136, 0.2)"
                  : "rgba(255, 59, 48, 0.2)",
                borderColor: resultColor,
                shadowColor: resultColor,
              },
            ]}
          >
            {imposterCaught ? (
              <Shield size={48} color={colors.accent.green} />
            ) : (
              <Skull size={48} color={colors.accent.red} />
            )}
          </GlitchView>

          <GlitchText
            style={[
              styles.resultTitle,
              { color: resultColor, textShadowColor: resultColor },
            ]}
            intensity={0.7}
            frequency={2500}
            corrupt={true}
          >
            {imposterCaught ? "Imposter Caught!" : "Imposter Wins!"}
          </GlitchText>

          <GlitchText
            style={styles.resultSubtitle}
            intensity={0.4}
            frequency={5000}
            corrupt={false}
          >
            {imposterCaught
              ? "The team successfully identified the imposter"
              : "The imposter escaped detection"}
          </GlitchText>
        </Animated.View>

        {/* Word Reveal Card */}
        <Animated.View style={[styles.wordCard, cardsAnimatedStyle]}>
          <Text style={styles.wordLabel}>The Secret Word Was</Text>
          <Text style={styles.wordText}>{word}</Text>
        </Animated.View>

        {/* Imposter Reveal Card */}
        <Animated.View style={[styles.imposterCard, cardsAnimatedStyle]}>
          <Text style={styles.cardTitle}>The Imposter Was</Text>
          <View style={styles.imposterInfo}>
            <View
              style={[
                styles.imposterAvatar,
                { backgroundColor: imposterPlayer?.avatar_color },
              ]}
            >
              <User size={28} color="#000" />
            </View>
            <Text style={styles.imposterName}>{imposterPlayer?.name}</Text>
            <View style={styles.imposterBadge}>
              <Skull size={16} color={colors.accent.red} />
            </View>
          </View>
        </Animated.View>

        {/* Voting Results Card */}
        <Animated.View style={[styles.votesCard, cardsAnimatedStyle]}>
          <Text style={styles.cardTitle}>Voting Results</Text>
          <View style={styles.votesList}>
            {voteResults.map((result, index) => {
              const isTopVoted = result.votes === maxVotes && result.votes > 0;
              const isImposter = result.player.id === imposterPlayer?.id;

              return (
                <View
                  key={result.player.id}
                  style={[styles.voteItem, index > 0 && styles.voteItemBorder]}
                >
                  <View
                    style={[
                      styles.voteAvatar,
                      { backgroundColor: result.player.avatar_color },
                    ]}
                  >
                    <User size={16} color="#000" />
                  </View>

                  <View style={styles.voteInfo}>
                    <View style={styles.voteNameRow}>
                      <Text style={styles.voteName}>{result.player.name}</Text>
                      {isImposter && (
                        <View style={styles.imposterTag}>
                          <Text style={styles.imposterTagText}>IMPOSTER</Text>
                        </View>
                      )}
                    </View>

                    {/* Vote bar */}
                    <View style={styles.voteBarBg}>
                      <View
                        style={[
                          styles.voteBarFill,
                          {
                            width:
                              maxVotes > 0
                                ? `${(result.votes / maxVotes) * 100}%`
                                : "0%",
                            backgroundColor: isTopVoted
                              ? colors.accent.red
                              : colors.primary.purple,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.voteBadge,
                      isTopVoted && styles.voteBadgeTop,
                    ]}
                  >
                    <Text
                      style={[
                        styles.voteCount,
                        isTopVoted && styles.voteCountTop,
                      ]}
                    >
                      {result.votes}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Round info */}
        <Animated.View style={[styles.roundInfo, cardsAnimatedStyle]}>
          <Text style={styles.roundText}>
            Round {currentRound} of {totalRounds}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom button */}
      {isHost && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
          <GradientButton
            variant="primary"
            onPress={handleNextRound}
            icon={
              currentRound < totalRounds ? (
                <ArrowRight size={20} color={colors.neutral.white} />
              ) : (
                <Trophy size={20} color={colors.neutral.white} />
              )
            }
            style={styles.actionButton}
          >
            {currentRound < totalRounds ? "Next Round" : "View Final Scores"}
          </GradientButton>
        </View>
      )}

      {!isHost && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.waitingText}>
            Waiting for host to continue...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  resultSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  resultTitle: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  resultSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
  wordCard: {
    backgroundColor: "rgba(138, 43, 226, 0.15)",
    borderWidth: 2,
    borderColor: colors.primary.purple,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: colors.primary.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  wordLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.lightGray,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: colors.neutral.white,
  },
  imposterCard: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.4)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
    marginBottom: 16,
  },
  imposterInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  imposterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  imposterName: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.white,
  },
  imposterBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  votesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  votesList: {
    gap: 0,
  },
  voteItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  voteItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  voteAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  voteInfo: {
    flex: 1,
    marginRight: 12,
  },
  voteNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  voteName: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.white,
  },
  imposterTag: {
    backgroundColor: "rgba(255, 59, 48, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  imposterTagText: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: colors.accent.red,
    letterSpacing: 0.5,
  },
  voteBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  voteBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  voteBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  voteBadgeTop: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
  },
  voteCount: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: colors.neutral.lightGray,
  },
  voteCountTop: {
    color: colors.accent.red,
  },
  roundInfo: {
    alignItems: "center",
    marginTop: 8,
  },
  roundText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: colors.neutral.midGray,
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
  waitingText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: colors.neutral.midGray,
    textAlign: "center",
  },
});
