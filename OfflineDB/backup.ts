import * as FileSystem from "expo-file-system";
import { DB_PATH } from "./db";

const BACKUP_PATH = `${FileSystem.documentDirectory}backup/app-backup.db`;

// Create backup
export async function backupDB() {
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}backup`, {
    intermediates: true,
  });
  await FileSystem.copyAsync({ from: DB_PATH, to: BACKUP_PATH });
  return BACKUP_PATH;
}

// Restore backup
export async function restoreDB() {
  const info = await FileSystem.getInfoAsync(BACKUP_PATH);
  if (!info.exists) {
    throw new Error("No backup found");
  }
  await FileSystem.copyAsync({ from: BACKUP_PATH, to: DB_PATH });
  return true;
}
