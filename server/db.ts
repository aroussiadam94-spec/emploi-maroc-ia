/**
 * server/db.ts
 * Database abstraction layer.
 *
 * Supports two backends depending on the DATABASE_URL environment variable:
 *   • SQLite / Turso  – used for local development and edge deployments.
 *   • MySQL           – used in traditional cloud/VPS production environments.
 *
 * A singleton pattern (module-level _db variable) ensures that the database
 * connection is initialised once and reused across all requests.
 */

import { eq } from "drizzle-orm";
import path from "path";

// Using `any` here so this module works with both the MySQL and SQLite
// Drizzle driver types without requiring two separate type declarations.
type AnyDb = any;
// Singleton database connection – null until getDb() is first called.
let _db: AnyDb | null = null;
// Flag that tracks which database dialect is active.
// true  → libSQL/SQLite (local or Turso cloud)
// false → MySQL
let _isSqlite = false;

/**
 * Creates all application tables inside a freshly connected SQLite database.
 * Uses CREATE TABLE IF NOT EXISTS so subsequent calls are safe no-ops.
 */
function initSqliteTables(client: any) {
  return client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      password TEXT,
      name TEXT,
      email TEXT,
      loginMethod TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      phone TEXT,
      location TEXT,
      bio TEXT,
      cvUrl TEXT,
      cvFileName TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      jobTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT,
      startDate TEXT,
      endDate TEXT,
      isCurrent INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS educations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      school TEXT NOT NULL,
      degree TEXT NOT NULL,
      fieldOfStudy TEXT,
      description TEXT,
      startDate TEXT,
      endDate TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      name TEXT NOT NULL,
      level TEXT DEFAULT 'intermediate',
      category TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS searchPreferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      preferredSectors TEXT,
      preferredLocations TEXT,
      preferredContractTypes TEXT,
      minSalary TEXT,
      maxSalary TEXT,
      experienceLevelMin TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS jobOffers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      externalId TEXT UNIQUE,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT,
      requirements TEXT,
      location TEXT,
      sector TEXT,
      contractType TEXT,
      experienceLevel TEXT,
      salaryMin TEXT,
      salaryMax TEXT,
      currency TEXT DEFAULT 'MAD',
      publishedDate TEXT,
      expiryDate TEXT,
      sourceUrl TEXT,
      companyLogoUrl TEXT,
      skills TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      jobOfferId INTEGER NOT NULL,
      status TEXT DEFAULT 'applied',
      appliedDate TEXT NOT NULL DEFAULT (datetime('now')),
      matchingScore REAL,
      matchingExplanation TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS savedJobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      jobOfferId INTEGER NOT NULL,
      savedDate TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS jobAlerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidateId INTEGER NOT NULL,
      name TEXT NOT NULL,
      keywords TEXT,
      sectors TEXT,
      locations TEXT,
      contractTypes TEXT,
      minMatchingScore REAL DEFAULT 50,
      isActive INTEGER DEFAULT 1,
      notificationFrequency TEXT DEFAULT 'daily',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/**
 * Returns the singleton database connection, initialising it on the first call.
 *
 * Decision tree:
 *  1. DATABASE_URL starts with "libsql://" or "https://" → Turso cloud SQLite.
 *  2. DATABASE_URL is a local file path (ends in ".db" or starts with "./") → local SQLite.
 *  3. No DATABASE_URL → local SQLite at ./local.db.
 *  4. Any other DATABASE_URL → MySQL.
 */
export async function getDb(): Promise<AnyDb | null> {
  // Return the existing connection if already initialised.
  if (_db) return _db;

  const dbUrl = process.env.DATABASE_URL;
  // Detect Turso (remote libSQL) when the URL uses the libsql:// scheme or
  // when an auth token is present (Turso always requires one).
  const useTurso = dbUrl?.startsWith("libsql://") || dbUrl?.startsWith("https://") || !!process.env.DATABASE_AUTH_TOKEN;
  // Use SQLite for local files and Turso; fall back to MySQL otherwise.
  const useSqlite = useTurso || !dbUrl || dbUrl.startsWith("./") || dbUrl.endsWith(".db");

  if (useSqlite) {
    try {
      _isSqlite = true;
      // Dynamic imports keep MySQL packages out of the bundle when using SQLite.
      const { createClient } = await import("@libsql/client");
      const { drizzle } = await import("drizzle-orm/libsql");

      let client;
      if (useTurso && dbUrl) {
        // Connect to Turso cloud SQLite using the provided URL and auth token.
        client = createClient({
          url: dbUrl,
          authToken: process.env.DATABASE_AUTH_TOKEN
        });
        console.log(`[Database] 🚀 Connecting to Turso SQLite Cloud...`);
      } else {
        // Fall back to a local SQLite file stored at the project root.
        const dbPath = path.resolve(process.cwd(), "local.db");
        client = createClient({ url: `file:${dbPath}` });
        console.log(`[Database] ✅ Local SQLite ready → ${dbPath}`);
      }

      // Ensure all tables exist before returning the connection.
      await initSqliteTables(client);
      
      // Migration: add password column if it doesn't exist
      try {
        await client.execute('ALTER TABLE users ADD COLUMN password TEXT;');
        console.log('[Database] Migrated users table: added password column');
      } catch (err: any) {
        // Ignored, column likely already exists
      }

      _db = drizzle(client);

      if (useTurso) console.log(`[Database] ✅ Turso connected successfully!`);
      return _db;
    } catch (err) {
      console.error("[Database] SQLite/Turso init failed:", err);
      _db = null;
      return null;
    }
  }

  // MySQL fallback for production
  try {
    _isSqlite = false;
    const { drizzle } = await import("drizzle-orm/mysql2");
    _db = drizzle(dbUrl!);
    console.log("[Database] ✅ MySQL connected");
    return _db;
  } catch (error) {
    console.warn("[Database] MySQL connection failed:", error);
    _db = null;
    return null;
  }
}

/** Returns true when the active database is SQLite (local or Turso). */
export function isSqliteMode() { return _isSqlite; }

// ─── Generic SQL helper for raw queries ──────────────────────────────────────
/** Executes a raw SQL statement with optional positional parameters.
 *  Intended for operations that cannot be expressed with Drizzle's query builder. */
async function sqliteRun(sql: string, params: any[] = []) {
  const db = await getDb();
  if (!db) return null;
  // Use drizzle's run for raw queries
  return db.run(sql, params);
}

// ─── User Queries ─────────────────────────────────────────────────────────────
/**
 * Creates a new user record or updates an existing one identified by openId.
 * Called after every successful OAuth login to keep the profile current.
 */
export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string;
  lastSignedIn?: Date;
}): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: DB not available"); return; }

  try {
    if (_isSqlite) {
      // SQLite uses onConflictDoUpdate (libSQL syntax) to upsert.
      const { users } = await import("../drizzle/sqlite-schema");
      await db.insert(users).values({
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: (user.role as any) ?? "user",
        // Store dates as ISO strings because SQLite has no native date type.
        lastSignedIn: (user.lastSignedIn ?? new Date()).toISOString(),
      }).onConflictDoUpdate({
        target: users.openId,
        set: {
          name: user.name ?? null,
          email: user.email ?? null,
          lastSignedIn: (user.lastSignedIn ?? new Date()).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // MySQL uses onDuplicateKeyUpdate (MySQL-specific syntax) to upsert.
      const { users } = await import("../drizzle/schema");
      await db.insert(users).values({
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: (user.role as any) ?? "user",
        lastSignedIn: user.lastSignedIn ?? new Date(),
      }).onDuplicateKeyUpdate({
        set: { name: user.name ?? null, email: user.email ?? null, lastSignedIn: new Date() },
      });
    }
  } catch (err) {
    console.error("[Database] Failed to upsert user:", err);
  }
}

/** Fetches a single user record by their OAuth subject identifier (openId). */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  if (_isSqlite) {
    const { users } = await import("../drizzle/sqlite-schema");
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  } else {
    const { users } = await import("../drizzle/schema");
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  }
}

/** Fetches a single user record by their email address. */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  if (_isSqlite) {
    const { users } = await import("../drizzle/sqlite-schema");
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  } else {
    const { users } = await import("../drizzle/schema");
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
}

/** Creates a local user with email, password and name */
export async function createLocalUser(user: {
  openId: string;
  name: string;
  email: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const signedInAt = new Date();

  if (_isSqlite) {
    const { users } = await import("../drizzle/sqlite-schema");
    await db.insert(users).values({
      openId: user.openId,
      password: user.passwordHash,
      name: user.name,
      email: user.email,
      loginMethod: "local",
      lastSignedIn: signedInAt.toISOString(),
    });
  } else {
    const { users } = await import("../drizzle/schema");
    await db.insert(users).values({
      openId: user.openId,
      password: user.passwordHash,
      name: user.name,
      email: user.email,
      loginMethod: "local",
      lastSignedIn: signedInAt,
    });
  }
}

// ─── Candidate Queries ────────────────────────────────────────────────────────
/** Returns the candidate profile linked to a given user ID, or undefined if none exists. */
export async function getCandidateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  if (_isSqlite) {
    const { candidates } = await import("../drizzle/sqlite-schema");
    const result = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);
    return result[0];
  } else {
    const { candidates } = await import("../drizzle/schema");
    const result = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);
    return result[0];
  }
}

/**
 * Creates a new candidate row if one does not yet exist for the user,
 * or patches the existing row with the provided data.
 * Returns the updated candidate record.
 */
export async function createOrUpdateCandidate(userId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (_isSqlite) {
    const { candidates } = await import("../drizzle/sqlite-schema");
    const existing = await getCandidateByUserId(userId);
    if (existing) {
      // Update: merge data and stamp updatedAt with the current time.
      await db.update(candidates).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(candidates.userId, userId));
    } else {
      // Insert: create a fresh candidate linked to this user.
      await db.insert(candidates).values({ userId, ...data });
    }
  } else {
    const { candidates } = await import("../drizzle/schema");
    const existing = await getCandidateByUserId(userId);
    if (existing) {
      await db.update(candidates).set(data).where(eq(candidates.userId, userId));
    } else {
      await db.insert(candidates).values({ userId, ...data });
    }
  }
  // Return the fresh record after the write.
  return getCandidateByUserId(userId);
}

// ─── Job Offer Queries ────────────────────────────────────────────────────────
/**
 * Returns a paginated list of job offers ordered by insertion date.
 * @param limit  Maximum number of rows to return (default 50).
 * @param offset Number of rows to skip for pagination.
 */
export async function getJobOffers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  if (_isSqlite) {
    const { jobOffers } = await import("../drizzle/sqlite-schema");
    return db.select().from(jobOffers).limit(limit).offset(offset);
  } else {
    const { jobOffers } = await import("../drizzle/schema");
    return db.select().from(jobOffers).limit(limit).offset(offset);
  }
}

/** Returns a single job offer by its primary key, or undefined if not found. */
export async function getJobOfferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  if (_isSqlite) {
    const { jobOffers } = await import("../drizzle/sqlite-schema");
    const result = await db.select().from(jobOffers).where(eq(jobOffers.id, id)).limit(1);
    return result[0];
  } else {
    const { jobOffers } = await import("../drizzle/schema");
    const result = await db.select().from(jobOffers).where(eq(jobOffers.id, id)).limit(1);
    return result[0];
  }
}

// ─── Application Queries ──────────────────────────────────────────────────────
/**
 * Records a new job application for a candidate.
 * Optionally stores an AI-computed matching score and explanation.
 */
export async function createApplication(candidateId: number, jobOfferId: number, matchingScore?: number, matchingExplanation?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (_isSqlite) {
    const { applications } = await import("../drizzle/sqlite-schema");
    const result = await db.insert(applications).values({
      candidateId,
      jobOfferId,
      status: "applied",
      matchingScore: matchingScore ?? null,
      matchingExplanation: matchingExplanation ?? null,
    });
    return result;
  } else {
    const { applications } = await import("../drizzle/schema");
    const result = await db.insert(applications).values({
      candidateId,
      jobOfferId,
      status: "applied",
      matchingScore: matchingScore ?? null,
      matchingExplanation: matchingExplanation ?? null,
    });
    return result;
  }
}

/** Returns true if the candidate has already applied to this job offer. */
export async function checkApplication(candidateId: number, jobOfferId: number) {
  const db = await getDb();
  if (!db) return false;

  if (_isSqlite) {
    const { applications } = await import("../drizzle/sqlite-schema");
    const { and } = await import("drizzle-orm");
    const result = await db.select().from(applications).where(
      and(eq(applications.candidateId, candidateId), eq(applications.jobOfferId, jobOfferId))
    ).limit(1);
    return result.length > 0;
  } else {
    const { applications } = await import("../drizzle/schema");
    const { and } = await import("drizzle-orm");
    const result = await db.select().from(applications).where(
      and(eq(applications.candidateId, candidateId), eq(applications.jobOfferId, jobOfferId))
    ).limit(1);
    return result.length > 0;
  }
}

/**
 * Toggles the saved state for a job offer.
 * If the job is already saved it is removed; otherwise a new saved row is inserted.
 * Returns { saved: boolean } indicating the resulting state.
 */
export async function toggleSavedJob(candidateId: number, jobOfferId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check the current state before deciding insert vs delete.
  const isSaved = await checkSavedJob(candidateId, jobOfferId);

  if (_isSqlite) {
    const { savedJobs } = await import("../drizzle/sqlite-schema");
    const { and, eq } = await import("drizzle-orm");
    if (isSaved) {
      // Job is currently saved → remove it.
      await db.delete(savedJobs).where(
        and(eq(savedJobs.candidateId, candidateId), eq(savedJobs.jobOfferId, jobOfferId))
      );
      return { saved: false };
    } else {
      // Job is not saved → add it.
      await db.insert(savedJobs).values({ candidateId, jobOfferId });
      return { saved: true };
    }
  } else {
    const { savedJobs } = await import("../drizzle/schema");
    const { and, eq } = await import("drizzle-orm");
    if (isSaved) {
      await db.delete(savedJobs).where(
        and(eq(savedJobs.candidateId, candidateId), eq(savedJobs.jobOfferId, jobOfferId))
      );
      return { saved: false };
    } else {
      await db.insert(savedJobs).values({ candidateId, jobOfferId });
      return { saved: true };
    }
  }
}

/** Returns true if the candidate has saved this job offer. */
export async function checkSavedJob(candidateId: number, jobOfferId: number) {
  const db = await getDb();
  if (!db) return false;

  if (_isSqlite) {
    const { savedJobs } = await import("../drizzle/sqlite-schema");
    const { and, eq } = await import("drizzle-orm");
    const result = await db.select().from(savedJobs).where(
      and(eq(savedJobs.candidateId, candidateId), eq(savedJobs.jobOfferId, jobOfferId))
    ).limit(1);
    return result.length > 0;
  } else {
    const { savedJobs } = await import("../drizzle/schema");
    const { and, eq } = await import("drizzle-orm");
    const result = await db.select().from(savedJobs).where(
      and(eq(savedJobs.candidateId, candidateId), eq(savedJobs.jobOfferId, jobOfferId))
    ).limit(1);
    return result.length > 0;
  }
}

/**
 * Returns all job offers that the candidate has bookmarked.
 * Performs an inner join between savedJobs and jobOffers to return full job data.
 */
export async function getSavedJobs(candidateId: number) {
  const db = await getDb();
  if (!db) return [];

  if (_isSqlite) {
    const { savedJobs, jobOffers } = await import("../drizzle/sqlite-schema");
    const { eq } = await import("drizzle-orm");
    const results = await db
      .select({ job: jobOffers })
      .from(savedJobs)
      .innerJoin(jobOffers, eq(savedJobs.jobOfferId, jobOffers.id))
      .where(eq(savedJobs.candidateId, candidateId));
    return results.map(r => r.job);
  } else {
    const { savedJobs, jobOffers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const results = await db
      .select({ job: jobOffers })
      .from(savedJobs)
      .innerJoin(jobOffers, eq(savedJobs.jobOfferId, jobOffers.id))
      .where(eq(savedJobs.candidateId, candidateId));
    return results.map(r => r.job);
  }
}

/**
 * Returns all job offers the candidate has applied to.
 * Joins applications with jobOffers to return full job data.
 */
export async function getApplications(candidateId: number) {
  const db = await getDb();
  if (!db) return [];

  if (_isSqlite) {
    const { applications, jobOffers } = await import("../drizzle/sqlite-schema");
    const { eq } = await import("drizzle-orm");
    const results = await db
      .select({ job: jobOffers })
      .from(applications)
      .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
      .where(eq(applications.candidateId, candidateId));
    return results.map(r => r.job);
  } else {
    const { applications, jobOffers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const results = await db
      .select({ job: jobOffers })
      .from(applications)
      .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
      .where(eq(applications.candidateId, candidateId));
    return results.map(r => r.job);
  }
}

/**
 * Creates a new job alert for the candidate with optional keyword and filter criteria.
 * Alerts can later be evaluated against new job offers to notify the candidate.
 */
export async function createJobAlert(candidateId: number, data: { name: string; keywords?: string; sectors?: string; locations?: string; contractTypes?: string }) {
  const db = await getDb();
  if (!db) return null;

  if (_isSqlite) {
    const { jobAlerts } = await import("../drizzle/sqlite-schema");
    const result = await db.insert(jobAlerts).values({
      candidateId,
      name: data.name,
      keywords: data.keywords,
      sectors: data.sectors,
      locations: data.locations,
      contractTypes: data.contractTypes,
    }).returning();
    return result[0];
  } else {
    const { jobAlerts } = await import("../drizzle/schema");
    const result = await db.insert(jobAlerts).values({
      candidateId,
      name: data.name,
      keywords: data.keywords,
      sectors: data.sectors,
      locations: data.locations,
      contractTypes: data.contractTypes,
    }).returning();
    return result[0];
  }
}

/** Returns all active job alerts belonging to a candidate. */
export async function getJobAlerts(candidateId: number) {
  const db = await getDb();
  if (!db) return [];

  if (_isSqlite) {
    const { jobAlerts } = await import("../drizzle/sqlite-schema");
    const { eq } = await import("drizzle-orm");
    return db.select().from(jobAlerts).where(eq(jobAlerts.candidateId, candidateId));
  } else {
    const { jobAlerts } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    return db.select().from(jobAlerts).where(eq(jobAlerts.candidateId, candidateId));
  }
}

/**
 * Deletes a specific job alert.
 * The candidateId guard ensures a candidate can only delete their own alerts.
 */
export async function deleteJobAlert(candidateId: number, alertId: number) {
  const db = await getDb();
  if (!db) return false;

  const { and, eq } = await import("drizzle-orm");
  if (_isSqlite) {
    const { jobAlerts } = await import("../drizzle/sqlite-schema");
    await db.delete(jobAlerts).where(and(eq(jobAlerts.id, alertId), eq(jobAlerts.candidateId, candidateId)));
    return true;
  } else {
    const { jobAlerts } = await import("../drizzle/schema");
    await db.delete(jobAlerts).where(and(eq(jobAlerts.id, alertId), eq(jobAlerts.candidateId, candidateId)));
    return true;
  }
}
