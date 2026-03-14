ALTER TABLE `subtask_history` ADD `adapter_lock` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
UPDATE `subtask_history` SET `adapter_lock` = json_object('instanceRef', adapter_ref, 'pluginRef', 'unknown', 'version', 'unknown') WHERE `adapter_lock` IS NULL OR `adapter_lock` = '{}';--> statement-breakpoint
ALTER TABLE `subtask_history` DROP COLUMN `adapter_ref`;--> statement-breakpoint
ALTER TABLE `query_history` DROP COLUMN `adapters`;