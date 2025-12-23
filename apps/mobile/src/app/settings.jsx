import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Smartphone,
  User,
  Save,
} from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { colors } from "@/constants/imposterColors";
import { PhaseTransition } from "@/components/game/PhaseTransition";
import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GlitchText } from "@/components/effects/GlitchText";
import { GradientButton } from "@/components/home/GradientButton";
import { useSettingsStore } from "@/store/settingsStore";
import {
  getPlayerData,
  savePlayerData,
  generatePlayerId,
} from "@/utils/gameStorage";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } =
    useSettingsStore();

  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getPlayerData();
    if (data?.name) {
      setPlayerName(data.name);
    }
    setIsLoading(false);
  };

  const handleNameChange = (text) => {
    setPlayerName(text);
    setHasChanges(true); // Ideally compare with initial loaded name
  };

  const handleSaveProfile = async () => {
    if (!playerName.trim()) return;

    setIsSaving(true);
    if (hapticsEnabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Get existing data to keep ID or generate new if totally fresh
    const existing = await getPlayerData();
    const newData = {
      id: existing?.id || generatePlayerId(),
      name: playerName.trim(),
      avatar_color: existing?.avatar_color || "#FF0000", // Default or preserve
    };

    await savePlayerData(newData);

    // Fake delay for feedback
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 500);
  };

  const handleToggleSound = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSound();
  };

  const handleToggleHaptics = () => {
    if (!hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Feedback when turning ON
    toggleHaptics();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PhaseTransition>
        <AnimatedBackground />

        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.titleSection}>
            <View style={styles.iconCircle}>
              <SettingsIcon size={40} color={colors.primary.purple} />
            </View>
            <GlitchText
              style={styles.title}
              text="Settings"
              intensity={0.4}
              frequency={3000}
            >
              Settings
            </GlitchText>
          </View>

          {/* Profile Section */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <User
                  size={20}
                  color={colors.neutral.lightGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={playerName}
                  onChangeText={handleNameChange}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  maxLength={15}
                />
                {hasChanges && (
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                    style={styles.saveButton}
                  >
                    <Save size={20} color={colors.accent.teal} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.helperText}>
                Used in games and leaderboards
              </Text>
            </View>
          </Animated.View>

          {/* Preferences Section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              {/* Sound Toggle */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIcon}>
                    {soundEnabled ? (
                      <Volume2 size={24} color={colors.primary.purpleLight} />
                    ) : (
                      <VolumeX size={24} color={colors.neutral.midGray} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.rowTitle}>Sound Effects</Text>
                    <Text style={styles.rowSubtitle}>
                      In-game audio & music
                    </Text>
                  </View>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={handleToggleSound}
                  trackColor={{ false: "#333", true: colors.primary.purple }}
                  thumbColor={colors.neutral.white}
                />
              </View>

              <View style={styles.divider} />

              {/* Haptics Toggle */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIcon}>
                    <Smartphone
                      size={24}
                      color={
                        hapticsEnabled
                          ? colors.accent.orange
                          : colors.neutral.midGray
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.rowTitle}>Haptic Feedback</Text>
                    <Text style={styles.rowSubtitle}>
                      Vibrations on interaction
                    </Text>
                  </View>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={handleToggleHaptics}
                  trackColor={{ false: "#333", true: colors.primary.purple }}
                  thumbColor={colors.neutral.white}
                />
              </View>
            </View>
          </Animated.View>

          {/* About Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>1.0.0 (Beta)</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Developed by</Text>
                <Text style={styles.aboutValue}>Antigravity Agent</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </PhaseTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(91, 79, 232, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(91, 79, 232, 0.3)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.neutral.white,
    marginBottom: 8,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.neutral.lightGray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginTop: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.white,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.neutral.lightGray,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 12,
    marginLeft: 56, // Align with text
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  aboutLabel: {
    color: colors.neutral.lightGray,
    fontSize: 15,
  },
  aboutValue: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: "500",
  },
});
