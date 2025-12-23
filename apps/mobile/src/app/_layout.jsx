import { useAuth } from "@/utils/auth/useAuth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { colors } from "@/constants/imposterColors";

const ImposterDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background.dark,
    card: colors.background.dark,
    text: colors.neutral.white,
    border: "transparent",
    notification: colors.primary.purple,
  },
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={ImposterDarkTheme}>
          <View
            style={{
              flex: 1,
              backgroundColor:
                Platform.OS === "web" ? "#000" : colors.background.dark,
            }}
          >
            <View
              style={[
                { flex: 1, backgroundColor: colors.background.dark },
                Platform.OS === "web" && {
                  width: "100%",
                  maxWidth: 480,
                  alignSelf: "center",
                  // Optional: Add a subtle border or shadow for desktop look
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 5,
                  overflow: "hidden",
                },
              ]}
            >
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background.dark },
                }}
                initialRouteName="index"
              >
                <Stack.Screen name="index" />
              </Stack>
            </View>
          </View>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
