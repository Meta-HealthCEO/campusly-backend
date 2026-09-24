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

export const isDevSignInEnabled = (): boolean => config.devSignIn?.enabled === true;

/** The developer's own accounts (DEV_SIGN_IN_EMAILS), offered above the role accounts. */
export const devSignInEmails = (): readonly string[] => config.devSignIn?.emails ?? [];

/** True only for this computer. Takes the socket address, never X-Forwarded-For. */
export const isLoopbackAddress = (address: string | undefined): boolean =>
  address !== undefined && LOOPBACK_ADDRESSES.has(address);
