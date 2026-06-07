/**
 * shared/types.ts
 * Central re-export point for types used across client and server.
 * Import all shared types from this single entry point rather than
 * reaching into drizzle/schema or _core/errors directly.
 */

// Re-export all Drizzle ORM inferred types (Select/Insert row shapes).
export type * from "../drizzle/schema";
// Re-export custom application error classes and error-code constants.
export * from "./_core/errors";
