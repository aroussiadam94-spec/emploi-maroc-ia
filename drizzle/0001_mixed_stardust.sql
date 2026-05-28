CREATE TABLE `alertNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`jobOfferId` int NOT NULL,
	`candidateId` int NOT NULL,
	`sent` boolean DEFAULT false,
	`sentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`jobOfferId` int NOT NULL,
	`status` enum('applied','viewed','rejected','accepted','interview') DEFAULT 'applied',
	`appliedDate` timestamp NOT NULL DEFAULT (now()),
	`matchingScore` decimal(5,2),
	`matchingExplanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(20),
	`location` varchar(255),
	`bio` text,
	`cvUrl` varchar(500),
	`cvFileName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`school` varchar(255) NOT NULL,
	`degree` varchar(255) NOT NULL,
	`fieldOfStudy` varchar(255),
	`description` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `educations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`description` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`isCurrent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keywords` json,
	`sectors` json,
	`locations` json,
	`contractTypes` json,
	`minMatchingScore` decimal(5,2) DEFAULT 50,
	`isActive` boolean DEFAULT true,
	`notificationFrequency` enum('immediate','daily','weekly') DEFAULT 'daily',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(500),
	`source` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`company` varchar(255) NOT NULL,
	`description` text,
	`requirements` text,
	`location` varchar(255),
	`sector` varchar(100),
	`contractType` varchar(50),
	`experienceLevel` varchar(50),
	`salaryMin` decimal(10,2),
	`salaryMax` decimal(10,2),
	`currency` varchar(10) DEFAULT 'MAD',
	`publishedDate` timestamp,
	`expiryDate` timestamp,
	`sourceUrl` varchar(1000),
	`companyLogoUrl` varchar(500),
	`skills` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobOffers_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobOffers_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `savedJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`jobOfferId` int NOT NULL,
	`savedDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`query` varchar(500),
	`filters` json,
	`resultsCount` int,
	`searchDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`preferredSectors` json,
	`preferredLocations` json,
	`preferredContractTypes` json,
	`minSalary` decimal(10,2),
	`maxSalary` decimal(10,2),
	`experienceLevelMin` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searchPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`level` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_source` ON `jobOffers` (`source`);--> statement-breakpoint
CREATE INDEX `idx_externalId` ON `jobOffers` (`externalId`);