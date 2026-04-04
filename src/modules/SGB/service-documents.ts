import { SgbDocument } from './model.js';
import type { ISgbDocument } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { logger } from '../../common/logger.js';

interface ListDocumentsQuery {
  schoolId: string;
  category?: string;
  page?: number;
  limit?: number;
}

interface CreateDocumentData {
  schoolId: string;
  title: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  policyReviewDate?: string;
  uploadedBy: string;
}

export class SgbDocumentService {
  static async createDocument(data: CreateDocumentData): Promise<ISgbDocument> {
    const doc = await SgbDocument.create({
      ...data,
      version: 1,
    });

    logger.info({ schoolId: data.schoolId, documentId: doc._id }, 'SGB document uploaded');
    return doc;
  }

  static async listDocuments(query: ListDocumentsQuery): Promise<{
    documents: ISgbDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      schoolId: query.schoolId,
      isDeleted: false,
    };

    if (query.category) filter.category = query.category;

    const [documents, total] = await Promise.all([
      SgbDocument.find(filter)
        .populate('uploadedBy', 'firstName lastName')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      SgbDocument.countDocuments(filter),
    ]);

    return { documents: documents as ISgbDocument[], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getDocument(id: string, schoolId: string): Promise<ISgbDocument> {
    const doc = await SgbDocument.findOne({ _id: id, schoolId, isDeleted: false }).lean();

    if (!doc) {
      throw new NotFoundError('SGB document not found');
    }

    return doc as ISgbDocument;
  }

  static async deleteDocument(id: string, schoolId: string): Promise<void> {
    const doc = await SgbDocument.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!doc) {
      throw new NotFoundError('SGB document not found');
    }
  }

  static async getComplianceSummary(schoolId: string): Promise<{
    totalPolicies: number;
    upToDate: number;
    dueForReview: number;
    overdue: number;
    policies: Array<{
      documentId: string;
      title: string;
      category: string;
      policyReviewDate: string | null;
      status: 'up_to_date' | 'due_for_review' | 'overdue';
      daysPastDue: number;
    }>;
  }> {
    const policyDocs = await SgbDocument.find({
      schoolId,
      category: 'policy',
      isDeleted: false,
    }).lean();

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let upToDate = 0;
    let dueForReview = 0;
    let overdue = 0;

    const policies = policyDocs.map((doc) => {
      const reviewDate = doc.policyReviewDate ? new Date(doc.policyReviewDate) : null;
      let status: 'up_to_date' | 'due_for_review' | 'overdue' = 'up_to_date';
      let daysPastDue = 0;

      if (!reviewDate) {
        upToDate++;
      } else if (reviewDate < now) {
        status = 'overdue';
        daysPastDue = Math.floor((now.getTime() - reviewDate.getTime()) / (24 * 60 * 60 * 1000));
        overdue++;
      } else if (reviewDate < thirtyDaysFromNow) {
        status = 'due_for_review';
        dueForReview++;
      } else {
        upToDate++;
      }

      return {
        documentId: (doc._id as import('mongoose').Types.ObjectId).toString(),
        title: doc.title,
        category: doc.category,
        policyReviewDate: reviewDate ? reviewDate.toISOString() : null,
        status,
        daysPastDue,
      };
    });

    return {
      totalPolicies: policyDocs.length,
      upToDate,
      dueForReview,
      overdue,
      policies,
    };
  }
}
