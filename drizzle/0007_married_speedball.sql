ALTER TABLE `daily_call_records` ADD `dcr_date` text;--> statement-breakpoint
CREATE UNIQUE INDEX `daily_call_records_online_id_unique` ON `daily_call_records` (`online_id`);