CREATE UNIQUE INDEX `customers_online_id_unique` ON `customers` (`online_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `item_images_online_id_unique` ON `item_images` (`online_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `items_online_id_unique` ON `items` (`online_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `medrep_online_id_unique` ON `medrep` (`online_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sales_order_items_online_id_unique` ON `sales_order_items` (`online_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sales_orders_online_id_unique` ON `sales_orders` (`online_id`);