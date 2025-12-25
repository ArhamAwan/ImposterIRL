import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { ResultsPhase } from "@/components/game/ResultsPhase";
import { VotingPhase } from "@/components/game/VotingPhase";
import { DiscussionPhase } from "@/components/game/DiscussionPhase";
import { WordRevealPhase } from "@/components/game/WordRevealPhase";
import { GameFinishedScreen } from "@/components/game/GameFinishedScreen";
import { colors } from "@/constants/imposterColors";

// MOCK DATA
const MOCK_PLAYERS = [
  { id: "1", name: "Player 1", avatar_color: "#FF0000", isBot: false },
  { id: "2", name: "Player 2", avatar_color: "#00FF00", isBot: true },
  { id: "3", name: "Player 3", avatar_color: "#0000FF", isBot: true },
  { id: "4", name: "Player 4", avatar_color: "#FFFF00", isBot: true },
  { id: "5", name: "Player 5", avatar_color: "#FF00FF", isBot: true },
];

const MOCK_VOTE_RESULTS = [
  { player: MOCK_PLAYERS[0], votes: 3 },
  { player: MOCK_PLAYERS[1], votes: 1 },
  { player: MOCK_PLAYERS[2], votes: 0 },
  { player: MOCK_PLAYERS[3], votes: 0 },
  { player: MOCK_PLAYERS[4], votes: 0 },
];

const ScreenWrapper = ({ title, onClose, children }) => (
  <View style={{ flex: 1, backgroundColor: colors.background.dark }}>
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
        }}
      >
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
            fontFamily: "Poppins_600SemiBold",
            marginLeft: 12,
          }}
        >
          Debug: {title}
        </Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  </View>
);

export default function DebugShowcase() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState(null);

  const renderView = () => {
    switch (currentView) {
      case "RESULTS_CREW_WIN":
        return (
          <ScreenWrapper
            title="Results (Crew Win)"
            onClose={() => setCurrentView(null)}
          >
            <ResultsPhase
              voteResults={MOCK_VOTE_RESULTS}
              imposterPlayer={MOCK_PLAYERS[1]} // Player 2 was imposter
              imposterCaught={true}
              word="Banana"
              currentRound={1}
              totalRounds={3}
              isHost={true}
              onNextRound={() => alert("Next Round Clicked")}
            />
          </ScreenWrapper>
        );
      case "RESULTS_IMPOSTER_WIN":
        return (
          <ScreenWrapper
            title="Results (Imposter Win)"
            onClose={() => setCurrentView(null)}
          >
            <ResultsPhase
              voteResults={MOCK_VOTE_RESULTS}
              imposterPlayer={MOCK_PLAYERS[1]}
              imposterCaught={false}
              word="Banana"
              currentRound={1}
              totalRounds={3}
              isHost={true}
              onNextRound={() => alert("Next Round Clicked")}
            />
          </ScreenWrapper>
        );
      case "VOTING":
        return (
          <ScreenWrapper
            title="Voting Phase"
            onClose={() => setCurrentView(null)}
          >
            <VotingPhase
              activePlayers={MOCK_PLAYERS}
              timeLeft={30}
              onVote={(id) => alert(`Voted for ${id}`)}
              hasVoted={false}
              votedPlayerId={null}
              votes={{}}
              isHost={true}
            />
          </ScreenWrapper>
        );
      case "DISCUSSION":
        return (
          <ScreenWrapper
            title="Discussion Phase"
            onClose={() => setCurrentView(null)}
          >
            <DiscussionPhase
              timeRemaining={45}
              isHost={true}
              onStartVoting={() => alert("Start Voting Clicked")}
            />
          </ScreenWrapper>
        );
      case "REVEAL_CREW":
        return (
          <ScreenWrapper
            title="Reveal (Crew)"
            onClose={() => setCurrentView(null)}
          >
            <WordRevealPhase
              word="Banana"
              role="crewmate"
              isHost={true}
              onReady={() => alert("Ready Clicked")}
            />
          </ScreenWrapper>
        );
      case "REVEAL_IMPOSTER":
        return (
          <ScreenWrapper
            title="Reveal (Imposter)"
            onClose={() => setCurrentView(null)}
          >
            <WordRevealPhase
              word="Banana"
              role="imposter"
              isHost={true}
              onReady={() => alert("Ready Clicked")}
            />
          </ScreenWrapper>
        );
      case "SCOREBOARD":
        return (
          <ScreenWrapper
            title="Scoreboard (Game Over)"
            onClose={() => setCurrentView(null)}
          >
            <GameFinishedScreen
              sortedScores={[
                {
                  player_id: "1",
                  total_score: 1500,
                  correct_votes: 5,
                  survived_as_imposter: 1,
                  player: { name: "Captain Cool", avatar_color: "#FF0000" },
                },
                {
                  player_id: "2",
                  total_score: 1200,
                  correct_votes: 4,
                  survived_as_imposter: 0,
                  player: { name: "Sus Amogus", avatar_color: "#00FF00" },
                },
                {
                  player_id: "3",
                  total_score: 900,
                  correct_votes: 3,
                  survived_as_imposter: 0,
                  player: { name: "Space Cadet", avatar_color: "#0000FF" },
                },
                {
                  player_id: "4",
                  total_score: 600,
                  correct_votes: 2,
                  survived_as_imposter: 0,
                  player: { name: "Rookie", avatar_color: "#FFFF00" },
                },
                {
                  player_id: "5",
                  total_score: 300,
                  correct_votes: 1,
                  survived_as_imposter: 0,
                  player: { name: "Noob", avatar_color: "#FF00FF" },
                },
              ]}
              onEndGame={() => alert("Back to Menu Clicked")}
            />
          </ScreenWrapper>
        );
      default:
        return (
          <View style={styles.container}>
            <StatusBar style="light" />
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Debug Showcase</Text>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Results Phase</Text>
                <TouchableOpacity
                  style={[styles.button, { borderColor: "#FFD700" }]}
                  onPress={() => setCurrentView("SCOREBOARD")}
                >
                  <Text style={[styles.buttonText, { color: "#FFD700" }]}>
                    ✨ Game Finished (Scoreboard)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCurrentView("RESULTS_CREW_WIN")}
                >
                  <Text style={styles.buttonText}>
                    Results: Crew Win (Victory)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCurrentView("RESULTS_IMPOSTER_WIN")}
                >
                  <Text style={styles.buttonText}>
                    Results: Imposter Win (Defeat)
                  </Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Game Phases</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCurrentView("VOTING")}
                >
                  <Text style={styles.buttonText}>Voting Phase</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCurrentView("DISCUSSION")}
                >
                  <Text style={styles.buttonText}>Discussion Phase</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Reveal Phase</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCurrentView("REVEAL_CREW")}
                >
                  <Text style={styles.buttonText}>Reveal: Crewmate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCurrentView("REVEAL_IMPOSTER")}
                >
                  <Text style={styles.buttonText}>Reveal: Imposter</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </View>
        );
    }
  };

  return renderView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#888",
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
