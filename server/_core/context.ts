/**
 * server/_core/context.ts
 * Builds the tRPC request context that is available to every procedure handler.
 *
 * The context object contains:
 *   req  – the raw Express Request (needed to read cookies, headers, etc.).
 *   res  – the raw Express Response (needed to set/clear cookies on logout).
 *   user – the authenticated User row from the database, or null for public requests.
 *
 * Authentication flow:
 *   sdk.authenticateRequest() reads the session cookie, verifies it, and looks
 *   up the corresponding User record. If authentication fails for any reason
 *   (missing cookie, expired token, unknown user) user is set to null and the
 *   request continues as anonymous (publicProcedures) or is rejected downstream
 *   by the requireUser middleware (protectedProcedures).
 *
 * Local development shortcut:
 *   When NODE_ENV !== "production" and no cookie is present, a mock admin user
 *   is injected automatically so every endpoint is accessible without logging in.
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

// Type of the context object passed to every tRPC procedure.
export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null; // null for unauthenticated requests.
};

/**
 * Factory function called by the tRPC Express adapter for each incoming request.
 * Returns the context object that procedures receive as `ctx`.
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Attempt to resolve the session cookie to a User record.
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // Any error (invalid token, DB miss) is silenced here; the procedure
    // middleware handles the rejection for protected routes.
    user = null;
  }

  // MOCK FOR LOCAL DEV
  // Automatically sign in as an admin user in non-production environments
  // when no real session is present. This avoids the need to run the full
  // OAuth flow during local development.
  if (process.env.NODE_ENV !== "production" && !user) {
    user = {
      id: 1,
      openId: "local-dev",
      name: "Local Dev User",
      email: "dev@local",
      loginMethod: "mock",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date()
    } as User;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
