import { useDB } from "@/context/DBProvider";
import migrations from "@/drizzle/migrations";
import { getSqliteInstance } from "@/OfflineDB/db";
import { getMedRepData } from "@/OfflineDB/sync";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirstLoading from "./firstloading";

const CheckAPI = () => {
  const [hasAPI, setHasAPI] = useState(false);
  const [medRepData, setMedRepData] = useState(null);

  useDrizzleStudio(getSqliteInstance());

  const db = useDB();

  try {
    const { success, error } = useMigrations(db, migrations);
  } catch (error) {
    console.log(error);
  }

  const checkMedrep = () => {
    const medrep = getMedRepData();

    return medrep;
  };

  useEffect(() => {
    checkMedrep().then((item) => {
      if (item.length > 0) {
        setHasAPI(true);
      }
    });
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
