import { logger } from '../common/logger.js';

interface SmsResult {
  success: boolean;
  messageId?: string;
}

interface TwilioClient {
  messages: {
    create: (opts: {
      to: string;
      from: string;
      body: string;
    }) => Promise<{ sid: string; status: string }>;
  };
}

let twilioClient: TwilioClient | null = null;

async function getTwilioClient(): Promise<TwilioClient | null> {
  if (twilioClient) return twilioClient;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;

  try {
    // Dynamic import — twilio may not be installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = await (Function('return import("twilio")')() as Promise<{ default: unknown }>);
    const createClient = twilio.default as (...args: string[]) => unknown;
    twilioClient = createClient(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    ) as TwilioClient;
    return twilioClient;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.warn({ err: msg }, 'Twilio SDK not available — SMS will use dev mode');
    return null;
  }
}

const SMS_FROM = process.env.SMS_SENDER_ID ?? process.env.TWILIO_PHONE_NUMBER ?? '';

export class SmsService {
  static async sendSms(to: string, message: string): Promise<SmsResult> {
    const client = await getTwilioClient();

    if (!client) {
      logger.info({ to, preview: message.substring(0, 80) }, 'SMS (dev mode — no Twilio keys)');
      return { success: true, messageId: `dev-sms-${Date.now()}` };
    }

    try {
      const result = await client.messages.create({
        to,
        from: SMS_FROM,
        body: message,
      });

      logger.info({ messageId: result.sid, to }, 'SMS sent via Twilio');
      return { success: true, messageId: result.sid };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown SMS error';
      logger.error({ err: msg, to }, 'SMS send failed');
      throw new Error(msg);
    }
  }

  static async sendAbsenteeAlert(
    to: string,
    studentName: string,
    date: string,
  ): Promise<SmsResult> {
    const appName = process.env.APP_NAME ?? 'Campusly';
    const message = `${appName}: ${studentName} was marked absent on ${date}. Please contact the school if this absence is excused.`;
    return SmsService.sendSms(to, message);
  }
}
