import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
        {/* <Stack.Screen name="create-room" options={{ headerShown: false }} /> */}
        <Stack.Screen name="join-room" options={{ title: "Join Room" }} />
        <Stack.Screen
          name="room/[roomId]"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <RootNav />
    </ThemeProvider>
  );
}
