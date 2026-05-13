import mongoose from 'mongoose';
import { User } from '../Auth/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { materialiseTeachingScope } from '../Academic/services/materialise-from-curriculum.service.js';
import { logger } from '../../common/logger.js';
import type { UpdateTeachingScopeInput } from './validation.js';

export class TeacherSettingsService {
  static async getTeachingScope(userId: string) {
    const user = await User.findOne({ _id: userId, isDeleted: false })
      .select('teachingScope')
      .lean();
    if (!user) throw new NotFoundError('User not found');
    return user.teachingScope ?? { grades: [], subjectsByGrade: [] };
  }

  /** Replaces the teacher's scope. Validates every referenced CurriculumNode
   * exists and has the right type ('grade' or 'subject'). */
  static async updateTeachingScope(userId: string, input: UpdateTeachingScopeInput) {
    const gradeIds = input.grades.map((id) => new mongoose.Types.ObjectId(id));
    const subjectIds = input.subjectsByGrade.flatMap(
      (g) => g.subjectIds.map((id) => new mongoose.Types.ObjectId(id)),
    );

    // Sanity: every subjectsByGrade.gradeId must be in the grades list
    const gradeIdSet = new Set(input.grades);
    for (const entry of input.subjectsByGrade) {
      if (!gradeIdSet.has(entry.gradeId)) {
        throw new BadRequestError(
          `subjectsByGrade contains gradeId not in the selected grades list: ${entry.gradeId}`,
        );
      }
    }

    // Validate grades exist in CurriculumNode with type='grade'
    if (gradeIds.length > 0) {
      const foundGrades = await CurriculumNode.countDocuments({
        _id: { $in: gradeIds },
        type: 'grade',
        isDeleted: false,
      });
      if (foundGrades !== gradeIds.length) {
        throw new BadRequestError('One or more selected grades are not valid CAPS grade nodes');
      }
    }

    // Validate subjects exist in CurriculumNode with type='subject'
    if (subjectIds.length > 0) {
      const foundSubjects = await CurriculumNode.countDocuments({
        _id: { $in: subjectIds },
        type: 'subject',
        isDeleted: false,
      });
      if (foundSubjects !== subjectIds.length) {
        throw new BadRequestError('One or more selected subjects are not valid CAPS subject nodes');
      }
    }

    // Validate each subject's parent grade matches what the teacher claimed
    if (subjectIds.length > 0) {
      const subjects = await CurriculumNode.find({
        _id: { $in: subjectIds },
        type: 'subject',
        isDeleted: false,
      }).select('_id gradeId').lean();

      const subjectGradeMap = new Map(
        subjects.map((s) => [String(s._id), String(s.gradeId)]),
      );

      for (const entry of input.subjectsByGrade) {
        for (const subjId of entry.subjectIds) {
          const actualGrade = subjectGradeMap.get(subjId);
          if (actualGrade !== entry.gradeId) {
            throw new BadRequestError(
              `Subject ${subjId} is not under grade ${entry.gradeId}`,
            );
          }
        }
      }
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      {
        $set: {
          teachingScope: {
            grades: gradeIds,
            subjectsByGrade: input.subjectsByGrade.map((g) => ({
              gradeId: new mongoose.Types.ObjectId(g.gradeId),
              subjectIds: g.subjectIds.map((id) => new mongoose.Types.ObjectId(id)),
            })),
          },
        },
      },
      { new: true },
    ).select('teachingScope schoolId').lean();

    if (!updated) throw new NotFoundError('User not found');

    // Eagerly materialise the matching school-side Grade and Subject rows
    // from the supplied curriculum nodes. Once these rows exist, every other
    // endpoint (papers, marks, timetable, etc.) sees a normal school Subject
    // and Grade — no more controller-level masking required.
    if (updated.schoolId) {
      const pairs = input.subjectsByGrade.flatMap((g) =>
        g.subjectIds.map((sid) => ({
          curriculumGradeId: g.gradeId,
          curriculumSubjectId: sid,
        })),
      );
      if (pairs.length > 0) {
        try {
          await materialiseTeachingScope(updated.schoolId, pairs);
        } catch (err: unknown) {
          // Log but don't fail the scope update — the lazy bridge at
          // paper-generation time covers this. We just lose the eagerness.
          logger.error(
            { err, userId, schoolId: updated.schoolId },
            'Failed to materialise teaching scope; relying on lazy bridge',
          );
        }
      }
    }

    return updated.teachingScope;
  }
}
