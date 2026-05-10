import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { Subject, Grade } from '../Academic/model.js';

/**
 * Resolves an academic Subject / Grade ObjectId to the set of CurriculumNode
 * ObjectIds (the matched ancestor plus all descendants) visible to the school.
 *
 * The Module 2 paper wizard sends academic Subject + Grade IDs from the
 * teacher's school to GET /curriculum-structure/nodes — but CurriculumNode
 * itself stores subject/grade as nodes (`type: 'subject' | 'grade'`) linked
 * through `parentId`. This helper bridges the two by matching the academic
 * record's `name` to a curriculum node's `title` (case-insensitive, exact),
 * then collects every descendant via the denormalized `subjectId` / `gradeId`
 * refs on each node (self-ref convention: the subject/grade node also has
 * `subjectId === _id` / `gradeId === _id`, so the find returns the matched
 * node AND its descendants in one query).
 *
 * Returns:
 *   - `undefined` when caller did not pass this filter (no constraint)
 *   - `null` when filter was passed but no nodes match (force empty result)
 *   - array of ObjectIds otherwise
 */
export async function resolveAcademicAncestor(
  academicId: string | undefined,
  modelType: 'subject' | 'grade',
  schoolOid: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId[] | null | undefined> {
  if (!academicId) return undefined;

  const academicOid = new mongoose.Types.ObjectId(academicId);
  const doc = modelType === 'subject'
    ? await Subject.findOne({ _id: academicOid, isDeleted: false }).select('name').lean()
    : await Grade.findOne({ _id: academicOid, isDeleted: false }).select('name').lean();
  if (!doc) return null;

  const escaped = doc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const titleRegex = new RegExp(`^${escaped}$`, 'i');
  const ancestorNodes = await CurriculumNode.find({
    type: modelType,
    title: titleRegex,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  }).select('_id').lean<{ _id: mongoose.Types.ObjectId }[]>();
  if (ancestorNodes.length === 0) return null;

  const ancestorIds = ancestorNodes.map((n: { _id: mongoose.Types.ObjectId }) => n._id);
  // Denormalized lookup: nodes carry subjectId/gradeId pointing at their
  // ancestor subject/grade (and the ancestor itself, by self-ref convention).
  // So a single find() returns the ancestor + every descendant.
  const denormField = modelType === 'subject' ? 'subjectId' : 'gradeId';
  const matches = await CurriculumNode.find({
    [denormField]: { $in: ancestorIds },
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: schoolOid }],
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId }[]>();

  if (matches.length === 0) return null;
  return matches.map((m: { _id: mongoose.Types.ObjectId }) => m._id);
}
