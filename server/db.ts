import { eq } from "drizzle-orm";
import path from "path";

type AnyDb = any;
let _db: AnyDb | null = null;
let _isSqlite = false;

function initSqliteTables(client: any) {
  return client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
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

export async function getDb(): Promise<AnyDb | null> {
  if (_db) return _db;

  const dbUrl = process.env.DATABASE_URL;
  const useSqlite = !dbUrl || dbUrl.startsWith("./") || dbUrl.endsWith(".db");

  if (useSqlite) {
    try {
      _isSqlite = true;
      const { createClient } = await import("@libsql/client");
      const { drizzle } = await import("drizzle-orm/libsql");

      const dbPath = path.resolve(process.cwd(), "local.db");
      const client = createClient({ url: `file:${dbPath}` });

      await initSqliteTables(client);
      _db = drizzle(client);

      console.log(`[Database] ✅ SQLite ready → ${dbPath}`);
      return _db;
    } catch (err) {
      console.error("[Database] SQLite init failed:", err);
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

export function isSqliteMode() { return _isSqlite; }

// ─── Generic SQL helper for raw queries ──────────────────────────────────────
async function sqliteRun(sql: string, params: any[] = []) {
  const db = await getDb();
  if (!db) return null;
  // Use drizzle's run for raw queries
  return db.run(sql, params);
}

// ─── User Queries ─────────────────────────────────────────────────────────────
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
      const { users } = await import("../drizzle/sqlite-schema");
      await db.insert(users).values({
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: (user.role as any) ?? "user",
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

// ─── Candidate Queries ────────────────────────────────────────────────────────
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

export async function createOrUpdateCandidate(userId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (_isSqlite) {
    const { candidates } = await import("../drizzle/sqlite-schema");
    const existing = await getCandidateByUserId(userId);
    if (existing) {
      await db.update(candidates).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(candidates.userId, userId));
    } else {
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
  return getCandidateByUserId(userId);
}

// ─── Job Offer Queries ────────────────────────────────────────────────────────
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

export async function toggleSavedJob(candidateId: number, jobOfferId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const isSaved = await checkSavedJob(candidateId, jobOfferId);

  if (_isSqlite) {
    const { savedJobs } = await import("../drizzle/sqlite-schema");
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
