/**
 * server/_core/trpc.ts
 * tRPC initialisation and procedure factories for the Express server.
 *
 * Exports three procedure types that routers use to declare endpoints:
 *   publicProcedure    – available to any request (no auth required).
 *   protectedProcedure – requires a valid authenticated session; throws
 *                        UNAUTHORIZED (with UNAUTHED_ERR_MSG) otherwise.
 *   adminProcedure     – requires the user to have the "admin" role; throws
 *                        FORBIDDEN (with NOT_ADMIN_ERR_MSG) otherwise.
 *
 * SuperJSON is used as the transformer so complex types like Date objects
 * survive serialisation across the HTTP boundary.
 */

import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

// Initialise tRPC with the application request context and SuperJSON transformer.
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

// Base router factory – used to group related procedures into sub-routers.
export const router = t.router;

// Open procedure – no authentication check performed.
export const publicProcedure = t.procedure;

/**
 * Middleware that verifies a user is present in the request context.
 * If ctx.user is null (no valid session cookie) it throws a 401 error.
 * The narrowed context type guarantees that downstream handlers always
 * receive a non-null user.
 */
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // Narrow ctx.user from User | null to User for type safety in handlers.
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Authenticated procedure – any logged-in user may call these endpoints.
export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Admin-only procedure.
 * Checks that the authenticated user has role === "admin".
 * Throws 403 FORBIDDEN with NOT_ADMIN_ERR_MSG if the check fails.
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
