ALTER TABLE `sales_order_items` ADD `item_online_id` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `sales_order_items_online_id_unique` ON `sales_order_items` (`online_id`);