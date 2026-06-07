import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  password: text("password"),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
  lastSignedIn: text("lastSignedIn").default(sql`(datetime('now'))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Candidate Profile
export const candidates = sqliteTable("candidates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  phone: text("phone"),
  location: text("location"),
  bio: text("bio"),
  cvUrl: text("cvUrl"),
  cvFileName: text("cvFileName"),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

// Professional Experience
export const experiences = sqliteTable("experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  jobTitle: text("jobTitle").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  startDate: text("startDate"),
  endDate: text("endDate"),
  isCurrent: integer("isCurrent", { mode: "boolean" }).default(false),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

// Education
export const educations = sqliteTable("educations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  school: text("school").notNull(),
  degree: text("degree").notNull(),
  fieldOfStudy: text("fieldOfStudy"),
  description: text("description"),
  startDate: text("startDate"),
  endDate: text("endDate"),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
});

export type Education = typeof educations.$inferSelect;
export type InsertEducation = typeof educations.$inferInsert;

// Skills
export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  name: text("name").notNull(),
  level: text("level", { enum: ["beginner", "intermediate", "advanced", "expert"] }).default("intermediate"),
  category: text("category"),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

// Search Preferences
export const searchPreferences = sqliteTable("searchPreferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  preferredSectors: text("preferredSectors"), // JSON string
  preferredLocations: text("preferredLocations"), // JSON string
  preferredContractTypes: text("preferredContractTypes"), // JSON string
  minSalary: text("minSalary"),
  maxSalary: text("maxSalary"),
  experienceLevelMin: text("experienceLevelMin"),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
});

export type SearchPreference = typeof searchPreferences.$inferSelect;
export type InsertSearchPreference = typeof searchPreferences.$inferInsert;

// Job Offers
export const jobOffers = sqliteTable("jobOffers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalId: text("externalId").unique(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  location: text("location"),
  sector: text("sector"),
  contractType: text("contractType"),
  experienceLevel: text("experienceLevel"),
  salaryMin: text("salaryMin"),
  salaryMax: text("salaryMax"),
  currency: text("currency").default("MAD"),
  publishedDate: text("publishedDate"),
  expiryDate: text("expiryDate"),
  sourceUrl: text("sourceUrl"),
  companyLogoUrl: text("companyLogoUrl"),
  skills: text("skills"), // JSON string
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
});

export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = typeof jobOffers.$inferInsert;

// Job Applications
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  jobOfferId: integer("jobOfferId").notNull(),
  status: text("status", { enum: ["applied", "viewed", "rejected", "accepted", "interview"] }).default("applied"),
  appliedDate: text("appliedDate").default(sql`(datetime('now'))`).notNull(),
  matchingScore: real("matchingScore"),
  matchingExplanation: text("matchingExplanation"),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// Saved Jobs
export const savedJobs = sqliteTable("savedJobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  jobOfferId: integer("jobOfferId").notNull(),
  savedDate: text("savedDate").default(sql`(datetime('now'))`).notNull(),
});

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = typeof savedJobs.$inferInsert;

// Job Alerts
export const jobAlerts = sqliteTable("jobAlerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidateId").notNull(),
  name: text("name").notNull(),
  keywords: text("keywords"), // JSON string
  sectors: text("sectors"),
  locations: text("locations"),
  contractTypes: text("contractTypes"),
  minMatchingScore: real("minMatchingScore").default(50),
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  notificationFrequency: text("notificationFrequency", { enum: ["immediate", "daily", "weekly"] }).default("daily"),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
});

export type JobAlert = typeof jobAlerts.$inferSelect;
export type InsertJobAlert = typeof jobAlerts.$inferInsert;
