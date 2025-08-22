PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`name` text NOT NULL,
	`full_address` text NOT NULL,
	`short_address` text NOT NULL,
	`region` text NOT NULL,
	`class` text NOT NULL,
	`practice` text,
	`s3_license` text,
	`s3_validity` text,
	`pharmacist_name` text,
	`prc_id` text,
	`prc_validity` text,
	`remarks` text,
	`sync_date` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_customers`("id", "online_id", "name", "full_address", "short_address", "region", "class", "practice", "s3_license", "s3_validity", "pharmacist_name", "prc_id", "prc_validity", "remarks", "sync_date", "created_at", "updated_at", "deleted_at") SELECT "id", "online_id", "name", "full_address", "short_address", "region", "class", "practice", "s3_license", "s3_validity", "pharmacist_name", "prc_id", "prc_validity", "remarks", "sync_date", "created_at", "updated_at", "deleted_at" FROM `customers`;--> statement-breakpoint
DROP TABLE `customers`;--> statement-breakpoint
ALTER TABLE `__new_customers` RENAME TO `customers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_item_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`item_id` integer NOT NULL,
	`link` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
INSERT INTO `__new_item_images`("id", "online_id", "item_id", "link", "created_at", "updated_at") SELECT "id", "online_id", "item_id", "link", "created_at", "updated_at" FROM `item_images`;--> statement-breakpoint
DROP TABLE `item_images`;--> statement-breakpoint
ALTER TABLE `__new_item_images` RENAME TO `item_images`;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`brand_name` text,
	`generic_name` text,
	`milligrams` text,
	`supply` text,
	`catalog_price` text NOT NULL,
	`product_type` text NOT NULL,
	`inventory` integer NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "online_id", "brand_name", "generic_name", "milligrams", "supply", "catalog_price", "product_type", "inventory", "created_at", "updated_at", "deleted_at") SELECT "id", "online_id", "brand_name", "generic_name", "milligrams", "supply", "catalog_price", "product_type", "inventory", "created_at", "updated_at", "deleted_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
CREATE TABLE `__new_medrep` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`name` text,
	`api_key` text,
	`product_app_id` text,
	`sales_order_app_id` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_medrep`("id", "online_id", "name", "api_key", "product_app_id", "sales_order_app_id", "created_at", "updated_at", "deleted_at") SELECT "id", "online_id", "name", "api_key", "product_app_id", "sales_order_app_id", "created_at", "updated_at", "deleted_at" FROM `medrep`;--> statement-breakpoint
DROP TABLE `medrep`;--> statement-breakpoint
ALTER TABLE `__new_medrep` RENAME TO `medrep`;--> statement-breakpoint
CREATE TABLE `__new_sales_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`sales_order_id` integer,
	`sales_order_offline_id` integer,
	`item_id` integer NOT NULL,
	`quantity` text NOT NULL,
	`promo` text NOT NULL,
	`discount` text,
	`free_item_quantity` text,
	`free_item_remarks` text,
	`remarks` text,
	`total` real NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_sales_order_items`("id", "online_id", "sales_order_id", "sales_order_offline_id", "item_id", "quantity", "promo", "discount", "free_item_quantity", "free_item_remarks", "remarks", "total", "created_at", "updated_at", "deleted_at") SELECT "id", "online_id", "sales_order_id", "sales_order_offline_id", "item_id", "quantity", "promo", "discount", "free_item_quantity", "free_item_remarks", "remarks", "total", "created_at", "updated_at", "deleted_at" FROM `sales_order_items`;--> statement-breakpoint
DROP TABLE `sales_order_items`;--> statement-breakpoint
ALTER TABLE `__new_sales_order_items` RENAME TO `sales_order_items`;--> statement-breakpoint
CREATE TABLE `__new_sales_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`customer_id` integer,
	`customer_online_id` integer,
	`medical_representative_id` integer NOT NULL,
	`sales_order_number` text NOT NULL,
	`date_sold` text NOT NULL,
	`total` text NOT NULL,
	`remarks` text,
	`sync_date` text,
	`status` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sales_orders`("id", "online_id", "customer_id", "customer_online_id", "medical_representative_id", "sales_order_number", "date_sold", "total", "remarks", "sync_date", "status", "created_at", "updated_at", "deleted_at") SELECT "id", "online_id", "customer_id", "customer_online_id", "medical_representative_id", "sales_order_number", "date_sold", "total", "remarks", "sync_date", "status", "created_at", "updated_at", "deleted_at" FROM `sales_orders`;--> statement-breakpoint
DROP TABLE `sales_orders`;--> statement-breakpoint
ALTER TABLE `__new_sales_orders` RENAME TO `sales_orders`;