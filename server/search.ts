// Import query builder helpers from drizzle-orm and local database/schema modules.
import { and, like, gte, lte, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { jobOffers } from "../drizzle/schema";

// Defines the available filters for searching job offers.
// All fields are optional so callers can apply only the filters they need.
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

// Performs a search on the jobOffers table using the provided filter values.
export async function searchJobs(filters: SearchFilters) {
  // Get a database connection. If unavailable, return an empty result set.
  const db = await getDb();
  if (!db) return [];

  // Collect SQL conditions for the query dynamically.
  const conditions = [];

  // Add full text search on the job title if query text is provided.
  if (filters.query) {
    const query = `%${filters.query}%`;
    conditions.push(
      like(jobOffers.title, query)
    );
  }

  // Add a partial match filter for the location field.
  if (filters.location) {
    conditions.push(like(jobOffers.location, `%${filters.location}%`));
  }

  // Add an exact match filter for the sector field.
  if (filters.sector) {
    conditions.push(eq(jobOffers.sector, filters.sector));
  }

  // Add an exact match filter for contract type.
  if (filters.contractType) {
    conditions.push(eq(jobOffers.contractType, filters.contractType));
  }

  // Add an exact match filter for experience level.
  if (filters.experienceLevel) {
    conditions.push(eq(jobOffers.experienceLevel, filters.experienceLevel));
  }

  // Add salary range filters when minimum or maximum values are provided.
  if (filters.salaryMin) {
    conditions.push(gte(jobOffers.salaryMax, filters.salaryMin.toString()));
  }
  if (filters.salaryMax) {
    conditions.push(lte(jobOffers.salaryMin, filters.salaryMax.toString()));
  }

  // Add a filter to only return job offers published after a specific date.
  if (filters.publishedAfter) {
    conditions.push(gte(jobOffers.publishedDate, filters.publishedAfter));
  }

  // Build the base SELECT query for jobOffers.
  let query: any = db.select().from(jobOffers);
  // If any filter conditions exist, combine them with AND and apply to the query.
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply pagination defaults if limit/offset are not provided.
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  // Execute the query and return the matched job offers.
  return await query.limit(limit).offset(offset);
}

// Fetches job offers by an explicit list of IDs.
export async function getJobOffersByIds(ids: number[]) {
  // Get a database connection and handle missing DB or empty ID lists.
  const db = await getDb();
  if (!db) return [];
  if (ids.length === 0) return [];

  // Query the jobOffers table for rows whose id is in the provided list.
  const query: any = db.select().from(jobOffers).where(inArray(jobOffers.id, ids));
  return await query;
}
