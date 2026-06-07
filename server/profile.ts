/**
 * server/profile.ts
 * Database access functions for candidate profile sub-resources:
 * experiences, educations, skills, and job search preferences.
 *
 * Each section follows the same pattern:
 *   get*    – SELECT rows belonging to a candidate.
 *   add*    – INSERT a new row and return the updated list.
 *   update* – PATCH a specific row by its primary key.
 *   delete* – DELETE a specific row by its primary key.
 *
 * NOTE: These functions import from the MySQL drizzle/schema. For SQLite
 * support the routers.ts layer would need to branch similarly to db.ts.
 */

import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  experiences,
  educations,
  skills,
  searchPreferences,
  InsertExperience,
  InsertEducation,
  InsertSkill,
  InsertSearchPreference,
} from "../drizzle/schema";

// ─── Experiences ──────────────────────────────────────────────────────────────

/** Returns all work-experience entries for a given candidate. */
export async function getExperiences(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experiences).where(eq(experiences.candidateId, candidateId));
}

/**
 * Inserts a new work-experience entry and returns the updated list of experiences.
 * The candidateId is injected server-side so the client never needs to send it.
 */
export async function addExperience(candidateId: number, data: Omit<InsertExperience, "candidateId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(experiences).values({ ...data, candidateId });
  // Return the updated list so the client can reflect the change immediately.
  return getExperiences(candidateId);
}

/** Updates a single experience row identified by its primary key. */
export async function updateExperience(id: number, data: Partial<InsertExperience>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(experiences).set(data).where(eq(experiences.id, id));
}

/** Deletes a single experience row identified by its primary key. */
export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(experiences).where(eq(experiences.id, id));
}

// ─── Educations ───────────────────────────────────────────────────────────────

/** Returns all education entries for a given candidate. */
export async function getEducations(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(educations).where(eq(educations.candidateId, candidateId));
}

/**
 * Inserts a new education entry and returns the updated list.
 */
export async function addEducation(candidateId: number, data: Omit<InsertEducation, "candidateId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(educations).values({ ...data, candidateId });
  return getEducations(candidateId);
}

/** Updates a single education row identified by its primary key. */
export async function updateEducation(id: number, data: Partial<InsertEducation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(educations).set(data).where(eq(educations.id, id));
}

/** Deletes a single education row identified by its primary key. */
export async function deleteEducation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(educations).where(eq(educations.id, id));
}

// ─── Skills ───────────────────────────────────────────────────────────────────

/** Returns all skill entries for a given candidate. */
export async function getSkills(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skills).where(eq(skills.candidateId, candidateId));
}

/**
 * Inserts a new skill and returns the updated list.
 */
export async function addSkill(candidateId: number, data: Omit<InsertSkill, "candidateId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skills).values({ ...data, candidateId });
  return getSkills(candidateId);
}

/** Updates a single skill row identified by its primary key. */
export async function updateSkill(id: number, data: Partial<InsertSkill>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(skills).set(data).where(eq(skills.id, id));
}

/** Deletes a single skill row identified by its primary key. */
export async function deleteSkill(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(skills).where(eq(skills.id, id));
}

// ─── Search Preferences ───────────────────────────────────────────────────────

/**
 * Returns the search-preference row for a candidate, or null if none exists yet.
 * Each candidate has at most one preferences row (1-to-1 relationship).
 */
export async function getSearchPreferences(candidateId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(searchPreferences)
    .where(eq(searchPreferences.candidateId, candidateId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Creates or replaces the search-preference row for a candidate.
 * Salary values are stored as strings (TEXT column) so numeric inputs
 * are coerced before writing.
 */
export async function upsertSearchPreferences(
  candidateId: number,
  data: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSearchPreferences(candidateId);
  // Normalise the incoming data: convert numeric salaries to strings.
  const convertedData: any = {
    preferredSectors: data.preferredSectors,
    preferredLocations: data.preferredLocations,
    preferredContractTypes: data.preferredContractTypes,
    minSalary: data.minSalary ? String(data.minSalary) : null,
    maxSalary: data.maxSalary ? String(data.maxSalary) : null,
    experienceLevelMin: data.experienceLevelMin,
  };
  if (existing) {
    // Preference row exists → update in place.
    await db
      .update(searchPreferences)
      .set(convertedData)
      .where(eq(searchPreferences.candidateId, candidateId));
  } else {
    // No preference row yet → create a new one.
    await db.insert(searchPreferences).values({ ...convertedData, candidateId });
  }

  // Return the persisted preferences after the write.
  return getSearchPreferences(candidateId);
}
