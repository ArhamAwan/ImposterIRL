import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  BookOpen,
  Users,
  MessageSquare,
  Fingerprint,
} from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { colors } from "@/constants/imposterColors";
import { PhaseTransition } from "@/components/game/PhaseTransition";
import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { GradientButton } from "@/components/home/GradientButton";
import { GlitchText } from "@/components/effects/GlitchText";

export default function HowToPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        >
          <View style={styles.titleSection}>
            <View style={styles.iconCircle}>
              <BookOpen size={40} color={colors.primary.purple} />
            </View>
            <GlitchText
              style={styles.title}
              text="How to Play"
              intensity={0.4}
              frequency={3000}
            >
              How to Play
            </GlitchText>
            <Text style={styles.subtitle}>Master the art of deception</Text>
          </View>

          <View style={styles.rulesContainer}>
            <RuleItem
              icon={<Users size={24} color={colors.accent.teal} />}
              title="The Setup"
              description="Everyone joins the lobby. One random player becomes the Imposter. Everyone else is a Crewmate."
              delay={100}
            />

            <RuleItem
              icon={<Fingerprint size={24} color={colors.accent.orange} />}
              title="The Word"
              description="Crewmates all see the same secret word (e.g., 'Pizza'). The Imposter sees a slightly different word (e.g., 'Burger') or nothing at all."
              delay={200}
            />

            <RuleItem
              icon={
                <MessageSquare size={24} color={colors.primary.purpleLight} />
              }
              title="Describe"
              description="Take turns describing your word with a single phrase. Don't be too obvious, or the Imposter will guess it! But don't be too vague, or Crewmates will suspect you."
              delay={300}
            />

            <RuleItem
              icon={<Users size={24} color={colors.accent.red} />}
              title="Vote"
              description="After discussing, vote for who you think the Imposter is. If the Imposter is caught, Crewmates win! (Unless the Imposter guesses the secret word...)"
              delay={400}
            />
          </View>

          <Animated.View
            entering={FadeIn.delay(600).duration(500)}
            style={styles.buttonContainer}
          >
            <GradientButton
              variant="primary"
              onPress={() => router.back()}
              style={styles.button}
            >
              Got it, let's play!
            </GradientButton>
          </Animated.View>
        </ScrollView>
      </PhaseTransition>
    </View>
  );
}

function RuleItem({ icon, title, description, delay }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={styles.ruleCard}
    >
      <View style={styles.ruleHeader}>
        <View style={styles.ruleIcon}>{icon}</View>
        <Text style={styles.ruleTitle}>{title}</Text>
      </View>
      <Text style={styles.ruleDescription}>{description}</Text>
    </Animated.View>
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
    marginBottom: 40,
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
  subtitle: {
    fontSize: 16,
    color: colors.neutral.lightGray,
    textAlign: "center",
  },
  rulesContainer: {
    gap: 16,
  },
  ruleCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.neutral.white,
  },
  ruleDescription: {
    fontSize: 15,
    color: colors.neutral.lightGray,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  button: {
    width: "100%",
  },
});
