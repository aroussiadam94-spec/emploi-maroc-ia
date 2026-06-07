/**
 * lib/trpc.ts
 * Creates the type-safe tRPC React client using the AppRouter type
 * exported from the server. This single export is used throughout the
 * client to call API procedures with full TypeScript inference.
 *
 * Usage example:
 *   const { data } = trpc.jobs.search.useQuery({ query: "React" });
 *   const mutation = trpc.candidate.updateProfile.useMutation();
 */

import { createTRPCReact } from "@trpc/react-query";
// Import only the type (not the implementation) to avoid bundling server code.
import type { AppRouter } from "../../../server/routers";

// A fully typed tRPC React client. All procedure hooks are inferred from AppRouter.
export const trpc = createTRPCReact<AppRouter>();
