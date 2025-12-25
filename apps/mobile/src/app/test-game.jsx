import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Play, Users, Clock } from "lucide-react-native";
import { useColors } from "../components/useColors";
import { savePlayerData } from "../utils/gameStorage";
import { apiUrl } from "../constants/api";
import * as Haptics from "expo-haptics";

export default function TestGameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();

  const [playerCount, setPlayerCount] = useState("4");
  const [roundDuration, setRoundDuration] = useState("30"); // 30 seconds for testing
  const [totalRounds, setTotalRounds] = useState("1");
  const [isCreating, setIsCreating] = useState(false);

  const createTestLobby = async () => {
    if (isCreating) return;

    const count = parseInt(playerCount);
    if (count < 3 || count > 10) {
      Alert.alert("Error", "Player count must be between 3 and 10");
      return;
    }

    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create lobby as host
      const hostId = `test-player-${Date.now()}`;
      const createResponse = await fetch(apiUrl("/api/lobby/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: "Host (You)",
          playerId: hostId,
        }),
      });

      const lobbyData = await createResponse.json();

      if (!createResponse.ok) {
        console.error("Server error:", lobbyData);
        throw new Error(lobbyData.error || "Failed to create lobby");
      }

      // Save host data
      await savePlayerData({
        lobbyCode: lobbyData.code,
        playerId: hostId,
        playerName: "Host (You)",
        avatarColor: lobbyData.avatarColor,
        isHost: true,
      });

      // Add bot players
      const botColors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E2",
        "#95E1D3",
      ];

      for (let i = 1; i < count; i++) {
        const botId = `bot-player-${i}-${Date.now()}`;
        await fetch(apiUrl("/api/lobby/join"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: lobbyData.code,
            playerName: `Bot ${i}`,
            playerId: botId,
          }),
        });
      }

      // Wait a bit for all players to join
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start the game with Animals category
      const startResponse = await fetch(apiUrl("/api/lobby/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: lobbyData.code,
          category: "Animals",
          roundDuration: parseInt(roundDuration),
          totalRounds: parseInt(totalRounds),
        }),
      });

      if (!startResponse.ok) {
        throw new Error("Failed to start game");
      }

      // Navigate to game
      router.push(`/game/${lobbyData.code}`);
    } catch (error) {
      console.error("Error creating test lobby:", error);
      Alert.alert(
        "Backend Required",
        "Test mode requires the web backend to be running.\n\nRun this command in apps/web:\nnpm run dev",
        [{ text: "OK" }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Poppins_700Bold",
              color: colors.text,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            🧪 Test Mode
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            Create a test game with bot players
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.outline,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Users size={20} color={colors.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Number of Players
              </Text>
            </View>
            <TextInput
              style={{
                height: 50,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.outline,
                borderRadius: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                color: colors.text,
              }}
              value={playerCount}
              onChangeText={setPlayerCount}
              keyboardType="number-pad"
              placeholder="3-10 players"
              placeholderTextColor={colors.textSecondary}
            />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              You + {parseInt(playerCount) - 1 || 0} bots
            </Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Clock size={20} color={colors.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Discussion Time (seconds)
              </Text>
            </View>
            <TextInput
              style={{
                height: 50,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.outline,
                borderRadius: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                color: colors.text,
              }}
              value={roundDuration}
              onChangeText={setRoundDuration}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor={colors.textSecondary}
            />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Recommended: 30-60 seconds for testing
            </Text>
          </View>

          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Play size={20} color={colors.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Number of Rounds
              </Text>
            </View>
            <TextInput
              style={{
                height: 50,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.outline,
                borderRadius: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                color: colors.text,
              }}
              value={totalRounds}
              onChangeText={setTotalRounds}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.primaryUltraLight,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins_500Medium",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            ℹ️ Test Mode Features
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
              lineHeight: 18,
            }}
          >
            • Instant lobby creation with bot players{"\n"}• Customizable timer
            for quick testing{"\n"}• Auto-starts with Animals category{"\n"}•
            You control all game phases as host
          </Text>
        </View>

        <TouchableOpacity
          style={{
            height: 56,
            backgroundColor: colors.primary,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
          onPress={createTestLobby}
          disabled={isCreating}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Poppins_600SemiBold",
              color: colors.background,
            }}
          >
            {isCreating ? "Creating Test Game..." : "🚀 Start Test Game"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            height: 56,
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.outline,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.back()}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
            }}
          >
            Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
