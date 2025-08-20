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

const createTables = async (sqliteDB: SQLite.SQLiteDatabase) => {
  const createTablesSQL = `
  -- Create Table for Medical Representatives
  CREATE TABLE IF NOT EXISTS medrep (
    id INTEGER PRIMARY KEY,
    name TEXT,
    api_key TEXT,
    product_app_id TEXT,
    sales_order_app_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
  );

  -- Create Table for Customers
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    full_address TEXT NOT NULL,
    short_address TEXT NOT NULL,
    region TEXT NOT NULL,
    class TEXT NOT NULL,
    practice TEXT,
    s3_license TEXT,
    s3_validity TEXT,
    pharmacist_name TEXT,
    prc_id TEXT,
    prc_validity TEXT,
    remarks TEXT,
    sync_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
  );

  -- Create Table for Items
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    brand_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    milligrams TEXT,
    supply TEXT,
    catalog_price TEXT NOT NULL,
    product_type TEXT NOT NULL,
    inventory INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
  );

  -- Create Table for Item Images
  CREATE TABLE IF NOT EXISTS item_images (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    link TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id)
  );

  -- Create Table for Sales Orders
  CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    medical_representative_id INTEGER NOT NULL,
    sales_order_number TEXT NOT NULL,
    date_sold TEXT NOT NULL,
    total TEXT NOT NULL,
    remarks TEXT,
    sync_date TEXT,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (medical_representative_id) REFERENCES medrep(id)
  );

  -- Create Table for Sales Order Items
  CREATE TABLE IF NOT EXISTS sales_order_items (
    id INTEGER PRIMARY KEY,
    sales_order_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity TEXT NOT NULL,
    promo TEXT NOT NULL,
    discount TEXT,
    free_item_quantity TEXT,
    free_item_remarks TEXT,
    remarks TEXT,
    total REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
  );
`;

  const query = `SELECT COUNT(*) AS count FROM sales_orders`;
  try {
    const result = await sqliteDB.getAllAsync(query);
  } catch (error) {
    await sqliteDB.execAsync(createTablesSQL);
  }
};

export function getSqliteInstance() {
  const sql = SQLite.openDatabaseSync(DB_PATH);

  return sql;
}

export async function getDB() {
  if (!dbInstance) {
    await ensureDBDir();
    const sqlite = getSqliteInstance();

    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

export { DB_DIR, DB_PATH };
