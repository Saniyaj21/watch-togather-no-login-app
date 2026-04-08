import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast } from "../components/Toast";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function RootNav() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Watch Together", headerShown: false }}
        />
        <Stack.Screen name="join-room" options={{ headerShown: false }} />
        <Stack.Screen
          name="room/[roomId]"
          options={{ headerShown: false }}
        />
      </Stack>
      <Toast.Component />
    </>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

