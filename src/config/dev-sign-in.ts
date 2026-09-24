// Gate for the development-only one-click sign-in. It is open only when the
// backend runs with NODE_ENV=development and DEV_SIGN_IN=true; otherwise the
// routes are not mounted at all. Kept apart from env.ts so callers tolerate a
// mocked config in tests.
import { config } from './env.js';

/** One demo account per role, from the demo seed (npm run seed / seed:teacher-demo). */
export const DEV_SIGN_IN_ROLE_EMAILS: readonly string[] = [
  'superadmin@campusly.co.za',
  'admin@greenfieldprimary.co.za',
  'thandi.molefe@greenfieldprimary.co.za',
  'ayanda.zulu@greenfieldprimary.co.za',
  'lebo.mthembu@student.gfp.co.za',
  'pieter.botha@outlook.com',
  'lindiwe.dube@example.test',
];

const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/** A host name that can only mean this computer (Express gives IPv6 as "[::1]"). */
export const isLocalHostname = (hostname: string | undefined): boolean =>
  hostname !== undefined && LOCAL_HOSTNAMES.has(hostname.toLowerCase());

const isLocalUrl = (url: string): boolean => {
  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
};

/** No Origin (curl, a same-origin GET) is fine; a sent Origin must be a page on this computer. */
export const isLocalOrigin = (origin: string | undefined): boolean => origin === undefined || isLocalUrl(origin);

/**
 * Open only when config says so AND the app is set up for this computer alone: a server whose
 * APP_URL or CORS_ORIGIN points anywhere else is a shared one, and never gets a password bypass.
 */
export const isDevSignInEnabled = (): boolean => {
  if (config.devSignIn?.enabled !== true) return false;
  const urls = [config.app?.url, ...(config.cors?.origin ?? [])].filter((u): u is string => typeof u === 'string');
  return urls.every(isLocalUrl);
};

/** The developer's own accounts (DEV_SIGN_IN_EMAILS), offered above the role accounts. */
export const devSignInEmails = (): readonly string[] => config.devSignIn?.emails ?? [];

/** True only for this computer. Takes the socket address, never X-Forwarded-For. */
export const isLoopbackAddress = (address: string | undefined): boolean =>
  address !== undefined && LOOPBACK_ADDRESSES.has(address);
