import { drizzle } from "drizzle-orm/expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

const DB_NAME = "app.db";
const DB_DIR = `${FileSystem.documentDirectory}/SQLite`;
const DB_PATH = `${DB_DIR}/${DB_NAME}`;

async function ensureDBDir() {
  const dirInfo = await FileSystem.getInfoAsync(DB_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });
  }
}

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getSqliteInstance() {
  // const sql = await SQLite.openDatabaseAsync(DB_PATH);
  const sql = SQLite.openDatabaseSync(DB_PATH);

  return sql;
}

export async function getDB() {
  if (!dbInstance) {
    await ensureDBDir();
    // const sqlite = await getSqliteInstance();
    const sqlite = getSqliteInstance();

    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

export { DB_DIR, DB_PATH };
