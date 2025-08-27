import SyncingPage from "@/components/SyncingPage";
import { useDB } from "@/context/DBProvider";
import migrations from "@/drizzle/migrations";
import { getMedRepData } from "@/OfflineDB/sync";
import { MedicalRepresentativeTableType } from "@/OfflineDB/tableTypes";
import axios from "axios";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirstLoading from "./firstloading";

const CheckAPI = () => {
  const [hasAPI, setHasAPI] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [syncingValue, setSyncingValue] = useState(10);
  const [medRepData, setMedRepData] =
    useState<MedicalRepresentativeTableType | null>(null);
  const [apiAccessible, setApiAccessible] = useState("black");

  const API_URL = `${process.env.EXPO_PUBLIC_API_LINK}/ping`;

  // useDrizzleStudio(getSqliteInstance());

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

  const syncData = () => {
    setSyncing(true);
    setSyncingValue(50);
    // syncDownData().then((resp) => setSyncing(false));

    setSyncing(false);
    setSyncingValue(100);
  };

  const pingApi = async () => {
    const medrepDataHere = await checkMedrep();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await axios.head(API_URL, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": `${medrepDataHere[0]?.apiKey}`,
          "X-API-APP-KEY": `${medrepDataHere[0]?.salesOrderAppId}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
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
        setSyncing(true);
        syncData();
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
        syncing ? (
          <SyncingPage percentValue={syncingValue} />
        ) : (
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
            <Stack.Screen
              name="pages/createcustomer"
              options={{
                headerShown: false,
                headerTitleStyle: { fontFamily: "mon-sb" },
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        )
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
