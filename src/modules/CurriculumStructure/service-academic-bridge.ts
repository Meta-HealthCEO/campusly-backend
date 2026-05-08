import mongoose from 'mongoose';
import { CurriculumNode } from './model.js';
import { Subject, Grade } from '../Academic/model.js';

/**
 * Resolves an academic Subject / Grade ObjectId to the set of CurriculumNode
 * ObjectIds (the matched ancestor plus all descendants) visible to the school.
 *
 * The Module 2 paper wizard sends academic Subject + Grade IDs from the
 * teacher's school to GET /curriculum-structure/nodes — but CurriculumNode
 * itself has no `subjectId` / `gradeId` fields. Instead the curriculum tree
 * stores subject/grade as nodes (`type: 'subject' | 'grade'`) linked through
 * `parentId`. This helper bridges the two by matching the academic record's
 * `name` to a curriculum node's `title` (case-insensitive, exact), then
 * `$graphLookup`s every descendant.
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
  }).select('_id').lean();
  if (ancestorNodes.length === 0) return null;

  const ancestorIds = ancestorNodes.map((n: { _id: mongoose.Types.ObjectId }) => n._id);
  const result = await CurriculumNode.aggregate([
    { $match: { _id: { $in: ancestorIds }, isDeleted: false } },
    {
      $graphLookup: {
        from: 'curriculumnodes',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        restrictSearchWithMatch: {
          isDeleted: false,
          $or: [{ schoolId: null }, { schoolId: schoolOid }],
        },
      },
    },
    { $project: { ids: { $concatArrays: [['$_id'], '$descendants._id'] } } },
  ]);

  const ids = new Set<string>();
  for (const row of result as Array<{ ids: mongoose.Types.ObjectId[] }>) {
    for (const id of row.ids) ids.add(id.toString());
  }
  if (ids.size === 0) return null;
  return Array.from(ids).map((s: string) => new mongoose.Types.ObjectId(s));
}
