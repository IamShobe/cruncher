CREATE TABLE `query_history` (
	`id` text PRIMARY KEY NOT NULL,
	`search_term` text NOT NULL,
	`search_profile` text NOT NULL,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`row_count` integer,
	`status` text NOT NULL,
	`error` text,
	`adapters` text,
	`subtask_ids` text NOT NULL DEFAULT '[]',
	`from_time` integer,
	`to_time` integer,
	`disk_bytes` integer
);
--> statement-breakpoint
CREATE INDEX `idx_history_created_at` ON `query_history` (`created_at`);
--> statement-breakpoint
CREATE TABLE `subtask_history` (
	`id` text PRIMARY KEY NOT NULL,
	`dedup_key` text NOT NULL,
	`data_dir` text NOT NULL,
	`adapter_ref` text NOT NULL,
	`search_term` text NOT NULL,
	`search_profile` text NOT NULL,
	`from_time` integer,
	`to_time` integer,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`row_count` integer,
	`disk_bytes` integer,
	`from_dedup` integer NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE INDEX `idx_subtask_dedup` ON `subtask_history` (`dedup_key`);
--> statement-breakpoint
CREATE TABLE `subtask_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`dedup_key` text NOT NULL,
	`chunk_path` text NOT NULL,
	`row_count` integer NOT NULL,
	`disk_bytes` integer,
	`min_time` integer,
	`max_time` integer,
	`written_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_chunks_dedup_key` ON `subtask_chunks` (`dedup_key`);
--> statement-breakpoint
CREATE TABLE `subtask_chunk_refs` (
	`subtask_id` text NOT NULL,
	`chunk_id` text NOT NULL,
	`from_cache` integer NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE INDEX `idx_chunk_refs_subtask` ON `subtask_chunk_refs` (`subtask_id`);
