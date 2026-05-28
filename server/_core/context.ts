import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // MOCK FOR LOCAL DEV
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
