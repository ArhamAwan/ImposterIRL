import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/constants/api";

export function useGameMutations(code, currentPlayer) {
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (votedForId) => {
      const response = await fetch(apiUrl("/api/game/vote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          playerId: currentPlayer.playerId,
          votedForId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", code] });
    },
  });

  const phaseMutation = useMutation({
    mutationFn: async (phase) => {
      const response = await fetch(apiUrl("/api/game/phase"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phase }),
      });
      if (!response.ok) {
        throw new Error("Failed to update phase");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", code] });
    },
  });

  return { voteMutation, phaseMutation };
}
