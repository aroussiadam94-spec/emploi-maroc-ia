import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[OAuth] Callback failed:", errorMsg);
      console.error("[OAuth] Code:", code?.substring(0, 20) + "...");
      console.error("[OAuth] State:", state?.substring(0, 20) + "...");
      res.status(500).json({ error: "OAuth callback failed", detail: errorMsg });
    }
  });
  app.get("/api/oauth/mock-login", async (req: Request, res: Response) => {
    // Only allow mock login if no OAuth portal is configured
    if (process.env.VITE_OAUTH_PORTAL_URL) {
      res.status(403).json({ error: "Mock login is disabled when VITE_OAUTH_PORTAL_URL is set." });
      return;
    }

    try {
      const openId = "mock_local_dev_user_123";
      
      await db.upsertUser({
        openId: openId,
        name: "Local Dev User",
        email: "dev@local",
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Local Dev User",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Mock login failed", error);
      res.status(500).json({ error: "Mock login failed" });
    }
  });
}
