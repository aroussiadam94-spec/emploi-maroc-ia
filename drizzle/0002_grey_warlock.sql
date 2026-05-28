ALTER TABLE `jobAlerts` MODIFY COLUMN `minMatchingScore` decimal(5,2) DEFAULT '50';--> statement-breakpoint
ALTER TABLE `searchPreferences` MODIFY COLUMN `minSalary` varchar(255);--> statement-breakpoint
ALTER TABLE `searchPreferences` MODIFY COLUMN `maxSalary` varchar(255);