import { and, like, gte, lte, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { jobOffers } from "../drizzle/schema";

export interface SearchFilters {
  query?: string;
  location?: string;
  sector?: string;
  contractType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  publishedAfter?: Date;
  limit?: number;
  offset?: number;
}

export async function searchJobs(filters: SearchFilters) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  // Text search
  if (filters.query) {
    const query = `%${filters.query}%`;
    conditions.push(
      like(jobOffers.title, query)
    );
  }

  // Location filter
  if (filters.location) {
    conditions.push(like(jobOffers.location, `%${filters.location}%`));
  }

  // Sector filter
  if (filters.sector) {
    conditions.push(eq(jobOffers.sector, filters.sector));
  }

  // Contract type filter
  if (filters.contractType) {
    conditions.push(eq(jobOffers.contractType, filters.contractType));
  }

  // Experience level filter
  if (filters.experienceLevel) {
    conditions.push(eq(jobOffers.experienceLevel, filters.experienceLevel));
  }

  // Salary range filter
  if (filters.salaryMin) {
    conditions.push(gte(jobOffers.salaryMax, filters.salaryMin.toString()));
  }
  if (filters.salaryMax) {
    conditions.push(lte(jobOffers.salaryMin, filters.salaryMax.toString()));
  }

  // Published date filter
  if (filters.publishedAfter) {
    conditions.push(gte(jobOffers.publishedDate, filters.publishedAfter));
  }

  let query: any = db.select().from(jobOffers);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  return await query.limit(limit).offset(offset);
}

export async function getJobOffersByIds(ids: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (ids.length === 0) return [];

  const query: any = db.select().from(jobOffers).where(inArray(jobOffers.id, ids));
  return await query;
}
