// tRPC client factory – used to create the typed API client below.
import { trpc } from "@/lib/trpc";
// Shared constant for the error message sent when the user is not authenticated.
import { UNAUTHED_ERR_MSG } from '@shared/const';
// React Query – handles server-state caching, loading, and error states.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// tRPC HTTP batch link bundles multiple queries into a single HTTP request.
import { httpBatchLink, TRPCClientError } from "@trpc/client";
// React DOM entry point.
import { createRoot } from "react-dom/client";
// SuperJSON handles complex types (Date, Map, etc.) in tRPC serialisation.
import superjson from "superjson";
import App from "./App";
// Helper that builds the OAuth login redirect URL at runtime.
import { getLoginUrl } from "./const";
// Global styles including the design-system tokens and Tailwind utilities.
import "./index.css";

// Shared React Query client – manages the global server-state cache.
const queryClient = new QueryClient();

// Checks whether a tRPC error indicates the user is not authenticated.
// If so, redirects the browser to the configured OAuth login page.
const redirectToLoginIfUnauthorized = (error: unknown) => {
  // Only handle tRPC errors; ignore generic JS errors.
  if (!(error instanceof TRPCClientError)) return;
  // Avoid running in SSR environments where window is unavailable.
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Hard redirect to the OAuth login flow.
  window.location.href = getLoginUrl();
};

// Subscribe to the React Query cache to intercept failed query results.
// This catches errors from any useQuery() call that reaches an "error" state.
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    // Redirect if 401, otherwise just log for debugging.
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

// Subscribe to the React Query mutation cache to intercept failed mutations.
// This catches errors from any useMutation() call that reaches an "error" state.
queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// Configure the tRPC client:
// - In production, VITE_API_URL points to the deployed Express backend.
// - In local dev, the Vite proxy forwards /api → localhost:3000.
// - Uses SuperJSON for serialisation so Date objects travel correctly.
// - Includes credentials (session cookie) with every request.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/trpc`
  : "/api/trpc";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: API_BASE,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include", // Send the session cookie on cross-origin requests.
        });
      },
    }),
  ],
});

// Mount the React app into the #root div defined in index.html.
// The tRPC provider and React Query provider share the same queryClient
// so that cached query data is accessible through both APIs.
createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
