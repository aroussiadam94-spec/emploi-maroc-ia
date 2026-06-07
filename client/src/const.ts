// Re-export shared cookie/session constants so the client can import them
// from a single local path instead of reaching into the shared package directly.
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// The function inspects Vite environment variables to decide which OAuth
// provider to use (Google, GitHub, or a local mock for development).
export const getLoginUrl = () => "/login";

export const getGoogleAuthUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) return null;

  const redirectUri = `${apiUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
};

export const getGithubAuthUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  if (!githubClientId) return null;

  const redirectUri = `${apiUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", githubClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "read:user user:email");
  return url.toString();
};

export const getMockAuthUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${apiUrl}/api/oauth/mock-login`;
};

export const getExternalAuthUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  if (!oauthPortalUrl) return null;

  const appId = import.meta.env.VITE_APP_ID || "dev";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
