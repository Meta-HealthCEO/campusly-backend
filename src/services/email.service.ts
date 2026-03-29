import { config } from '../config/env.js';

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (config.nodeEnv === 'development') {
      console.log('[EmailService] Dev mode - email not sent');
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Body: ${html.substring(0, 200)}...`);
      return;
    }

    // In production, use nodemailer or a transactional email service
    // const transporter = nodemailer.createTransport({
    //   host: config.smtp.host,
    //   port: config.smtp.port,
    //   auth: { user: config.smtp.user, pass: config.smtp.pass },
    // });
    // await transporter.sendMail({ from: config.smtp.user, to, subject, html });

    console.log(`[EmailService] Email sent to ${to}: ${subject}`);
  }

  static async sendPasswordReset(to: string, token: string): Promise<void> {
    const resetUrl = `${config.app.url}/reset-password?token=${token}`;
    const subject = `${config.app.name} - Password Reset`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await EmailService.sendEmail(to, subject, html);
  }

  static async sendPaymentReminder(
    to: string,
    invoiceData: { invoiceNumber: string; amount: number; dueDate: string; studentName: string },
  ): Promise<void> {
    const subject = `${config.app.name} - Payment Reminder: Invoice ${invoiceData.invoiceNumber}`;
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

    await EmailService.sendEmail(to, subject, html);
  }

  static async sendAbsenteeAlert(to: string, studentName: string, date: string): Promise<void> {
    const subject = `${config.app.name} - Absence Alert: ${studentName}`;
    const html = `
      <h2>Student Absence Alert</h2>
      <p>We would like to inform you that <strong>${studentName}</strong> was marked absent on <strong>${date}</strong>.</p>
      <p>If this absence was planned or excused, please contact the school administration.</p>
    `;

    await EmailService.sendEmail(to, subject, html);
  }
}
