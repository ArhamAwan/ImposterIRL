import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYER_KEY = "@imposter_player";
const LOBBY_KEY = "@imposter_lobby";

export const savePlayerData = async (playerData) => {
  try {
    await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(playerData));
  } catch (error) {
    console.error("Error saving player data:", error);
  }
};

export const getPlayerData = async () => {
  try {
    const data = await AsyncStorage.getItem(PLAYER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting player data:", error);
    return null;
  }
};

export const saveLobbyCode = async (code) => {
  try {
    await AsyncStorage.setItem(LOBBY_KEY, code);
  } catch (error) {
    console.error("Error saving lobby code:", error);
  }
};

export const getLobbyCode = async () => {
  try {
    return await AsyncStorage.getItem(LOBBY_KEY);
  } catch (error) {
    console.error("Error getting lobby code:", error);
    return null;
  }
};

export const clearGameData = async () => {
  try {
    // Only clear lobby code, keep player data for leaderboard
    await AsyncStorage.removeItem(LOBBY_KEY);
  } catch (error) {
    console.error("Error clearing game data:", error);
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([PLAYER_KEY, LOBBY_KEY]);
  } catch (error) {
    console.error("Error clearing all data:", error);
  }
};

export const generatePlayerId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
