/**
 * server/_core/env.ts
 * Centralised access point for all server-side environment variables.
 *
 * Reading env vars through this object instead of calling process.env directly:
 *   • Provides a single place to audit which variables the server depends on.
 *   • Gives TypeScript a consistent string type (no undefined) via the ?? "" fallback.
 *   • Makes it easy to stub values in tests.
 *
 * Variables are logged at startup (presence only, never their values)
 * so misconfiguration is caught immediately in server logs.
 */

export const ENV = {
  /** Application identifier used by the external OAuth portal. */
  appId: process.env.APP_ID ?? process.env.VITE_APP_ID ?? "local",

  /** Secret used to sign JWT session tokens. Must be kept private. */
  cookieSecret: process.env.JWT_SECRET ?? "",

  /** Database connection string (libsql://, file path, or MySQL URL). */
  databaseUrl: process.env.DATABASE_URL ?? "",

  /** Base URL of the external OAuth portal (e.g. Manus auth service). */
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",

  // GitHub OAuth (used as a direct fallback when OAUTH_SERVER_URL is not set)
  /** GitHub OAuth application client ID. */
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  /** GitHub OAuth application client secret. Must be kept private. */
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  /** Optional explicit callback URL to register with GitHub (e.g. https://example.pages.dev/api/oauth/callback) */
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL ?? "",

  // Google OAuth (preferred fallback)
  /** Google OAuth application client ID. */
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  /** Google OAuth application client secret. Must be kept private. */
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  /** Optional explicit callback URL to register with Google. */
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "",

  /** The openId of the application owner used for seeding admin privileges. */
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",

  /** True when running in the production Node.js environment. */
  isProduction: process.env.NODE_ENV === "production",

  /** Base URL of the Forge cloud service (used for file storage and maps proxy). */
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",

  /** API key for authenticating with the Forge service. Must be kept private. */
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

// Log presence of critical OAuth env vars (do not print secrets)
console.log('[ENV] GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
console.log('[ENV] GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('[ENV] GOOGLE_CALLBACK_URL set:', !!process.env.GOOGLE_CALLBACK_URL);
console.log('[ENV] GITHUB_CLIENT_ID set:', !!process.env.GITHUB_CLIENT_ID);
console.log('[ENV] GITHUB_CLIENT_SECRET set:', !!process.env.GITHUB_CLIENT_SECRET);
console.log('[ENV] OAUTH_SERVER_URL set:', !!process.env.OAUTH_SERVER_URL);
console.log('[ENV] NODE_ENV:', process.env.NODE_ENV ?? '');
console.log('[ENV] APP_ID:', process.env.APP_ID ?? process.env.VITE_APP_ID ?? '(defaulting to "local")');
