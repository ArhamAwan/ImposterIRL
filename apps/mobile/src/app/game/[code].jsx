import React, { useState, useEffect } from "react";
import { Alert, View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useColors } from "@/components/useColors";
import { getPlayerData, clearGameData } from "@/utils/gameStorage";
import { useGameData } from "@/hooks/useGameData";
import { useGameMutations } from "@/hooks/useGameMutations";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useBotBehavior } from "@/hooks/useBotBehavior";
import {
  calculateVoteCounts,
  getVoteResults,
  getActivePlayers,
} from "@/utils/gameHelpers";
import { WordRevealPhase } from "@/components/game/WordRevealPhase";
import { DiscussionPhase } from "@/components/game/DiscussionPhase";
import { VotingPhase } from "@/components/game/VotingPhase";
import { ResultsPhase } from "@/components/game/ResultsPhase";
import { GameFinishedScreen } from "@/components/game/GameFinishedScreen";
import { PhaseTransition } from "@/components/game/PhaseTransition";

export default function GameScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const colors = useColors();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedVote, setSelectedVote] = useState(null);
  const [wordVisible, setWordVisible] = useState(false);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    const playerData = await getPlayerData();
    setCurrentPlayer(playerData);
  };

  const { data: gameData } = useGameData(code);
  const { voteMutation, phaseMutation } = useGameMutations(code, currentPlayer);
  const { timeRemaining, resetVibrationFlags } = useGameTimer(gameData);

  // Derived state for bot behavior
  const activePlayers = gameData?.players
    ? getActivePlayers(gameData.players, gameData.eliminatedIds)
    : [];

  useBotBehavior({
    isHost: currentPlayer?.isHost,
    phase: gameData?.round?.phase,
    activePlayers,
    votes: gameData?.votes,
    lobbyCode: code,
    currentRound: gameData?.lobby?.current_round,
  });

  const handleVote = (playerId) => {
    if (gameData?.eliminatedIds?.includes(currentPlayer?.playerId)) {
      return;
    }
    setSelectedVote(playerId);
    voteMutation.mutate(playerId);
  };

  const handleRevealWord = () => {
    setWordVisible(true);
  };

  const handleStartDiscussion = () => {
    if (!currentPlayer?.isHost) return;
    resetVibrationFlags();
    phaseMutation.mutate("discussion");
  };

  const handleShowResults = () => {
    if (!currentPlayer?.isHost) return;
    phaseMutation.mutate("results");
  };

  const handleNextRound = () => {
    if (!currentPlayer?.isHost) return;
    setWordVisible(false);
    setSelectedVote(null);
    resetVibrationFlags();
    phaseMutation.mutate("next_round");
  };

  const handleEndGame = async () => {
    await clearGameData();
    router.replace("/");
  };

  if (!fontsLoaded || !gameData || !currentPlayer) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#1A1A2E",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontFamily: "Poppins_500Medium",
          }}
        >
          {!fontsLoaded
            ? "Loading fonts..."
            : !currentPlayer
            ? "Loading player..."
            : "Loading game..."}
        </Text>
      </View>
    );
  }

  const { lobby, round, players, eliminatedIds, votes, scores } = gameData;
  const isImposter = round?.imposter_id === currentPlayer.playerId;
  const isEliminated = eliminatedIds?.includes(currentPlayer.playerId);
  const activePlayers = getActivePlayers(players, eliminatedIds);

  // Game finished - show final scoreboard (check this FIRST)
  if (lobby.status === "finished") {
    const sortedScores = scores
      ?.map((score) => ({
        ...score,
        player: players.find((p) => p.id === score.player_id),
      }))
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

    return (
      <PhaseTransition key="finished">
        <GameFinishedScreen
          sortedScores={sortedScores}
          onEndGame={handleEndGame}
        />
      </PhaseTransition>
    );
  }

  // Word Reveal Phase
  if (round.phase === "word_reveal") {
    return (
      <PhaseTransition key="setup">
        <WordRevealPhase
          isImposter={isImposter}
          wordVisible={wordVisible}
          word={round.word}
          currentRound={lobby.current_round}
          totalRounds={lobby.total_rounds}
          isHost={currentPlayer.isHost}
          colors={colors}
          onRevealWord={handleRevealWord}
          onStartDiscussion={handleStartDiscussion}
        />
      </PhaseTransition>
    );
  }

  // Discussion Phase
  if (round.phase === "discussion") {
    return (
      <PhaseTransition key="discussion">
        <DiscussionPhase
          timeRemaining={timeRemaining}
          isHost={currentPlayer.isHost}
          colors={colors}
          onStartVoting={() => phaseMutation.mutate("voting")}
        />
      </PhaseTransition>
    );
  }

  // Voting Phase
  if (round.phase === "voting") {
    return (
      <PhaseTransition key="voting">
        <VotingPhase
          activePlayers={activePlayers}
          votes={votes}
          selectedVote={selectedVote}
          isEliminated={isEliminated}
          currentPlayerId={currentPlayer.playerId}
          isHost={currentPlayer.isHost}
          colors={colors}
          onVote={handleVote}
          onShowResults={handleShowResults}
        />
      </PhaseTransition>
    );
  }

  // Results Phase
  if (round.phase === "results") {
    const voteCountsMap = calculateVoteCounts(votes);
    const voteResults = getVoteResults(voteCountsMap, players);
    const mostVoted = voteResults[0];
    const imposterCaught = mostVoted?.player?.id === round.imposter_id;
    const imposterPlayer = players.find((p) => p.id === round.imposter_id);

    return (
      <PhaseTransition key="results">
        <ResultsPhase
          voteResults={voteResults}
          imposterPlayer={imposterPlayer}
          imposterCaught={imposterCaught}
          word={round.word}
          currentRound={lobby.current_round}
          totalRounds={lobby.total_rounds}
          isHost={currentPlayer.isHost}
          colors={colors}
          onNextRound={handleNextRound}
        />
      </PhaseTransition>
    );
  }

  return null;
}
