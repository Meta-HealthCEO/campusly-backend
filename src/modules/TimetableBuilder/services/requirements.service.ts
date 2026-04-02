import { SubjectRequirement, SubjectLine } from '../model.js';
import type { ISubjectRequirement, ISubjectLine } from '../model.js';
import type { RequirementInput, LineInput } from '../validation.js';
import { NotFoundError } from '../../../common/errors.js';

export class RequirementsService {
  // ─── Subject Requirements ─────────────────────────────────────────────────

  /** List requirements, optionally filtered by grade. */
  static async listRequirements(
    schoolId: string,
    gradeId?: string,
  ): Promise<ISubjectRequirement[]> {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (gradeId) filter.gradeId = gradeId;

    return SubjectRequirement.find(filter)
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('preferredTeacherId', 'firstName lastName email')
      .lean()
      .exec() as Promise<ISubjectRequirement[]>;
  }

  /** Create or update a requirement (upsert on schoolId+subjectId+gradeId). */
  static async upsertRequirement(
    schoolId: string,
    data: RequirementInput,
  ): Promise<ISubjectRequirement> {
    const result = await SubjectRequirement.findOneAndUpdate(
      { schoolId, subjectId: data.subjectId, gradeId: data.gradeId, isDeleted: false },
      {
        $set: {
          schoolId,
          subjectId: data.subjectId,
          gradeId: data.gradeId,
          periodsPerWeek: data.periodsPerWeek,
          requiresDoublePeriod: data.requiresDoublePeriod,
          preferredTeacherId: data.preferredTeacherId,
        },
      },
      { upsert: true, new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('preferredTeacherId', 'firstName lastName email')
      .lean();
    return result as ISubjectRequirement;
  }

  /** Soft-delete a requirement. */
  static async deleteRequirement(id: string, schoolId: string): Promise<void> {
    const result = await SubjectRequirement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!result) throw new NotFoundError('Subject requirement not found');
  }

  // ─── Subject Lines ────────────────────────────────────────────────────────

  /** List subject lines, optionally filtered by grade. */
  static async listLines(
    schoolId: string,
    gradeId?: string,
  ): Promise<ISubjectLine[]> {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (gradeId) filter.gradeId = gradeId;

    return SubjectLine.find(filter)
      .populate('gradeId', 'name')
      .populate('subjectIds', 'name code')
      .lean()
      .exec() as Promise<ISubjectLine[]>;
  }

  /** Create or update a subject line. */
  static async upsertLine(
    schoolId: string,
    data: LineInput & { id?: string },
  ): Promise<ISubjectLine> {
    if (data.id) {
      const result = await SubjectLine.findOneAndUpdate(
        { _id: data.id, schoolId, isDeleted: false },
        { $set: { lineName: data.lineName, subjectIds: data.subjectIds, gradeId: data.gradeId } },
        { new: true, runValidators: true },
      )
        .populate('gradeId', 'name')
        .populate('subjectIds', 'name code')
        .lean();
      if (!result) throw new NotFoundError('Subject line not found');
      return result as ISubjectLine;
    }

    const line = await SubjectLine.create({
      schoolId,
      gradeId: data.gradeId,
      lineName: data.lineName,
      subjectIds: data.subjectIds,
    });
    return line.toObject() as ISubjectLine;
  }

  /** Soft-delete a subject line. */
  static async deleteLine(id: string, schoolId: string): Promise<void> {
    const result = await SubjectLine.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!result) throw new NotFoundError('Subject line not found');
  }
}
