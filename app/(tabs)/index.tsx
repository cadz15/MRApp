import { StyleSheet } from "react-native";

import UnderConstruction from "@/components/UnderConstruction";
import { syncDownData } from "@/OfflineDB/sync";
import { useEffect } from "react";

export default function HomeScreen() {
  useEffect(() => {
    syncDownData();
  }, []);

  return <UnderConstruction />;
}

const styles = StyleSheet.create({});
