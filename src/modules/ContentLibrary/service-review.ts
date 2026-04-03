import mongoose from 'mongoose';
import { ContentResource } from './model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors.js';
import type { ReviewResourceInput } from './validation.js';

export class ReviewService {
  static async submitForReview(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const resource = await ContentResource.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!resource) throw new NotFoundError('Content resource not found');
    if (resource.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can submit for review');
    }
    if (resource.status !== 'draft' && resource.status !== 'rejected') {
      throw new BadRequestError('Only draft or rejected resources can be submitted for review');
    }
    if (resource.blocks.length === 0) {
      throw new BadRequestError('Resource must have at least one block before submitting');
    }

    const updated = await ContentResource.findOneAndUpdate(
      { _id: oid, isDeleted: false },
      { $set: { status: 'pending_review' } },
      { new: true },
    ).lean();

    return updated;
  }

  static async reviewResource(
    id: string,
    schoolId: string,
    reviewerId: string,
    data: ReviewResourceInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const resource = await ContentResource.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!resource) throw new NotFoundError('Content resource not found');
    if (resource.status !== 'pending_review') {
      throw new BadRequestError('Only resources with pending_review status can be reviewed');
    }

    const newStatus = data.action === 'approve' ? 'approved' : 'rejected';

    const updated = await ContentResource.findOneAndUpdate(
      { _id: oid, isDeleted: false },
      {
        $set: {
          status: newStatus,
          reviewedBy: new mongoose.Types.ObjectId(reviewerId),
          reviewedAt: new Date(),
          reviewNotes: data.notes,
        },
      },
      { new: true },
    ).lean();

    return updated;
  }
}
