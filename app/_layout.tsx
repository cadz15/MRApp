import { DBProvider } from "@/context/DBProvider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <DBProvider>
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom", "left", "right"]}
      >
        <StatusBar hidden />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="pages/salesorder"
            options={{
              headerShown: false,
              headerTitleStyle: { fontFamily: "mon-sb" },
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="pages/createsale"
            options={{
              headerShown: false,
              headerTitleStyle: { fontFamily: "mon-sb" },
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="salesorder/[id]"
            options={{
              headerShown: false,
              headerTitleStyle: { fontFamily: "mon-sb" },
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </DBProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // Match your app's theme
  },
});
