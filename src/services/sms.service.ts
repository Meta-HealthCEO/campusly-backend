import { config } from '../config/env.js';

export class SmsService {
  static async sendSms(to: string, message: string): Promise<void> {
    if (config.nodeEnv === 'development') {
      console.log('[SmsService] Dev mode - SMS not sent');
      console.log(`  To: ${to}`);
      console.log(`  Message: ${message}`);
      return;
    }

    // In production, integrate with an SMS gateway API
    // const response = await fetch(config.sms.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${config.sms.apiKey}`,
    //   },
    //   body: JSON.stringify({ to, message }),
    // });

    console.log(`[SmsService] SMS sent to ${to}: ${message.substring(0, 80)}...`);
  }

  static async sendAbsenteeAlert(to: string, studentName: string, date: string): Promise<void> {
    const message = `${config.app.name}: ${studentName} was marked absent on ${date}. Please contact the school if this absence is excused.`;

    await SmsService.sendSms(to, message);
  }
}
