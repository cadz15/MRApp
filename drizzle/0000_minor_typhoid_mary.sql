CREATE TABLE `customers` (
	`id` integer PRIMARY KEY NOT NULL,
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
CREATE TABLE `item_images` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer NOT NULL,
	`link` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY NOT NULL,
	`brand_name` text NOT NULL,
	`generic_name` text NOT NULL,
	`milligrams` text NOT NULL,
	`supply` text NOT NULL,
	`catalog_price` text NOT NULL,
	`product_type` text NOT NULL,
	`inventory` integer NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `medrep` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`api_key` text,
	`product_app_id` text,
	`sales_order_app_id` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `sales_order_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`sales_order_id` integer NOT NULL,
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
CREATE TABLE `sales_orders` (
	`id` integer PRIMARY KEY NOT NULL,
	`customer_id` integer,
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
