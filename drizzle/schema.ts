import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Candidate Profile
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  bio: text("bio"),
  cvUrl: varchar("cvUrl", { length: 500 }),
  cvFileName: varchar("cvFileName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

// Professional Experience
export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isCurrent: boolean("isCurrent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

// Education
export const educations = mysqlTable("educations", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  school: varchar("school", { length: 255 }).notNull(),
  degree: varchar("degree", { length: 255 }).notNull(),
  fieldOfStudy: varchar("fieldOfStudy", { length: 255 }),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Education = typeof educations.$inferSelect;
export type InsertEducation = typeof educations.$inferInsert;

// Skills
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
  category: varchar("category", { length: 100 }), // technical, soft, language
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

// Search Preferences
export const searchPreferences = mysqlTable("searchPreferences", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  preferredSectors: json("preferredSectors"), // JSON array of sectors
  preferredLocations: json("preferredLocations"), // JSON array of locations
  preferredContractTypes: json("preferredContractTypes"), // JSON array: CDI, CDD, Stage, etc.
  minSalary: varchar("minSalary", { length: 255 }),
  maxSalary: varchar("maxSalary", { length: 255 }),
  experienceLevelMin: varchar("experienceLevelMin", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SearchPreference = typeof searchPreferences.$inferSelect;
export type InsertSearchPreference = typeof searchPreferences.$inferInsert;

// Type adjustments for API
export type SearchPreferenceInput = {
  preferredSectors?: string[];
  preferredLocations?: string[];
  preferredContractTypes?: string[];
  minSalary?: number;
  maxSalary?: number;
  experienceLevelMin?: string;
};

// Job Offers
export const jobOffers = mysqlTable("jobOffers", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 500 }).unique(), // ID from source
  source: varchar("source", { length: 100 }).notNull(), // emploi.ma, rekrute, anapec, indeed, linkedin
  title: varchar("title", { length: 500 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  location: varchar("location", { length: 255 }),
  sector: varchar("sector", { length: 100 }),
  contractType: varchar("contractType", { length: 50 }), // CDI, CDD, Stage, etc.
  experienceLevel: varchar("experienceLevel", { length: 50 }), // Junior, Confirmé, Senior
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("MAD"),
  publishedDate: timestamp("publishedDate"),
  expiryDate: timestamp("expiryDate"),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  companyLogoUrl: varchar("companyLogoUrl", { length: 500 }),
  skills: json("skills"), // JSON array of required skills
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("idx_source").on(table.source),
  externalIdIdx: index("idx_externalId").on(table.externalId),
}));

export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = typeof jobOffers.$inferInsert;

// Job Applications
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  jobOfferId: int("jobOfferId").notNull(),
  status: mysqlEnum("status", ["applied", "viewed", "rejected", "accepted", "interview"]).default("applied"),
  appliedDate: timestamp("appliedDate").defaultNow().notNull(),
  matchingScore: decimal("matchingScore", { precision: 5, scale: 2 }), // 0-100
  matchingExplanation: text("matchingExplanation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// Saved Jobs
export const savedJobs = mysqlTable("savedJobs", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  jobOfferId: int("jobOfferId").notNull(),
  savedDate: timestamp("savedDate").defaultNow().notNull(),
});

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = typeof savedJobs.$inferInsert;

// Search History
export const searchHistory = mysqlTable("searchHistory", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  query: varchar("query", { length: 500 }),
  filters: json("filters"), // JSON object with applied filters
  resultsCount: int("resultsCount"),
  searchDate: timestamp("searchDate").defaultNow().notNull(),
});

export type SearchHistoryRecord = typeof searchHistory.$inferSelect;
export type InsertSearchHistoryRecord = typeof searchHistory.$inferInsert;

// Job Alerts
export const jobAlerts = mysqlTable("jobAlerts", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  keywords: json("keywords"), // JSON array of keywords
  sectors: json("sectors"), // JSON array of sectors
  locations: json("locations"), // JSON array of locations
  contractTypes: json("contractTypes"), // JSON array
  minMatchingScore: decimal("minMatchingScore", { precision: 5, scale: 2 }).default("50"), // Minimum matching score threshold
  isActive: boolean("isActive").default(true),
  notificationFrequency: mysqlEnum("notificationFrequency", ["immediate", "daily", "weekly"]).default("daily"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobAlert = typeof jobAlerts.$inferSelect;
export type InsertJobAlert = typeof jobAlerts.$inferInsert;

// Alert Notifications
export const alertNotifications = mysqlTable("alertNotifications", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull(),
  jobOfferId: int("jobOfferId").notNull(),
  candidateId: int("candidateId").notNull(),
  sent: boolean("sent").default(false),
  sentDate: timestamp("sentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertNotification = typeof alertNotifications.$inferSelect;
export type InsertAlertNotification = typeof alertNotifications.$inferInsert;