// API configuration
// For development, use your computer's local IP so the phone can reach it
// You can find your IP with: ipconfig getifaddr en0 (on Mac)

// When testing on simulator, use localhost
// When testing on physical device, use your computer's IP address
// When testing on simulator, use localhost
// When testing on physical device, use your computer's IP address
import { Platform } from "react-native";

export const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:4000" // Web usually runs on same machine as server
    : "http://192.168.18.22:4000";

// Helper to build API URLs
export const apiUrl = (path) => `${API_BASE_URL}${path}`;
