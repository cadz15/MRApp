PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY NOT NULL,
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
INSERT INTO `__new_items`("id", "brand_name", "generic_name", "milligrams", "supply", "catalog_price", "product_type", "inventory", "created_at", "updated_at", "deleted_at") SELECT "id", "brand_name", "generic_name", "milligrams", "supply", "catalog_price", "product_type", "inventory", "created_at", "updated_at", "deleted_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;