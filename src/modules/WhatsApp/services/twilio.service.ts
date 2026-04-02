import { logger } from '../../../common/logger.js';
import type { IWhatsAppCredentials } from '../model.js';

interface TwilioSendResult {
  sid: string;
  status: string;
}

export class TwilioWhatsAppService {
  /**
   * Send a WhatsApp template message via Twilio.
   *
   * Currently a placeholder that logs the message and returns a mock SID.
   * When the Twilio SDK is installed, replace the body with:
   *
   * ```typescript
   * import twilio from 'twilio';
   * const client = twilio(config.accountSid, config.authToken);
   * const msg = await client.messages.create({
   *   from: `whatsapp:${config.phoneNumber}`,
   *   to: `whatsapp:${phone}`,
   *   contentSid: templateSid,
   *   contentVariables: JSON.stringify(params),
   * });
   * return { sid: msg.sid, status: msg.status };
   * ```
   */
  static async sendTemplateMessage(
    config: IWhatsAppCredentials,
    phone: string,
    templateSid: string,
    params: Record<string, unknown>,
  ): Promise<TwilioSendResult> {
    logger.info(
      `[TwilioWhatsApp] Sending template ${templateSid} to ${phone} ` +
      `via account ${config.accountSid}`,
    );
    logger.info(`[TwilioWhatsApp] Template params: ${JSON.stringify(params)}`);

    // Placeholder: generate a mock SID for development
    const mockSid = `SM${Date.now()}${Math.random().toString(36).slice(2, 10)}`;

    logger.info(`[TwilioWhatsApp] Mock message sent — SID: ${mockSid}`);
    return { sid: mockSid, status: 'queued' };
  }

  /**
   * Validate an incoming Twilio webhook signature.
   *
   * When Twilio SDK is installed, replace with:
   * ```typescript
   * import twilio from 'twilio';
   * return twilio.validateRequest(authToken, signature, url, params);
   * ```
   */
  static validateWebhook(
    signature: string,
    url: string,
    params: Record<string, string>,
    authToken: string,
  ): boolean {
    logger.info(
      `[TwilioWhatsApp] Validating webhook signature for URL: ${url}`,
    );

    // Placeholder: accept all webhooks in development
    // In production, use Twilio's signature validation
    if (!signature || !authToken) {
      return false;
    }

    // Suppress unused-variable warnings for params — used in real implementation
    void params;

    return true;
  }
}
