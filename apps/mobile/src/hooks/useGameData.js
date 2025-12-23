import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/constants/api";

export function useGameData(code) {
  return useQuery({
    queryKey: ["game", code],
    queryFn: async () => {
      const response = await fetch(apiUrl(`/api/game/${code}`));
      if (!response.ok) {
        throw new Error("Failed to fetch game");
      }
      return response.json();
    },
    refetchInterval: 2000,
  });
}
