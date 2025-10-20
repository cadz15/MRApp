CREATE TABLE `daily_call_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`online_id` integer,
	`customer_online_id` integer,
	`customer_id` integer,
	`name` text,
	`practice` text,
	`signature` text,
	`remarks` text,
	`sync_date` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`deleted_at` text
);
