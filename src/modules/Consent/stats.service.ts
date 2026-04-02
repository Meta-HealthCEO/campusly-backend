import mongoose from 'mongoose';
import { ConsentForm, ConsentResponse } from './model.js';
import { NotFoundError } from '../../common/errors.js';

interface CompletionStats {
  totalTargeted: number;
  signed: number;
  declined: number;
  pending: number;
  completionPercentage: number;
}

interface PendingParent {
  studentId: string;
  studentName: string;
}

export class ConsentStatsService {
  static async getCompletionStats(
    schoolId: string,
    formId: string,
  ): Promise<CompletionStats> {
    const form = await ConsentForm.findOne({
      _id: formId,
      schoolId,
      isDeleted: false,
    });

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    const totalTargeted = form.targetStudents.length;

    const responses = await ConsentResponse.find({
      formId,
      isDeleted: false,
    });

    const signed = responses.filter((r) => r.response === 'granted').length;
    const declined = responses.filter((r) => r.response === 'denied').length;
    const responded = signed + declined;
    const pending = Math.max(0, totalTargeted - responded);

    const completionPercentage =
      totalTargeted > 0
        ? Math.round((responded / totalTargeted) * 100 * 10) / 10
        : 0;

    return {
      totalTargeted,
      signed,
      declined,
      pending,
      completionPercentage,
    };
  }

  static async getPendingParents(
    schoolId: string,
    formId: string,
  ): Promise<PendingParent[]> {
    const form = await ConsentForm.findOne({
      _id: formId,
      schoolId,
      isDeleted: false,
    }).populate('targetStudents', 'firstName lastName');

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    const respondedStudentIds = await ConsentResponse.distinct('studentId', {
      formId,
      isDeleted: false,
    });

    const respondedSet = new Set(
      respondedStudentIds.map((id: mongoose.Types.ObjectId) => id.toString()),
    );

    const pendingParents: PendingParent[] = [];

    for (const student of form.targetStudents) {
      const sid =
        typeof student === 'object' && student !== null
          ? (student as unknown as { _id: mongoose.Types.ObjectId; firstName: string; lastName: string })._id.toString()
          : String(student);

      if (!respondedSet.has(sid)) {
        const s = student as unknown as {
          _id: mongoose.Types.ObjectId;
          firstName: string;
          lastName: string;
        };
        pendingParents.push({
          studentId: sid,
          studentName:
            typeof s.firstName === 'string'
              ? `${s.firstName} ${s.lastName}`
              : sid,
        });
      }
    }

    return pendingParents;
  }

  static async exportSignedForm(
    schoolId: string,
    formId: string,
    responseId: string,
  ): Promise<string> {
    const form = await ConsentForm.findOne({
      _id: formId,
      schoolId,
      isDeleted: false,
    });

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    const response = await ConsentResponse.findOne({
      _id: responseId,
      formId,
      isDeleted: false,
    })
      .populate('parentId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName');

    if (!response) {
      throw new NotFoundError('Consent response not found');
    }

    const parentName = getPopulatedName(response.parentId);
    const studentName = getPopulatedName(response.studentId);

    const lines = [
      '═══════════════════════════════════════════',
      '         CONSENT FORM RECORD',
      '═══════════════════════════════════════════',
      '',
      `Form Title:     ${form.title}`,
      `Form Type:      ${form.type}`,
      form.description ? `Description:    ${form.description}` : '',
      '',
      '───────────────────────────────────────────',
      '',
      `Student Name:   ${studentName}`,
      `Parent Name:    ${parentName}`,
      `Response:       ${response.response === 'granted' ? 'CONSENT GRANTED' : 'CONSENT DENIED'}`,
      `Signed At:      ${new Date(response.signedAt).toLocaleString()}`,
      response.notes ? `Notes:          ${response.notes}` : '',
      response.signature ? `Signature:      ${response.signature}` : '',
      '',
      '───────────────────────────────────────────',
      `Generated:      ${new Date().toLocaleString()}`,
      '═══════════════════════════════════════════',
    ];

    return lines.filter(Boolean).join('\n');
  }
}

function getPopulatedName(
  ref: unknown,
): string {
  if (typeof ref === 'object' && ref !== null) {
    const obj = ref as { firstName?: string; lastName?: string };
    if (obj.firstName) {
      return `${obj.firstName} ${obj.lastName ?? ''}`.trim();
    }
  }
  return String(ref ?? 'Unknown');
}
