import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import {
  buildTheme,
  ACCENT_COLORS,
  AccentDef,
  AccentId,
  Theme,
} from "../constants/theme";

export type ThemeMode = "system" | "light" | "dark";

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
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [accentId, setAccentId] = useState<AccentId>("amber");

  const isDark =
    themeMode === "system" ? systemScheme === "dark" : themeMode === "dark";

  const accent: AccentDef =
    ACCENT_COLORS.find((a) => a.id === accentId) ?? defaultAccent;

  const theme = buildTheme(isDark, accent);

  const toggleTheme = () => {
    setThemeMode(isDark ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, themeMode, setThemeMode, accentId, setAccentId, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
