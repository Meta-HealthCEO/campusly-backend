import { logger } from '../common/logger.js';

interface PushResult {
  success: boolean;
  messageId?: string;
  failedTokens?: string[];
}

interface FcmMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Push notification service using Firebase Cloud Messaging.
 *
 * Falls back to dev-mode logging if FIREBASE_PROJECT_ID is not set.
 * FCM HTTP v1 API is used directly to avoid the heavy firebase-admin dependency.
 */
export class PushService {
  private static accessToken: string | null = null;
  private static tokenExpiresAt = 0;

  /**
   * Send a push notification to a single device.
   */
  static async sendPush(message: FcmMessage): Promise<PushResult> {
    if (!process.env.FIREBASE_PROJECT_ID) {
      logger.info(
        { token: message.token.substring(0, 12) + '...', title: message.title },
        'Push (dev mode — no FIREBASE_PROJECT_ID)',
      );
      return { success: true, messageId: `dev-push-${Date.now()}` };
    }

    try {
      const token = await PushService.getAccessToken();
      const projectId = process.env.FIREBASE_PROJECT_ID;

      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: message.token,
              notification: {
                title: message.title,
                body: message.body,
                ...(message.imageUrl ? { image: message.imageUrl } : {}),
              },
              ...(message.data ? { data: message.data } : {}),
            },
          }),
        },
      );

      if (!res.ok) {
        const errorBody = await res.text();
        logger.error({ status: res.status, body: errorBody }, 'FCM send failed');
        throw new Error(`FCM error ${res.status}: ${errorBody}`);
      }

      const result = (await res.json()) as { name: string };
      logger.info({ messageId: result.name }, 'Push sent via FCM');
      return { success: true, messageId: result.name };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown push error';
      logger.error({ err: msg }, 'Push send failed');
      throw new Error(msg);
    }
  }

  /**
   * Send push to multiple device tokens. Returns tokens that failed.
   */
  static async sendPushBatch(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<PushResult> {
    const failedTokens: string[] = [];
    let lastMessageId: string | undefined;

    for (const token of tokens) {
      try {
        const result = await PushService.sendPush({ token, title, body, data });
        lastMessageId = result.messageId;
      } catch {
        failedTokens.push(token);
      }
    }

    return {
      success: failedTokens.length < tokens.length,
      messageId: lastMessageId,
      failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
    };
  }

  /**
   * Get an OAuth2 access token for FCM using service account credentials.
   * Caches the token until near expiry.
   */
  private static async getAccessToken(): Promise<string> {
    if (PushService.accessToken && Date.now() < PushService.tokenExpiresAt) {
      return PushService.accessToken;
    }

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      throw new Error('FCM credentials not configured (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
    }

    // Build JWT for Google OAuth2
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    const { createSign } = await import('crypto');
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signInput = `${encodedHeader}.${encodedPayload}`;

    const sign = createSign('RSA-SHA256');
    sign.update(signInput);
    const signature = sign.sign(privateKey, 'base64url');

    const jwt = `${signInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google OAuth2 token request failed: ${body}`);
    }

    const tokenData = (await res.json()) as { access_token: string; expires_in: number };
    PushService.accessToken = tokenData.access_token;
    PushService.tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;
    return tokenData.access_token;
  }
}
