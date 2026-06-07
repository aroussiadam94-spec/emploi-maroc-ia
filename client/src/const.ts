// Re-export shared cookie/session constants so the client can import them
// from a single local path instead of reaching into the shared package directly.
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// The function inspects Vite environment variables to decide which OAuth
// provider to use (Google, GitHub, or a local mock for development).
export const getLoginUrl = () => {
  // The API base URL – defaults to the current origin in production.
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  // Optional external OAuth portal (e.g. Manus auth service).
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  
  if (!oauthPortalUrl) {
    // ── Google OAuth ──────────────────────────────────────────────────────────
    // If no external OAuth portal, prefer Google OAuth when client id is provided
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      // The backend callback URL that Google will redirect the browser to
      // after the user approves access.
      const redirectUri = `${apiUrl}/api/oauth/callback`;
      // Encode the redirect URI as the state parameter so the callback handler
      // can verify the request origin.
      const state = btoa(redirectUri);
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", googleClientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");        // Authorization code flow.
      url.searchParams.set("scope", "openid email profile"); // Minimal scopes needed.
      url.searchParams.set("state", state);
      url.searchParams.set("prompt", "select_account");     // Force account picker.
      console.log("[OAuth] login URL generated", {
        provider: "google",
        clientId: googleClientId,
        redirectUri,
        url: url.toString(),
      });
      return url.toString();
    }

    // ── GitHub OAuth ──────────────────────────────────────────────────────────
    // Fallback to GitHub if configured
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (githubClientId) {
      const redirectUri = `${apiUrl}/api/oauth/callback`;
      const state = btoa(redirectUri);
      const url = new URL("https://github.com/login/oauth/authorize");
      url.searchParams.set("client_id", githubClientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("scope", "read:user user:email"); // Read basic profile and email.
      return url.toString();
    }

    // ── Local dev mock login ───────────────────────────────────────────────────
    // When no OAuth provider is configured (local development), use a mock
    // login endpoint that auto-signs in as a test user.
    return `${apiUrl}/api/oauth/mock-login`;
  }

  // ── External OAuth portal (e.g. Manus) ────────────────────────────────────
  // When VITE_OAUTH_PORTAL_URL is set, delegate authentication to the portal.
  const appId = import.meta.env.VITE_APP_ID || "dev";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Build the portal sign-in URL with all required parameters.
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
