import React from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export function PhaseTransition({ children, style }) {
  return (
    <Animated.View
      style={[styles.container, style]}
      entering={FadeIn.duration(600)}
      exiting={FadeOut.duration(300)}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
