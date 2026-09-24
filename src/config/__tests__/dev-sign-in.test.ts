// The development sign-in gate reads config.devSignIn and tolerates a config
// without that section (mocked configs in other tests have none).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockConfig } = vi.hoisted(() => ({ mockConfig: { devSignIn: undefined as unknown, app: undefined as unknown, cors: undefined as unknown } }));

vi.mock('../env.js', () => ({ config: mockConfig }));

import {
  DEV_SIGN_IN_ROLE_EMAILS,
  devSignInEmails,
  isDevSignInEnabled,
  isLocalHostname,
  isLocalOrigin,
  isLoopbackAddress,
} from '../dev-sign-in.js';

describe('development sign-in gate', () => {
  beforeEach(() => {
    mockConfig.devSignIn = undefined;
    mockConfig.app = undefined;
    mockConfig.cors = undefined;
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

describe('the gate on a server set up for somewhere else', () => {
  it('stays closed when the app or the allowed origins point beyond this computer', () => {
    mockConfig.devSignIn = { enabled: true, emails: [] };
    mockConfig.app = { url: 'http://localhost:3500' };
    mockConfig.cors = { origin: ['http://localhost:3500'] };
    expect(isDevSignInEnabled()).toBe(true);

    mockConfig.cors = { origin: ['http://localhost:3500', 'https://app.campusly.co.za'] };
    expect(isDevSignInEnabled()).toBe(false);

    mockConfig.cors = { origin: ['http://localhost:3500'] };
    mockConfig.app = { url: 'https://staging.campusly.co.za' };
    expect(isDevSignInEnabled()).toBe(false);
  });
});

describe('isLocalHostname and isLocalOrigin', () => {
  it.each(['localhost', '127.0.0.1', '[::1]', 'LOCALHOST'])('accepts host %s', (h) => {
    expect(isLocalHostname(h)).toBe(true);
  });

  it.each([undefined, '', 'attacker.example', 'localhost.attacker.example', '10.0.0.5'])('refuses host %s', (h) => {
    expect(isLocalHostname(h)).toBe(false);
  });

  it('accepts no Origin (curl, same-origin GET) and a local page, refuses any other site', () => {
    expect(isLocalOrigin(undefined)).toBe(true);
    expect(isLocalOrigin('http://localhost:3500')).toBe(true);
    expect(isLocalOrigin('https://attacker.example')).toBe(false);
    expect(isLocalOrigin('null')).toBe(false);
  });
});
