import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, Theme } from "../constants/theme";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<"light" | "dark" | null>(null);

  const isDark = override ? override === "dark" : systemScheme === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setOverride(isDark ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
