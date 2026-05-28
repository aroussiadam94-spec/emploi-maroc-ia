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

// Experiences
export async function getExperiences(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experiences).where(eq(experiences.candidateId, candidateId));
}

export async function addExperience(candidateId: number, data: Omit<InsertExperience, "candidateId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(experiences).values({ ...data, candidateId });
  return getExperiences(candidateId);
}

export async function updateExperience(id: number, data: Partial<InsertExperience>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(experiences).set(data).where(eq(experiences.id, id));
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(experiences).where(eq(experiences.id, id));
}

// Educations
export async function getEducations(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(educations).where(eq(educations.candidateId, candidateId));
}

export async function addEducation(candidateId: number, data: Omit<InsertEducation, "candidateId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(educations).values({ ...data, candidateId });
  return getEducations(candidateId);
}

export async function updateEducation(id: number, data: Partial<InsertEducation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(educations).set(data).where(eq(educations.id, id));
}

export async function deleteEducation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(educations).where(eq(educations.id, id));
}

// Skills
export async function getSkills(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skills).where(eq(skills.candidateId, candidateId));
}

export async function addSkill(candidateId: number, data: Omit<InsertSkill, "candidateId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skills).values({ ...data, candidateId });
  return getSkills(candidateId);
}

export async function updateSkill(id: number, data: Partial<InsertSkill>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(skills).set(data).where(eq(skills.id, id));
}

export async function deleteSkill(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(skills).where(eq(skills.id, id));
}

// Search Preferences
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

export async function upsertSearchPreferences(
  candidateId: number,
  data: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSearchPreferences(candidateId);
  const convertedData: any = {
    preferredSectors: data.preferredSectors,
    preferredLocations: data.preferredLocations,
    preferredContractTypes: data.preferredContractTypes,
    minSalary: data.minSalary ? String(data.minSalary) : null,
    maxSalary: data.maxSalary ? String(data.maxSalary) : null,
    experienceLevelMin: data.experienceLevelMin,
  };
  if (existing) {
    await db
      .update(searchPreferences)
      .set(convertedData)
      .where(eq(searchPreferences.candidateId, candidateId));
  } else {
    await db.insert(searchPreferences).values({ ...convertedData, candidateId });
  }

  return getSearchPreferences(candidateId);
}
