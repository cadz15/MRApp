import { useDB } from "@/context/DBProvider";
import migrations from "@/drizzle/migrations";
import { getSqliteInstance } from "@/OfflineDB/db";
import { getMedRepData } from "@/OfflineDB/sync";
import { MedicalRepresentativeTableType } from "@/OfflineDB/tableTypes";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirstLoading from "./firstloading";

const CheckAPI = () => {
  const [hasAPI, setHasAPI] = useState(false);
  const [medRepData, setMedRepData] =
    useState<MedicalRepresentativeTableType | null>(null);
  const [apiAccessible, setApiAccessible] = useState("black");

  const API_URL = `${process.env.EXPO_PUBLIC_API_LINK}/ping`;

  useDrizzleStudio(getSqliteInstance());

  const db = useDB();

  try {
    const { success, error } = useMigrations(db, migrations);
  } catch (error) {
    console.log(error);
  }

  const checkMedrep = async () => {
    const medrep = await getMedRepData();

    return medrep;
  };

  const pingApi = async () => {
    const medrepDataHere = await checkMedrep();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(API_URL, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": `${medrepDataHere[0]?.apiKey}`,
          "X-API-APP-KEY": `${medrepDataHere[0]?.salesOrderAppId}`,
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setApiAccessible("green");
      } else {
        setApiAccessible("black");
      }
    } catch (error) {
      setApiAccessible("black");
    }
  };

  useEffect(() => {
    checkMedrep().then((item) => {
      if (item.length > 0) {
        setHasAPI(true);
        setMedRepData(item[0]);
      }
    });

    pingApi();

    const interval = setInterval(pingApi, 5000); // repeat every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: apiAccessible }]}
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
  },
});

export default CheckAPI;
