export type AccentId =
  | "amber"
  | "blue"
  | "purple"
  | "green"
  | "red"
  | "pink"
  | "teal"
  | "indigo";

export type AccentDef = {
  id: AccentId;
  label: string;
  lightPrimary: string;
  darkPrimary: string;
  lightPrimaryLight: string;
  darkPrimaryLight: string;
};

export const ACCENT_COLORS: AccentDef[] = [
  {
    id: "amber",
    label: "Amber",
    lightPrimary: "#D4820A",
    darkPrimary: "#F5A524",
    lightPrimaryLight: "#FEF3DC",
    darkPrimaryLight: "#281E0A",
  },
  {
    id: "blue",
    label: "Blue",
    lightPrimary: "#0071E3",
    darkPrimary: "#0A84FF",
    lightPrimaryLight: "#E0EFFF",
    darkPrimaryLight: "#001830",
  },
  {
    id: "purple",
    label: "Purple",
    lightPrimary: "#9B40D8",
    darkPrimary: "#BF5AF2",
    lightPrimaryLight: "#F3E8FC",
    darkPrimaryLight: "#1E0A2E",
  },
  {
    id: "green",
    label: "Green",
    lightPrimary: "#25A244",
    darkPrimary: "#32D74B",
    lightPrimaryLight: "#E2F7E8",
    darkPrimaryLight: "#0A200F",
  },
  {
    id: "red",
    label: "Red",
    lightPrimary: "#E0352B",
    darkPrimary: "#FF453A",
    lightPrimaryLight: "#FDECEA",
    darkPrimaryLight: "#2A0B09",
  },
  {
    id: "pink",
    label: "Pink",
    lightPrimary: "#E8185A",
    darkPrimary: "#FF375F",
    lightPrimaryLight: "#FDEAF1",
    darkPrimaryLight: "#280A14",
  },
  {
    id: "teal",
    label: "Teal",
    lightPrimary: "#0095A8",
    darkPrimary: "#5AC8FA",
    lightPrimaryLight: "#E0F5F8",
    darkPrimaryLight: "#00141A",
  },
  {
    id: "indigo",
    label: "Indigo",
    lightPrimary: "#4B44C8",
    darkPrimary: "#7D7AFF",
    lightPrimaryLight: "#EEECFB",
    darkPrimaryLight: "#0D0B28",
  },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const lightBase = {
  background: "#FAFAF8",
  surface: "#F2F0EC",
  surface2: "#E8E5DF",
  text: "#1A1917",
  textSecondary: "#6B6760",
  border: "#DDD8D1",
  chatBubbleOther: "#ECEAE4",
  chatBubbleOtherText: "#1A1917",
  chatBubbleSelfText: "#FFFFFF",
  inputBackground: "#F2F0EC",
  danger: "#FF3B30",
  success: "#34C759",
  overlay: "rgba(0,0,0,0.4)",
};

const darkBase = {
  background: "#0A0A0B",
  surface: "#141416",
  surface2: "#1E1E22",
  text: "#F0EFE7",
  textSecondary: "#8C8C92",
  border: "#2C2C31",
  chatBubbleOther: "#1E1E22",
  chatBubbleOtherText: "#F0EFE7",
  chatBubbleSelfText: "#0A0A0B",
  inputBackground: "#141416",
  danger: "#FF453A",
  success: "#32D74B",
  overlay: "rgba(0,0,0,0.75)",
};

export function buildTheme(isDark: boolean, accent: AccentDef) {
  const base = isDark ? darkBase : lightBase;
  const primary = isDark ? accent.darkPrimary : accent.lightPrimary;
  const primaryLight = isDark ? accent.darkPrimaryLight : accent.lightPrimaryLight;
  return {
    ...base,
    primary,
    primaryLight,
    primaryMuted: hexToRgba(primary, 0.1),
    chatBubbleSelf: primary,
  };
}

// Default themes (amber accent)
const defaultAccent = ACCENT_COLORS[0];
export const lightTheme = buildTheme(false, defaultAccent);
export const darkTheme = buildTheme(true, defaultAccent);

export type Theme = ReturnType<typeof buildTheme>;
