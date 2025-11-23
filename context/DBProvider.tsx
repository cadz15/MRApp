import { getDB } from "@/OfflineDB/db";
import { isOnline } from "@/utils/checkInternet";
import React, { createContext, useContext, useEffect, useState } from "react";

type DBContextType = Awaited<ReturnType<typeof getDB>> | null;

const DBContext = createContext<DBContextType>(null);

export const useDB = () => {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error("useDB must be inside DBProvider");
  return ctx;
};

export const DBProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<DBContextType>(null);

  useEffect(() => {
    (async () => {
      const d = await getDB();
      setDb(d);

      const online = await isOnline();

      if (online) {
        // await syncDownData();
      }
    })();
  }, []);

  if (!db) return null; // could show splash screen or loader

  return <DBContext.Provider value={db}>{children}</DBContext.Provider>;
};
