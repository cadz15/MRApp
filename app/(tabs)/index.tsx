import { StyleSheet } from "react-native";

import SyncingPage from "@/components/SyncingPage";
import UnderConstruction from "@/components/UnderConstruction";
import { syncDownData } from "@/OfflineDB/sync";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const [syncing, setSyncing] = useState(true);
  const [syncingValue, setSyncingValue] = useState(30);

  useEffect(() => {
    const doSync = async () => {
      return await syncDownData();
    };

    setSyncing(true);
    if (syncingValue === 30) {
      setSyncingValue(40);
      doSync().then(() => {
        setSyncing(false);
        setSyncingValue(100);
      });
    }
  }, [syncingValue]);
  return (
    <>
      {syncingValue < 100 ? (
        <SyncingPage percentValue={syncingValue} />
      ) : (
        <UnderConstruction />
      )}
    </>
  );
}

const styles = StyleSheet.create({});
