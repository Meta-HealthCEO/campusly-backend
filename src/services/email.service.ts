import { Resend } from 'resend';
import { logger } from '../common/logger.js';

interface EmailResult {
  success: boolean;
  messageId?: string;
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM = process.env.EMAIL_FROM ?? 'Campusly <noreply@campusly.co.za>';

export class EmailService {
  static async sendEmail(
    to: string,
    subject: string,
    html: string,
    options?: { from?: string; replyTo?: string },
  ): Promise<EmailResult> {
    if (!resend) {
      logger.info({ to, subject }, 'Email (dev mode — no RESEND_API_KEY)');
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: options?.from ?? DEFAULT_FROM,
        to,
        subject,
        html,
        replyTo: options?.replyTo,
      });

      if (error) {
        logger.error({ error, to, subject }, 'Resend API error');
        return { success: false };
      }

      logger.info({ messageId: data?.id, to }, 'Email sent via Resend');
      return { success: true, messageId: data?.id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown email error';
      logger.error({ err: msg, to, subject }, 'Email send failed');
      throw new Error(msg);
    }
  }

  static async sendPasswordReset(to: string, token: string): Promise<EmailResult> {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const appName = process.env.APP_NAME ?? 'Campusly';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const subject = `${appName} - Password Reset`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    return EmailService.sendEmail(to, subject, html);
  }

  static async sendPaymentReminder(
    to: string,
    invoiceData: { invoiceNumber: string; amount: number; dueDate: string; studentName: string },
  ): Promise<EmailResult> {
    const appName = process.env.APP_NAME ?? 'Campusly';
    const subject = `${appName} - Payment Reminder: Invoice ${invoiceData.invoiceNumber}`;
    const html = `
      <h2>Payment Reminder</h2>
      <p>This is a reminder that the following invoice is due:</p>
      <ul>
        <li><strong>Invoice:</strong> ${invoiceData.invoiceNumber}</li>
        <li><strong>Student:</strong> ${invoiceData.studentName}</li>
        <li><strong>Amount:</strong> R${(invoiceData.amount / 100).toFixed(2)}</li>
        <li><strong>Due Date:</strong> ${invoiceData.dueDate}</li>
      </ul>
      <p>Please ensure payment is made before the due date to avoid late fees.</p>
    `;
    return EmailService.sendEmail(to, subject, html);
  }

  static async sendAbsenteeAlert(
    to: string,
    studentName: string,
    date: string,
  ): Promise<EmailResult> {
    const appName = process.env.APP_NAME ?? 'Campusly';
    const subject = `${appName} - Absence Alert: ${studentName}`;
    const html = `
      <h2>Student Absence Alert</h2>
      <p>We would like to inform you that <strong>${studentName}</strong> was marked absent on <strong>${date}</strong>.</p>
      <p>If this absence was planned or excused, please contact the school administration.</p>
    `;
    return EmailService.sendEmail(to, subject, html);
  }
}
