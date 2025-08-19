import { getMedRepData } from "@/OfflineDB/sync";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirstLoading from "./firstloading";

const CheckAPI = () => {
  const [hasAPI, setHasAPI] = useState(false);

  useEffect(() => {
    async () => {
      if ((await getMedRepData()).length > 0) {
        setHasAPI(true);
      }
    };
  }, []);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar hidden />
      {hasAPI ? (
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
      ) : (
        <>
          <FirstLoading />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // Match your app's theme
  },
});

export default CheckAPI;
