import { useEffect, useRef } from "react";
import { apiUrl } from "../constants/api";

/**
 * Hook to automate bot behavior in test games.
 * Only runs if the current player is the host.
 */
export function useBotBehavior({
  isHost,
  phase,
  activePlayers,
  votes,
  lobbyCode,
  currentRound,
}) {
  const processedRef = useRef({});

  useEffect(() => {
    if (!isHost || phase !== "voting") {
      return;
    }

    const botPlayers = activePlayers.filter((p) => p.id.startsWith("bot-"));
    const botsWhoNeedToVote = botPlayers.filter(
      (bot) => !votes?.some((v) => v.voter_id === bot.id)
    );

    if (botsWhoNeedToVote.length === 0) return;

    botsWhoNeedToVote.forEach((bot) => {
      // Prevent double submission for the same bot in the same phase instance
      const key = `${lobbyCode}-${currentRound}-${bot.id}`;
      if (processedRef.current[key]) return;

      // Mark as processed immediately to prevent race conditions
      processedRef.current[key] = true;

      // Random delay between 1-5 seconds
      const delay = 1000 + Math.random() * 4000;

      setTimeout(async () => {
        try {
          // Pick a random target (not themselves)
          const validTargets = activePlayers.filter((p) => p.id !== bot.id);
          if (validTargets.length === 0) return;

          const randomTarget =
            validTargets[Math.floor(Math.random() * validTargets.length)];

          console.log(`🤖 Bot ${bot.name} voting for ${randomTarget.name}`);

          await fetch(apiUrl("/api/game/vote"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: lobbyCode,
              playerId: bot.id,
              votedForId: randomTarget.id,
            }),
          });
        } catch (error) {
          console.error(`Error processing bot vote for ${bot.name}:`, error);
          // Allow retry on error? For now, no, to simple.
        }
      }, delay);
    });
  }, [isHost, phase, activePlayers, votes, lobbyCode, currentRound]);
}
