// The development sign-in gate reads config.devSignIn and tolerates a config
// without that section (mocked configs in other tests have none).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockConfig } = vi.hoisted(() => ({ mockConfig: { devSignIn: undefined as unknown } }));

vi.mock('../env.js', () => ({ config: mockConfig }));

import {
  DEV_SIGN_IN_ROLE_EMAILS,
  devSignInEmails,
  isDevSignInEnabled,
  isLoopbackAddress,
} from '../dev-sign-in.js';

describe('development sign-in gate', () => {
  beforeEach(() => {
    mockConfig.devSignIn = undefined;
  });

  it('is closed and lists no emails when config has no devSignIn section', () => {
    expect(isDevSignInEnabled()).toBe(false);
    expect(devSignInEmails()).toEqual([]);
  });

  it('is open only when config says so', () => {
    mockConfig.devSignIn = { enabled: true, emails: ['me@example.test'] };

    expect(isDevSignInEnabled()).toBe(true);
    expect(devSignInEmails()).toEqual(['me@example.test']);
  });

  it('stays closed when config says enabled is anything but true', () => {
    mockConfig.devSignIn = { enabled: 'true', emails: [] };

    expect(isDevSignInEnabled()).toBe(false);
  });

  it('offers one demo account per role', () => {
    expect(DEV_SIGN_IN_ROLE_EMAILS).toEqual([
      'superadmin@campusly.co.za',
      'admin@greenfieldprimary.co.za',
      'thandi.molefe@greenfieldprimary.co.za',
      'ayanda.zulu@greenfieldprimary.co.za',
      'lebo.mthembu@student.gfp.co.za',
      'pieter.botha@outlook.com',
      'lindiwe.dube@example.test',
    ]);
  });
});

describe('isLoopbackAddress', () => {
  it.each(['127.0.0.1', '::1', '::ffff:127.0.0.1'])('accepts %s', (address) => {
    expect(isLoopbackAddress(address)).toBe(true);
  });

  it.each([undefined, '', '10.0.0.5', '192.168.1.20', '::ffff:10.0.0.5', '127.0.0.1.evil', 'localhost'])(
    'refuses %s',
    (address) => {
      expect(isLoopbackAddress(address)).toBe(false);
    },
  );
});
