import { ConsentForm, IConsentForm, ConsentResponse, IConsentResponse } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateConsentFormInput, UpdateConsentFormInput, RecordConsentResponseInput } from './validation.js';

interface ListFormsQuery {
  page?: number;
  limit?: number;
  schoolId?: string;
  type?: string;
}

interface ListResponsesQuery {
  page?: number;
  limit?: number;
}

export class ConsentService {
  // ─── Consent Form CRUD ────────────────────────────────────────────────────

  static async createForm(data: CreateConsentFormInput): Promise<IConsentForm> {
    const form = await ConsentForm.create(data);
    return form;
  }

  static async listForms(
    query: ListFormsQuery,
  ): Promise<{
    forms: IConsentForm[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }

    if (query.type) {
      filter.type = query.type;
    }

    const [forms, total] = await Promise.all([
      ConsentForm.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      ConsentForm.countDocuments(filter),
    ]);

    return {
      forms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getForm(id: string, schoolId: string): Promise<IConsentForm> {
    const form = await ConsentForm.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('createdBy', 'firstName lastName email');

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    return form;
  }

  static async updateForm(id: string, schoolId: string, data: UpdateConsentFormInput): Promise<IConsentForm> {
    const form = await ConsentForm.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('createdBy', 'firstName lastName email');

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    return form;
  }

  static async deleteForm(id: string, schoolId: string): Promise<IConsentForm> {
    const form = await ConsentForm.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    return form;
  }

  // ─── Consent Response ─────────────────────────────────────────────────────

  static async recordResponse(data: RecordConsentResponseInput, schoolId: string): Promise<IConsentResponse> {
    const form = await ConsentForm.findOne({ _id: data.formId, schoolId, isDeleted: false });

    if (!form) {
      throw new NotFoundError('Consent form not found');
    }

    const response = await ConsentResponse.create(data);
    return response;
  }

  static async getResponsesByForm(
    formId: string,
    query: ListResponsesQuery,
  ): Promise<{
    responses: IConsentResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter = { formId, isDeleted: false };

    const [responses, total] = await Promise.all([
      ConsentResponse.find(filter)
        .populate('studentId', 'firstName lastName')
        .populate('parentId', 'firstName lastName email')
        .sort('-signedAt')
        .skip(skip)
        .limit(limit),
      ConsentResponse.countDocuments(filter),
    ]);

    return {
      responses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getOutstandingConsents(studentId: string, schoolId: string): Promise<IConsentForm[]> {
    const respondedFormIds = await ConsentResponse.distinct('formId', {
      studentId,
      isDeleted: false,
    });

    const outstandingForms = await ConsentForm.find({
      targetStudents: studentId,
      schoolId,
      _id: { $nin: respondedFormIds },
      isDeleted: false,
    }).populate('createdBy', 'firstName lastName email');

    return outstandingForms;
  }
}
