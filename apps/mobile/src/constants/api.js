// API configuration
// For development, use your computer's local IP so the phone can reach it
// You can find your IP with: ipconfig getifaddr en0 (on Mac)

// When testing on simulator, use localhost
// When testing on physical device, use your computer's IP address
import { Platform } from "react-native";

export const API_BASE_URL = "https://imposter-irl-ezhb.vercel.app"; // Force production URL (Vercel)

// Helper to build API URLs
export const apiUrl = (path) => `${API_BASE_URL}${path}`;
