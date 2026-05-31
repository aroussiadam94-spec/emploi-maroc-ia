export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  // GitHub OAuth (used as a direct fallback when OAUTH_SERVER_URL is not set)
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  // Optional explicit callback URL to register with GitHub (e.g. https://example.pages.dev/api/oauth/callback)
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL ?? "",
  // Google OAuth (preferred fallback)
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Optional explicit callback URL to register with Google
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
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
