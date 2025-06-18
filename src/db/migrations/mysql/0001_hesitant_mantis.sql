ALTER TABLE `users` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `users_roles` enum('admin','user') DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE `users` ADD `users_status` enum('active','inactive') DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `updatedAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);