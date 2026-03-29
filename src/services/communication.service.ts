import { Parent } from '../modules/Parent/model.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';
import { config } from '../config/env.js';

export class CommunicationService {
  /**
   * Send a message to a single parent based on their communication preference.
   */
  static async sendToParent(
    parentId: string,
    title: string,
    message: string,
    data?: unknown,
  ): Promise<void> {
    const parent = await Parent.findById(parentId).populate('userId');

    if (!parent) {
      console.warn(`[CommunicationService] Parent not found: ${parentId}`);
      return;
    }

    const user = parent.userId as unknown as {
      email: string;
      phone?: string;
      firstName: string;
      lastName: string;
    };

    await CommunicationService.routeMessage(user, parent.communicationPreference, title, message, data);
  }

  /**
   * Send a message to multiple parents based on their individual communication preferences.
   */
  static async sendBulk(
    parentIds: string[],
    title: string,
    message: string,
  ): Promise<void> {
    const parents = await Parent.find({ _id: { $in: parentIds } }).populate('userId');

    for (const parent of parents) {
      const user = parent.userId as unknown as {
        email: string;
        phone?: string;
        firstName: string;
        lastName: string;
      };

      await CommunicationService.routeMessage(user, parent.communicationPreference, title, message);
    }
  }

  /**
   * Send a message to all parents of students in a specific class.
   */
  static async sendToClass(
    classId: string,
    title: string,
    message: string,
  ): Promise<void> {
    const { Student } = await import('../modules/Student/model.js');

    const students = await Student.find({
      classId,
      enrollmentStatus: 'active',
      isDeleted: false,
    });

    const parentIds = [
      ...new Set(
        students.flatMap((s) => s.guardianIds.map((id) => id.toString())),
      ),
    ];

    if (parentIds.length > 0) {
      await CommunicationService.sendBulk(parentIds, title, message);
    }
  }

  /**
   * Send a message to all parents of students in a specific grade.
   */
  static async sendToGrade(
    gradeId: string,
    title: string,
    message: string,
  ): Promise<void> {
    const { Student } = await import('../modules/Student/model.js');

    const students = await Student.find({
      gradeId,
      enrollmentStatus: 'active',
      isDeleted: false,
    });

    const parentIds = [
      ...new Set(
        students.flatMap((s) => s.guardianIds.map((id) => id.toString())),
      ),
    ];

    if (parentIds.length > 0) {
      await CommunicationService.sendBulk(parentIds, title, message);
    }
  }

  /**
   * Send a message to all parents in a specific school.
   */
  static async sendToSchool(
    schoolId: string,
    title: string,
    message: string,
  ): Promise<void> {
    const parents = await Parent.find({ schoolId, isDeleted: false });

    const parentIds = parents.map((p) => p._id.toString());

    if (parentIds.length > 0) {
      await CommunicationService.sendBulk(parentIds, title, message);
    }
  }

  // ---------------------------------------------------------------------------
  // Template methods
  // ---------------------------------------------------------------------------

  static absenceTemplate(
    studentName: string,
    date: string,
  ): { title: string; message: string } {
    return {
      title: `${config.app.name} - Absence Alert`,
      message: `
        <h2>Student Absence Alert</h2>
        <p>We would like to inform you that <strong>${studentName}</strong> was marked absent on <strong>${date}</strong>.</p>
        <p>If this absence was planned or excused, please contact the school administration.</p>
      `,
    };
  }

  static feeReminderTemplate(
    studentName: string,
    amount: number,
    dueDate: string,
  ): { title: string; message: string } {
    return {
      title: `${config.app.name} - Fee Reminder`,
      message: `
        <h2>Fee Payment Reminder</h2>
        <p>This is a reminder that a fee payment is due for <strong>${studentName}</strong>.</p>
        <ul>
          <li><strong>Amount Due:</strong> R${(amount / 100).toFixed(2)}</li>
          <li><strong>Due Date:</strong> ${dueDate}</li>
        </ul>
        <p>Please ensure payment is made before the due date to avoid late fees.</p>
      `,
    };
  }

  static gradeNotificationTemplate(
    studentName: string,
    subject: string,
    percentage: number,
  ): { title: string; message: string } {
    return {
      title: `${config.app.name} - Grade Notification`,
      message: `
        <h2>Grade Notification</h2>
        <p>A new grade has been recorded for <strong>${studentName}</strong>.</p>
        <ul>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Percentage:</strong> ${percentage}%</li>
        </ul>
        <p>Log in to ${config.app.name} to view the full report.</p>
      `,
    };
  }

  // ---------------------------------------------------------------------------
  // Private routing helper
  // ---------------------------------------------------------------------------

  private static async routeMessage(
    user: { email: string; phone?: string; firstName: string; lastName: string },
    preference: 'email' | 'sms' | 'whatsapp' | 'push',
    title: string,
    message: string,
    data?: unknown,
  ): Promise<void> {
    switch (preference) {
      case 'email':
        await EmailService.sendEmail(user.email, title, message);
        break;

      case 'sms':
        await SmsService.sendSms(user.phone || user.email, message);
        break;

      case 'whatsapp':
        // WhatsApp integration placeholder (e.g., WhatsApp Business API)
        console.log(`[CommunicationService] WhatsApp message to ${user.phone || user.email}: ${title}`);
        console.log(`  Message: ${message.substring(0, 200)}...`);
        break;

      case 'push':
        // Push notification placeholder (e.g., Firebase Cloud Messaging)
        console.log(`[CommunicationService] Push notification to ${user.firstName} ${user.lastName}: ${title}`);
        console.log(`  Message: ${message.substring(0, 200)}...`);
        if (data) {
          console.log(`  Data: ${JSON.stringify(data)}`);
        }
        break;

      default:
        console.warn(`[CommunicationService] Unknown communication preference: ${preference}`);
    }
  }
}
