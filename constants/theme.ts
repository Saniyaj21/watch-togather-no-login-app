export const lightTheme = {
  background: "#FFFFFF",
  surface: "#F8FAFC",
  text: "#0F172A",
  textSecondary: "#64748B",
  primary: "#6366F1",
  primaryLight: "#EEF2FF",
  border: "#E2E8F0",
  chatBubbleSelf: "#6366F1",
  chatBubbleSelfText: "#FFFFFF",
  chatBubbleOther: "#F1F5F9",
  chatBubbleOtherText: "#1E293B",
  inputBackground: "#F8FAFC",
  danger: "#EF4444",
  success: "#10B981",
};

export const darkTheme = {
  background: "#0F172A",
  surface: "#1E293B",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  primary: "#818CF8",
  primaryLight: "#312E81",
  border: "#334155",
  chatBubbleSelf: "#818CF8",
  chatBubbleSelfText: "#0F172A",
  chatBubbleOther: "#1E293B",
  chatBubbleOtherText: "#F8FAFC",
  inputBackground: "#0F172A",
  danger: "#F87171",
  success: "#34D399",
};

export type Theme = typeof lightTheme;
