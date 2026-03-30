export const lightTheme = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#1A1A1A",
  textSecondary: "#666666",
  primary: "#6C5CE7",
  primaryLight: "#A29BFE",
  border: "#E0E0E0",
  chatBubbleSelf: "#6C5CE7",
  chatBubbleSelfText: "#FFFFFF",
  chatBubbleOther: "#F0F0F0",
  chatBubbleOtherText: "#1A1A1A",
  inputBackground: "#F5F5F5",
  danger: "#E74C3C",
  success: "#2ECC71",
};

export const darkTheme = {
  background: "#0a0e18",
  surface: "#1a1f2d",
  text: "#e5e7f6",
  textSecondary: "#a7aab9",
  primary: "#ba9eff",
  primaryLight: "#d9c8ff",
  border: "#202534",
  chatBubbleSelf: "rgba(186, 158, 255, 0.2)",
  chatBubbleSelfText: "#e5e7f6",
  chatBubbleOther: "#1a1f2d",
  chatBubbleOtherText: "#e5e7f6",
  inputBackground: "#0f131e",
  danger: "#ff6e84",
  success: "#2ECC71",
};

export type Theme = typeof lightTheme;
