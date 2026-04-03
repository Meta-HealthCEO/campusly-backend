import mongoose from 'mongoose';
import { CurriculumIntervention } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { UpdateInterventionInput } from './validation.js';

export class InterventionsService {
  static async listInterventions(
    schoolId: string,
    filters: {
      status?: string;
      teacherId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.teacherId) query.teacherId = new mongoose.Types.ObjectId(filters.teacherId);

    const { skip, limit } = paginationHelper(filters.page, filters.limit);
    const [interventions, total] = await Promise.all([
      CurriculumIntervention.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'firstName lastName email')
        .populate('resolvedBy', 'firstName lastName')
        .populate({
          path: 'planId',
          select: 'subjectId gradeId term year',
          populate: [
            { path: 'subjectId', select: 'name code' },
            { path: 'gradeId', select: 'name level' },
          ],
        })
        .lean(),
      CurriculumIntervention.countDocuments(query),
    ]);

    return { interventions, total, page: filters.page ?? 1, limit };
  }

  static async updateIntervention(
    id: string,
    schoolId: string,
    userId: string,
    data: UpdateInterventionInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const oid = new mongoose.Types.ObjectId(id);

    const existing = await CurriculumIntervention.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Intervention not found');

    const $set: Record<string, unknown> = {};
    if (data.notes !== undefined) $set.notes = data.notes;
    if (data.status !== undefined) {
      $set.status = data.status;
      if (data.status === 'resolved' && !existing.resolvedAt) {
        $set.resolvedAt = new Date();
        $set.resolvedBy = new mongoose.Types.ObjectId(userId);
      }
    }

    const intervention = await CurriculumIntervention.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set },
      { new: true },
    )
      .populate('teacherId', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName')
      .lean();

    if (!intervention) throw new NotFoundError('Intervention not found');
    return intervention;
  }
}
