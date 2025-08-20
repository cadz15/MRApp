import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

//medical representative
export const medrep = sqliteTable("medrep", {
  id: integer("id").primaryKey(),
  name: text("name"),
  apiKey: text("api_key"),
  productAppId: text("product_app_id"),
  salesOrderAppId: text("sales_order_app_id"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  deletedAt: text("deleted_at"),
});

// Customers
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  fullAddress: text("full_address").notNull(),
  shortAddress: text("short_address").notNull(),
  region: text("region").notNull(),
  class: text("class").notNull(),
  practice: text("practice"),
  s3License: text("s3_license"),
  s3Validity: text("s3_validity"),
  pharmacistName: text("pharmacist_name"),
  prcId: text("prc_id"),
  prcValidity: text("prc_validity"),
  remarks: text("remarks"),
  syncDate: text("sync_date"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  deletedAt: text("deleted_at"),
});

// Items
export const items = sqliteTable("items", {
  id: integer("id").primaryKey(),
  brandName: text("brand_name"),
  genericName: text("generic_name"),
  milligrams: text("milligrams"),
  supply: text("supply"),
  catalogPrice: text("catalog_price").notNull(),
  productType: text("product_type").notNull(),
  inventory: integer("inventory").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  deletedAt: text("deleted_at"),
});

// Item Images
export const itemImages = sqliteTable("item_images", {
  id: integer("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  link: text("link").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Sales Orders
export const salesOrders = sqliteTable("sales_orders", {
  id: integer("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  medicalRepresentativeId: integer("medical_representative_id").notNull(),
  salesOrderNumber: text("sales_order_number").notNull(),
  dateSold: text("date_sold").notNull(),
  total: text("total").notNull(),
  remarks: text("remarks"),
  syncDate: text("sync_date"),
  status: text("status").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  deletedAt: text("deleted_at"),
});

// Sales Order Items
export const salesOrderItems = sqliteTable("sales_order_items", {
  id: integer("id").primaryKey(),
  salesOrderId: integer("sales_order_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: text("quantity").notNull(),
  promo: text("promo").notNull(),
  discount: text("discount"),
  freeItemQuantity: text("free_item_quantity"),
  freeItemRemarks: text("free_item_remarks"),
  remarks: text("remarks"),
  total: real("total").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  deletedAt: text("deleted_at"),
});
