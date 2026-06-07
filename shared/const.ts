/**
 * shared/const.ts
 * Application-wide constants shared between the server and the client.
 * Import from this file to avoid duplicating magic strings/numbers.
 */

/** Name of the HTTP-only session cookie stored in the browser. */
export const COOKIE_NAME = "app_session_id";

/** Duration of one year in milliseconds – used to set cookie max-age. */
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

/** Default timeout (ms) for Axios HTTP requests made by the server. */
export const AXIOS_TIMEOUT_MS = 30_000;

/** Error message returned by the API when the request has no valid session.
 *  The client intercepts this message to redirect the user to the login page. */
export const UNAUTHED_ERR_MSG = 'Please login (10001)';

/** Error message returned when the authenticated user lacks admin privileges. */
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
