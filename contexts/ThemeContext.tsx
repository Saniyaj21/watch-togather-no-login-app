import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  buildTheme,
  ACCENT_COLORS,
  AccentDef,
  AccentId,
  Theme,
} from "../constants/theme";

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY_MODE = "@theme_mode";
const STORAGE_KEY_ACCENT = "@theme_accent";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentId: AccentId;
  setAccentId: (id: AccentId) => void;
  toggleTheme: () => void;
};

const defaultAccent = ACCENT_COLORS[0];

const ThemeContext = createContext<ThemeContextType>({
  theme: buildTheme(false, defaultAccent),
  isDark: false,
  themeMode: "system",
  setThemeMode: () => {},
  accentId: "amber",
  setAccentId: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [accentId, setAccentIdState] = useState<AccentId>("amber");
  const [loaded, setLoaded] = useState(false);

  // Load persisted values on mount
  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEY_MODE, STORAGE_KEY_ACCENT]).then((pairs) => {
      const mode = pairs[0][1] as ThemeMode | null;
      const accent = pairs[1][1] as AccentId | null;
      if (mode) setThemeModeState(mode);
      if (accent) setAccentIdState(accent);
      setLoaded(true);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY_MODE, mode);
  };

  const setAccentId = (id: AccentId) => {
    setAccentIdState(id);
    AsyncStorage.setItem(STORAGE_KEY_ACCENT, id);
  };

  const isDark =
    themeMode === "system" ? systemScheme === "dark" : themeMode === "dark";

  const accent: AccentDef =
    ACCENT_COLORS.find((a) => a.id === accentId) ?? defaultAccent;

  const theme = buildTheme(isDark, accent);

  const toggleTheme = () => setThemeMode(isDark ? "light" : "dark");

  // Don't render until prefs are loaded to avoid a flash of default theme
  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, themeMode, setThemeMode, accentId, setAccentId, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
