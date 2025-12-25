// IRL Imposter Design System Colors
export const colors = {
  background: {
    dark: "#1A1A2E",
    purple: "#2D2640",
    darker: "#16161E",
  },
  primary: {
    purple: "#5B4FE8",
    purpleLight: "#7B6AFF",
    purpleDark: "#4A3BC7",
  },
  accent: {
    red: "#FF5757",
    green: "#00FF9D",
    teal: "#00D9C0",
    orange: "#FFB800",
    orangeLight: "#FF8A00",
  },
  neutral: {
    white: "#FFFFFF",
    lightGray: "#B8B8C8",
    midGray: "#6B6B7B",
  },
};

export const typography = {
  logoTitle: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
};

// Gradient presets for easy reuse
export const gradients = {
  background: [
    colors.background.dark,
    colors.background.purple,
    colors.background.darker,
  ],
  primaryButton: [colors.primary.purple, colors.primary.purpleLight],
  testButton: [colors.accent.orangeLight, colors.accent.orange],
};

export default colors;
