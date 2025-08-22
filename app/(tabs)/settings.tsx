import UnderConstruction from "@/components/UnderConstruction";
import { syncDownData, syncUpData } from "@/OfflineDB/sync";
import React, { useEffect } from "react";

const settings = () => {
  useEffect(() => {
    syncDownData().then((res) => {
      syncUpData().then((fi) => {});
    });
  }, []);

  return <UnderConstruction />;
};

export default settings;
