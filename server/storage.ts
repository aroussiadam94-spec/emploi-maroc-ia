/**
 * server/storage.ts
 * Cloud file-storage helpers built on top of the Forge Server presigned-URL API.
 *
 * Upload flow (storagePut):
 *   1. Ask Forge for a short-lived presigned PUT URL pointing to S3.
 *   2. Upload the file bytes directly to S3 using that URL (no Forge proxy for the data).
 *   3. Return the canonical path under /manus-storage/<key> for serving.
 *
 * Download flow (storageGet / storageGetSignedUrl):
 *   - storageGet returns the relative URL path served via 307 redirect by the backend.
 *   - storageGetSignedUrl asks Forge for a presigned GET URL for direct S3 access.
 *
 * Required environment variables:
 *   BUILT_IN_FORGE_API_URL – base URL of the Forge server (e.g. https://forge.example.com)
 *   BUILT_IN_FORGE_API_KEY – API key for authenticating with Forge
 */

// Preconfigured storage helpers for Manus WebDev templates
// Uploads via Forge Server presigned URL to S3 (PUT direct).
// Downloads return /manus-storage/{key} paths served via 307 redirect.

import { ENV } from "./_core/env";

/**
 * Reads and validates the Forge storage credentials from the environment.
 * Throws a descriptive error if either variable is missing so misconfigurations
 * are caught at call-time rather than silently failing.
 */
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  // Strip trailing slashes from the URL so concatenation is predictable.
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

/** Strips any leading slashes from a relative storage key. */
function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Appends an 8-character random hex suffix before the file extension.
 * This prevents accidental overwrites when the same filename is uploaded twice
 * and avoids predictable public URLs.
 * Example: "cvs/42/resume.pdf" → "cvs/42/resume_a1b2c3d4.pdf"
 */
function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/**
 * Uploads a file to S3 via a Forge presigned PUT URL.
 *
 * @param relKey      Relative storage path, e.g. "cvs/userId/resume.pdf".
 * @param data        File contents as a Buffer, Uint8Array, or string.
 * @param contentType MIME type of the file (default: application/octet-stream).
 * @returns           The storage key with hash suffix and the canonical URL path.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const { forgeUrl, forgeKey } = getForgeConfig();
  // Generate a unique key to avoid collisions.
  const key = appendHashSuffix(normalizeKey(relKey));

  // 1. Get presigned PUT URL from Forge
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  // 2. PUT file directly to S3 using the presigned URL.
  //    No Forge proxy here – the data goes straight to S3 for efficiency.
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });

  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  // Return the key (with hash) and a path the backend can serve via redirect.
  return { key, url: `/manus-storage/${key}` };
}

/**
 * Returns the canonical URL path for a stored file without making any network call.
 * The path is served by the backend as a 307 redirect to a presigned S3 GET URL.
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

/**
 * Asks Forge for a short-lived presigned GET URL that grants direct S3 access.
 * Use this when you need a URL that works outside the application's domain
 * (e.g. for email attachments or file preview links).
 */
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);

  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);

  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }

  const { url } = (await resp.json()) as { url: string };
  return url;
}
