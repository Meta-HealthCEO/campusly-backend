import { WhatsAppMessage } from '../model.js';
import { Parent } from '../../Parent/model.js';
import { Student } from '../../Student/model.js';
import { logger } from '../../../common/logger.js';
import { TwilioWhatsAppService } from './twilio.service.js';

export class WhatsAppBroadcastService {
  /**
   * Resolve a recipient group (all_parents, grade, class) to an array of User IDs.
   * Walks Student → guardianIds (Parent _id) → Parent.userId.
   */
  static async resolveRecipientGroup(
    schoolId: string,
    group: string,
    gradeId?: string,
    classId?: string,
  ): Promise<string[]> {
    const studentFilter: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
      enrollmentStatus: 'active',
    };

    if (group === 'grade' && gradeId) {
      studentFilter.gradeId = gradeId;
    } else if (group === 'class' && classId) {
      studentFilter.classId = classId;
    }
    // 'all_parents' uses no additional filter

    const students = await Student.find(studentFilter)
      .select('guardianIds')
      .lean();

    const parentIdSet = new Set<string>();
    for (const student of students) {
      for (const gId of student.guardianIds) {
        parentIdSet.add(gId.toString());
      }
    }

    // guardianIds are Parent model IDs — resolve to User IDs
    const parents = await Parent.find({
      _id: { $in: Array.from(parentIdSet) },
      schoolId,
      isDeleted: false,
    }).select('userId').lean();

    return parents.map((p) => p.userId.toString());
  }

  /**
   * Process a batch of queued WhatsApp messages (fire-and-forget).
   * Sends each message via Twilio and updates status in the database.
   */
  static async processMessageBatch(
    credentials: { accountSid: string; authToken: string; phoneNumber: string },
    messages: Array<{
      _id: unknown;
      recipientPhone: string;
      templateType: string;
      templateParams: Record<string, unknown>;
    }>,
    templateSid: string,
  ): Promise<void> {
    for (const msg of messages) {
      try {
        const result = await TwilioWhatsAppService.sendTemplateMessage(
          credentials,
          msg.recipientPhone,
          templateSid,
          msg.templateParams,
        );
        await WhatsAppMessage.findByIdAndUpdate(msg._id, {
          $set: { status: 'sent', externalId: result.sid, sentAt: new Date() },
        });
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : 'Unknown error';
        await WhatsAppMessage.findByIdAndUpdate(msg._id, {
          $set: { status: 'failed', failureReason: reason },
        });
        logger.error(`[WhatsApp] Broadcast message failed: ${reason}`);
      }
    }
  }
}
