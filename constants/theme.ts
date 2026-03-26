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
  background: "#1A1A2E",
  surface: "#16213E",
  text: "#EAEAEA",
  textSecondary: "#AAAAAA",
  primary: "#6C5CE7",
  primaryLight: "#A29BFE",
  border: "#2A2A4A",
  chatBubbleSelf: "#6C5CE7",
  chatBubbleSelfText: "#FFFFFF",
  chatBubbleOther: "#2A2A4A",
  chatBubbleOtherText: "#EAEAEA",
  inputBackground: "#16213E",
  danger: "#E74C3C",
  success: "#2ECC71",
};

export type Theme = typeof lightTheme;
