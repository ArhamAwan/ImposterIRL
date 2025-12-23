import { useState, useEffect, useRef } from "react";
import { Vibration, Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function useGameTimer(gameData) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [localOffset, setLocalOffset] = useState(0);
  const hasVibratedRef = useRef({});
  const lastFetchTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!gameData?.round) return;

    const phase = gameData.round.phase;

    if (phase === "discussion") {
      // Use server's elapsed time and calculate remaining locally
      const elapsedFromServer = parseFloat(gameData.round.elapsed_seconds) || 0;
      const duration = gameData.lobby.round_duration || 300;
      const serverRemaining = Math.max(0, duration - elapsedFromServer);

      // Debug log
      console.log("Timer debug:", {
        elapsedFromServer,
        duration,
        serverRemaining,
        roundData: gameData.round,
      });

      // Record when we got this data
      const fetchTime = Date.now();
      lastFetchTimeRef.current = fetchTime;

      // Initial set
      setTimeRemaining(Math.floor(serverRemaining));

      const interval = setInterval(() => {
        // Calculate how much time has passed since we got the server data
        const localElapsed = (Date.now() - fetchTime) / 1000;
        const remaining = Math.max(0, serverRemaining - localElapsed);
        const seconds = Math.floor(remaining);
        setTimeRemaining(seconds);

        // Haptic alerts (Native only)
        if (Platform.OS !== "web") {
          if (seconds === 120 && !hasVibratedRef.current["120"]) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            hasVibratedRef.current["120"] = true;
          } else if (seconds === 60 && !hasVibratedRef.current["60"]) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            hasVibratedRef.current["60"] = true;
          } else if (seconds === 30 && !hasVibratedRef.current["30"]) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            hasVibratedRef.current["30"] = true;
          } else if (seconds === 0 && !hasVibratedRef.current["0"]) {
            Vibration.vibrate([0, 200, 100, 200]);
            hasVibratedRef.current["0"] = true;
          }
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(0);
    }
  }, [
    gameData?.round?.phase,
    gameData?.round?.elapsed_seconds,
    gameData?.lobby?.round_duration,
  ]);

  const resetVibrationFlags = () => {
    hasVibratedRef.current = {};
  };

  return { timeRemaining, resetVibrationFlags };
}
